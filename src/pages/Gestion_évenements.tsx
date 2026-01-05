//Connecté à l'api par arthur 


import React, { useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonList,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonText,
  IonAlert,
  IonModal,
  IonTextarea,
  IonDatetime,
  useIonRouter,
  useIonToast
} from '@ionic/react';
import { logOutOutline, personCircleOutline } from 'ionicons/icons';
import './Gestion_evenements.css';
import { addEventAdmin, createEvent, deleteEvent, getEvents, logout, updateEvent, type Event } from '../api';  // IMPORT API
import { useIsAuthenticated } from '../hooks/useAuth';

const userAssociations = ["Association Alpha", "Beta Events", "Gamma Group"];

const getActiveAssociation = () =>
  localStorage.getItem('activeAssociation') || 'Association Alpha';

const setActiveAssociation = (value: string) => {
  localStorage.setItem('activeAssociation', value);
  window.dispatchEvent(new StorageEvent('storage', { key: 'activeAssociation', newValue: value }));
};

const eventActions = [
  "Liste événements",
  "Modifier événement",
  "Supprimer événement",
  "Historique événements",
];

const Gestion_évenements: React.FC = () => {
  const activeAssociation = getActiveAssociation();
  const isAuthenticated = useIsAuthenticated();
  const [events, setEvents] = useState<Event[]>([]);
  const [showEvents, setShowEvents] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    date: '',
    location: ''
  });
  const [createError, setCreateError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [deletingEventId, setDeletingEventId] = useState<number | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [eventPendingDeletion, setEventPendingDeletion] = useState<Event | null>(null);
  const [adminEmailByEvent, setAdminEmailByEvent] = useState<Record<number, string>>({});
  const [adminRoleByEvent, setAdminRoleByEvent] = useState<Record<number, "OWNER" | "SCANNER_ONLY">>({});
  const [addingAdminForEventId, setAddingAdminForEventId] = useState<number | null>(null);
  const [present] = useIonToast();
  const router = useIonRouter();
  const forbiddenMessage = "Vous n'êtes pas administrateur de l'événement (nobod)";

  const isForbiddenError = (err: unknown) =>
    err instanceof Error && err.message.includes("403");

  const normalizeDateValue = (value: string | string[] | null | undefined): string => {
    if (typeof value === 'string') return value;
    if (Array.isArray(value)) return value[0] || '';
    return '';
  };

  const loadEvents = async () => {
    try {
      const data = await getEvents();
      setEvents(data);
      setEventsError(null);
    } catch (e) {
      console.error("Erreur lors du chargement des événements", e);
      setEventsError(isForbiddenError(e) ? forbiddenMessage : "Impossible de charger les événements");
    }
  };

  const handleActionClick = async (action: string) => {
    console.log(`Action cliquée: ${action}.`);

    if (action === "Liste événements") {
      await loadEvents();
      setShowEvents(true);
      setDeleteMode(false);
      setEditMode(false);
      setDeleteError(null);
    } else if (action === "Supprimer événement") {
      await loadEvents();
      setDeleteMode(true);
      setShowEvents(false);
      setEditMode(false);
      setDeleteError(null);
    } else if (action === "Modifier événement") {
      await loadEvents();
      setEditMode(true);
      setShowEvents(false);
      setDeleteMode(false);
      setDeleteError(null);
    } else {
      // Pour les autres actions, tu feras plus tard
      console.log(`Redirection à implémenter pour: ${action}`);
      setEditMode(false);
      setShowEvents(false);
      setDeleteMode(false);
      setDeleteError(null);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login", "root");
  };

  const resetCreateForm = () => {
    setCreateForm({
      name: '',
      description: '',
      date: '',
      location: ''
    });
    setCreateError(null);
  };

  const handleCreateSubmit = async () => {
    if (!createForm.name || !createForm.date || !createForm.location) {
      setCreateError('Nom, date et lieu sont requis.');
      return;
    }
    setIsSubmitting(true);
    try {
      await createEvent({
        name: createForm.name,
        description: createForm.description,
        date: createForm.date,
        location: createForm.location
      });
      present({ message: 'Événement créé', duration: 1500, color: 'success' });
      setCreateModalOpen(false);
      resetCreateForm();
      await loadEvents();
    } catch (e) {
      console.error('Erreur lors de la création de l’événement', e);
      setCreateError('Erreur lors de la création de l’événement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    setDeleteError(null);
    setDeletingEventId(eventId);
    try {
      await deleteEvent(eventId);
      setEvents(prev => prev.filter(ev => ev.id !== eventId));
      present({ message: "Événement supprimé", duration: 1500, color: "success" });
    } catch (e) {
      console.error("Erreur lors de la suppression de l’événement", e);
      setDeleteError(isForbiddenError(e) ? forbiddenMessage : "Erreur lors de la suppression de l’événement.");
    } finally {
      setDeletingEventId(null);
    }
  };

  const handleUpdateEvent = async (event: Event) => {
    if (!event.name || !event.location || !event.date) {
      present({ message: "Nom, date et lieu sont requis.", duration: 2000, color: "warning" });
      return;
    }

    try {
      await updateEvent(event.id, {
        name: event.name,
        description: event.description,
        date: new Date(event.date).toISOString(),
        location: event.location,
      });
      present({ message: 'Événement mis à jour !', duration: 1500, color: 'success' });
      await loadEvents();
      setEditingEventId(null); // Quitte le mode édition pour cette ligne
    } catch (e) {
      console.error("Erreur lors de la mise à jour de l'événement", e);
      present({
        message: isForbiddenError(e) ? forbiddenMessage : "Erreur lors de la mise à jour.",
        duration: 2000,
        color: 'danger'
      });
    }
  };

  const handleAddAdmin = async (eventId: number) => {
    const email = adminEmailByEvent[eventId]?.trim() || "";
    const role = adminRoleByEvent[eventId] || "SCANNER_ONLY";

    if (!email) {
      present({ message: "Email requis pour ajouter un admin.", duration: 1800, color: "warning" });
      return;
    }

    try {
      setAddingAdminForEventId(eventId);
      await addEventAdmin(eventId, email, role);
      present({ message: "Admin ajouté à l'événement", duration: 1500, color: "success" });
      setAdminEmailByEvent(prev => ({ ...prev, [eventId]: "" }));
      setAdminRoleByEvent(prev => ({ ...prev, [eventId]: "SCANNER_ONLY" }));
    } catch (e) {
      console.error("Erreur lors de l'ajout d'un admin", e);
      present({
        message: isForbiddenError(e) ? forbiddenMessage : "Impossible d'ajouter cet admin",
        duration: 2200,
        color: "danger",
      });
    } finally {
      setAddingAdminForEventId(null);
    }
  };

  const handleInputChange = (id: number, field: keyof Event, value: string) => {
    setEvents(
      events.map((event) =>
        event.id === id ? { ...event, [field]: value } : event
      ));
  };

  const userName = "Compte";

  if (!isAuthenticated) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Gestion d'événements</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Authentification requise</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonText>
                <p>Connecte-toi pour créer ou modifier des événements.</p>
              </IonText>
              <IonButton
                className="ion-margin-top"
                onClick={() =>
                  router.push(`/login?redirect=${encodeURIComponent("/app/Gestion_évenements")}`, "forward")
                }
              >
                Aller à la page de connexion
              </IonButton>
            </IonCardContent>
          </IonCard>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            {isAuthenticated ? (
              <IonItem lines="none" style={{'--padding-start': '0px', '--inner-padding-end': '0px'}}>
                <IonLabel class="ion-text-wrap" style={{ marginRight: '10px' }}>
                  <IonText color="dark">
                    <p style={{ margin: '0', fontWeight: 'bold' }}>{userName}</p>
                  </IonText>
                </IonLabel>

                <IonSelect
                  value={activeAssociation}
                  placeholder="Sélectionner"
                  interface="popover"
                  style={{ minWidth: '180px' }}
                  onIonChange={e => setActiveAssociation(e.detail.value!)}
                >
                  {userAssociations.map((association, index) => (
                    <IonSelectOption key={index} value={association}>
                      {association}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
            ) : (
              <IonButton
                fill="solid"
                color="primary"
                onClick={() =>
                  router.push(`/login?redirect=${encodeURIComponent("/app/Gestion_évenements")}`, "forward")
                }
              >
                Se connecter
              </IonButton>
            )}
          </IonButtons>

          <IonButtons slot="end">
            {isAuthenticated ? (
              <IonButton onClick={handleLogout}>
                <IonIcon icon={logOutOutline} slot="start" color="danger" size="large" />
                <IonIcon icon={personCircleOutline} size="large" />
              </IonButton>
            ) : (
              <IonIcon icon={personCircleOutline} size="large" color="medium" />
            )}
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonList style={{ padding: '10px' }}>
          <IonHeader collapse="condense">
            <IonToolbar>
              <IonTitle size="large">Gestion d'événements</IonTitle>
            </IonToolbar>
          </IonHeader>

          <IonButton
            expand="block"
            onClick={() => {
              resetCreateForm();
              setCreateModalOpen(true);
              setDeleteMode(false);
              setEditMode(false);
              setShowEvents(false);
              setDeleteError(null);
            }}
          >
            Créer un événement
          </IonButton>

          {eventsError && (
            <IonText color="danger" className="ion-margin-top">
              <p>{eventsError}</p>
            </IonText>
          )}

          {eventActions.map((action, index) => (
            <IonCard
              key={index}
              button
              onClick={() => handleActionClick(action)}
              style={{
                margin: '10px 0',
                width: '100%',
                backgroundColor: '#f4f4f4',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              <IonCardContent className="ion-text-center">
                <IonLabel>
                  <h2 style={{ margin: '0', fontWeight: 'bold' }}>{action}</h2>
                </IonLabel>
              </IonCardContent>
            </IonCard>
          ))}

          {/* 👇 Affichage des événements récupérés */}
          {showEvents && events.map((event) => (
            <IonCard key={event.id}>
              <IonCardContent>
                <IonLabel>
                  <h2>{event.name}</h2>
                  <p>{event.date} — {event.location}</p>
                  <p>{event.description}</p>
                </IonLabel>
              </IonCardContent>
            </IonCard>
          ))}

          {/* 👇 Affichage pour la modification des événements */}
          {editMode && (
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Modifier un événement</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                {events.length === 0 ? (
                  <IonText>Aucun événement à modifier.</IonText>
                ) : (
                  <IonList>
                    {events.map((event) => (
                      <React.Fragment key={event.id}>
                      <IonItem>
                        {editingEventId === event.id ? (
                          <div style={{ width: '100%', padding: '10px 0' }}>
                            <IonInput
                              label="Nom" labelPlacement="stacked"
                              value={event.name}
                              onIonChange={(e) => handleInputChange(event.id, 'name', e.detail.value!)}
                            />
                            <IonInput
                              label="Lieu"
                              labelPlacement="stacked"
                              value={event.location}
                              onIonChange={(e) => handleInputChange(event.id, 'location', e.detail.value!)}
                              className="ion-margin-top"
                            />
                            <IonDatetime
                              presentation="date-time"
                              value={event.date}
                              onIonChange={(e) =>
                                handleInputChange(
                                  event.id,
                                  'date',
                                  normalizeDateValue(e.detail.value)
                                )
                              }
                              className="ion-margin-top"
                            />
                            <IonTextarea
                              label="Description"
                              labelPlacement="stacked"
                              value={event.description}
                              onIonChange={(e) => handleInputChange(event.id, 'description', e.detail.value!)}
                              className="ion-margin-top"
                              autoGrow={true}
                            />
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                              <IonButton onClick={() => handleUpdateEvent(event)}>
                                Sauvegarder
                              </IonButton>
                              <IonButton fill="clear" onClick={() => setEditingEventId(null)}>
                                Annuler
                              </IonButton>
                            </div>
                          </div>
                        ) : (
                          <>
                          <IonLabel>
                            <h2>{event.name}</h2>
                            <p>{new Date(event.date).toLocaleString('fr-FR')} - {event.location}</p>
                          </IonLabel>
                            <IonButton fill="clear" onClick={() => setEditingEventId(event.id)} slot="end">Modifier</IonButton>
                          </>
                        )}
                      </IonItem>
                      {editingEventId === event.id && (
                        <div style={{ padding: '10px 14px 20px', borderTop: '1px solid #e0e0e0' }}>
                          <IonLabel>
                            <h3 style={{ fontWeight: 'bold', marginBottom: '8px' }}>Ajouter un admin</h3>
                          </IonLabel>
                          <IonInput
                            label="Email de l'admin"
                            labelPlacement="stacked"
                            value={adminEmailByEvent[event.id] || ''}
                            onIonChange={(e) =>
                              setAdminEmailByEvent(prev => ({ ...prev, [event.id]: e.detail.value || '' }))
                            }
                            placeholder="admin@example.com"
                            className="ion-margin-bottom"
                          />
                          <IonSelect
                            label="Rôle"
                            labelPlacement="stacked"
                            value={adminRoleByEvent[event.id] || 'SCANNER_ONLY'}
                            onIonChange={(e) =>
                              setAdminRoleByEvent(prev => ({
                                ...prev,
                                [event.id]: (e.detail.value as "OWNER" | "SCANNER_ONLY") || "SCANNER_ONLY",
                              }))
                            }
                            interface="popover"
                          >
                            <IonSelectOption value="SCANNER_ONLY">Scanner uniquement</IonSelectOption>
                            <IonSelectOption value="OWNER">Owner</IonSelectOption>
                          </IonSelect>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                            <IonButton
                              onClick={() => handleAddAdmin(event.id)}
                              disabled={addingAdminForEventId === event.id}
                            >
                              {addingAdminForEventId === event.id ? 'Ajout...' : 'Ajouter un admin'}
                            </IonButton>
                          </div>
                        </div>
                      )}
                      </React.Fragment>
                    ))}
                  </IonList>
                )}
              </IonCardContent>
            </IonCard>
          )}

          {deleteMode && (
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Supprimer un événement</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                {deleteError && (
                  <IonText color="danger">
                    <p>{deleteError}</p>
                  </IonText>
                )}
                {events.length === 0 ? (
                  <IonText>Aucun événement à afficher.</IonText>
                ) : (
                  events.map(event => (
                    <IonItem key={event.id}>
                      <IonLabel>
                        <h2>{event.name}</h2>
                        <p>{event.date} — {event.location}</p>
                      </IonLabel>
                    <IonButton
                      slot="end"
                      color="danger"
                      onClick={() => setEventPendingDeletion(event)}
                      disabled={deletingEventId === event.id}
                    >
                      {deletingEventId === event.id ? 'Suppression...' : "Supprimer l'événement"}
                    </IonButton>
                    </IonItem>
                  ))
                )}
              </IonCardContent>
            </IonCard>
          )}
        </IonList>
      </IonContent>

      <IonAlert
        isOpen={Boolean(eventPendingDeletion)}
        header="Supprimer l'événement"
        message={`Voulez-vous vraiment supprimer "${eventPendingDeletion?.name || ''}" ?`}
        buttons={[
          {
            text: 'Non',
            role: 'cancel',
            handler: () => setEventPendingDeletion(null)
          },
          {
            text: 'Oui',
            handler: () => {
              const eventId = eventPendingDeletion?.id;
              setEventPendingDeletion(null);
              if (eventId != null) {
                handleDeleteEvent(eventId);
              }
            }
          }
        ]}
        onDidDismiss={() => setEventPendingDeletion(null)}
      />

      <IonModal
        isOpen={createModalOpen}
        onDidDismiss={() => {
          setCreateModalOpen(false);
          resetCreateForm();
        }}
      >
        <IonHeader>
          <IonToolbar>
            <IonTitle>Créer un événement</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonList>
            <IonItem>
              <IonLabel position="stacked">Nom</IonLabel>
              <IonInput
                value={createForm.name}
                placeholder="Nom de l'événement"
                onIonChange={e => setCreateForm(prev => ({ ...prev, name: e.detail.value || '' }))}
              />
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">Date</IonLabel>
              <IonDatetime
                presentation="date-time"
                value={createForm.date}
                onIonChange={e =>
                  setCreateForm(prev => ({
                    ...prev,
                    date: normalizeDateValue(e.detail.value)
                  }))
                }
              />
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">Lieu</IonLabel>
              <IonInput
                value={createForm.location}
                placeholder="Lieu"
                onIonChange={e => setCreateForm(prev => ({ ...prev, location: e.detail.value || '' }))}
              />
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">Description</IonLabel>
              <IonTextarea
                autoGrow
                value={createForm.description}
                placeholder="Description"
                onIonChange={e => setCreateForm(prev => ({ ...prev, description: e.detail.value || '' }))}
              />
            </IonItem>
          </IonList>

          {createError && (
            <IonText color="danger">
              <p>{createError}</p>
            </IonText>
          )}

          <div className="ion-margin-top">
            <IonButton
              expand="block"
              onClick={handleCreateSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Création...' : 'Créer'}
            </IonButton>
            <IonButton
              expand="block"
              fill="clear"
              onClick={() => {
                setCreateModalOpen(false);
                resetCreateForm();
              }}
            >
              Annuler
            </IonButton>
          </div>
        </IonContent>
      </IonModal>
    </IonPage>
  );
};

export default Gestion_évenements;

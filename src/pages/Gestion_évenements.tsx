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
  IonModal,
  IonTextarea,
  IonDatetime,
  useIonRouter,
  useIonToast
} from '@ionic/react';
import { logOutOutline, personCircleOutline } from 'ionicons/icons';
import './Gestion_évenements.css';
import { createEvent, getEvents, logout, type Event } from '../api';  // IMPORT API
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
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    date: '',
    location: ''
  });
  const [createError, setCreateError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [present] = useIonToast();
  const router = useIonRouter();

  const normalizeDateValue = (value: string | string[] | null | undefined): string => {
    if (typeof value === 'string') return value;
    if (Array.isArray(value)) return value[0] || '';
    return '';
  };

  const loadEvents = async () => {
    try {
      const data = await getEvents();
      setEvents(data);
      setShowEvents(true);
    } catch (e) {
      console.error("Erreur lors du chargement des événements", e);
      setCreateError("Impossible de charger les événements");
    }
  };

  const handleActionClick = async (action: string) => {
    console.log(`Action cliquée: ${action}.`);

    if (action === "Liste événements") {
      await loadEvents();
    } else {
      // Pour les autres actions, tu feras plus tard
      console.log(`Redirection à implémenter pour: ${action}`);
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
            }}
          >
            Créer un événement
          </IonButton>

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
        </IonList>
      </IonContent>

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

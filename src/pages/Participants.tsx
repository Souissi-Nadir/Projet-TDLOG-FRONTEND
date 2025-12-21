//test de la com avec le backend 
import {
  Event as BackendEvent,
  EventParticipant,
  EventTicket,
  createEventParticipant,
  createStudent,
  deleteEventParticipant,
  getEventParticipants,
  getEvents,
  getHealth,
  getEventTickets,
  getStudents,
  searchStudents,
  Student,
  updateEventParticipant,
} from '../api';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonInput,
  IonButton,
  IonLabel,
  IonItem,
  IonList,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonSelect,
  IonSelectOption,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButtons,
  IonText,
  useIonToast,
  useIonRouter
} from '@ionic/react';
import { trash, mail, createOutline } from 'ionicons/icons';
import Papa from 'papaparse';
import { QRCodeCanvas } from 'qrcode.react';
import './Participants.css';
import { useIsAuthenticated } from '../hooks/useAuth';

type ParticipantFormState = {
  last_name: string;
  first_name: string;
  promo: string;
  email: string;
  tarif: string;
};

const statusLabel = (status?: string | null) => {
  switch ((status || '').toUpperCase()) {
    case 'SCANNED':
      return 'Scanné';
    case 'UNUSED':
      return 'Non scanné';
    default:
      return status || 'Inconnu';
  }
};

const statusClass = (status?: string | null) => {
  switch ((status || '').toUpperCase()) {
    case 'SCANNED':
      return 'status-scanned';
    case 'UNUSED':
      return 'status-unused';
    default:
      return 'status-unknown';
  }
};

const formatScanDate = (iso?: string | null) => {
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleString();
};

const Participants: React.FC = () => {
  const isAuthenticated = useIsAuthenticated();
  const router = useIonRouter();
  const [participants, setParticipants] = useState<EventParticipant[]>([]);
  const [participantsLoading, setParticipantsLoading] = useState<boolean>(false);
  const [participantsError, setParticipantsError] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<string>('chargement...'); //test backend
  // Base de donnée "globale" (students du backend)
  const [dbStudents, setDbStudents] = useState<Student[]>([]);
  const [dbLoading, setDbLoading] = useState<boolean>(true);
  const [dbError, setDbError] = useState<string | null>(null);

  // Autocomplétion étudiants
  const [studentQuery, setStudentQuery] = useState<string>('');
  const [studentOptions, setStudentOptions] = useState<Student[]>([]);
  const [studentSearching, setStudentSearching] = useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const [form, setForm] = useState<ParticipantFormState>({
    last_name: '',
    first_name: '',
    promo: '',
    email: '',
    tarif: '',
  });
  const [present] = useIonToast();

  // Bandeau événement
  const [events, setEvents] = useState<BackendEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState<boolean>(false);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const selectedEvent = useMemo(
    () => events.find(ev => ev.id === selectedEventId) || null,
    [events, selectedEventId]
  );
  const isDatabaseView = selectedEventId === null;
  const selectedEventLabel = isDatabaseView
    ? 'Base de donnée'
    : selectedEvent?.name || 'Sélectionnez un événement';

  // Édition : ligne en cours d’édition (id) ou null
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setEvents([]);
      setEventsError(null);
      setEventsLoading(false);
      setSelectedEventId(null);
      return;
    }
    setEventsLoading(true);
    getEvents()
      .then(data => {
        setEvents(data);
        setEventsError(null);
        setSelectedEventId(prev => (prev === null && data.length > 0 ? data[0].id : prev));
      })
      .catch(err => {
        console.error(err);
        setEventsError('Erreur lors du chargement des événements');
      })
      .finally(() => setEventsLoading(false));
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setBackendStatus('non connecté');
      return;
    }
    getHealth()
      .then((data) => {
        // si ton backend renvoie { "status": "ok" }
        setBackendStatus(data.status || 'ok');
      })
      .catch((err) => {
        console.error(err);
        setBackendStatus('erreur');
      });
  }, [isAuthenticated]);

  // Charger la base de donnée des étudiants (table students du backend)
  useEffect(() => {
    if (!isAuthenticated) {
      setDbStudents([]);
      setDbError(null);
      setDbLoading(false);
      return;
    }
    setDbLoading(true);
    getStudents()
      .then((data) => {
        setDbStudents(data);
        setDbError(null);
      })
      .catch((err) => {
        console.error(err);
        setDbError("Erreur lors du chargement de la base de donnée");
      })
      .finally(() => setDbLoading(false));
  }, [isAuthenticated]);

  const refreshParticipants = useCallback(async () => {
    if (!isAuthenticated || selectedEventId === null) {
      setParticipants([]);
      setParticipantsError(null);
      setParticipantsLoading(false);
      return;
    }
    setParticipantsLoading(true);
    try {
      const [data, tickets] = await Promise.all([
        getEventParticipants(selectedEventId),
        getEventTickets(selectedEventId),
      ]);

      const ticketByQr = new Map<string, EventTicket>();
      tickets.forEach(t => ticketByQr.set(t.qr_code_token, t));

      const merged = data.map(p => {
        const t = ticketByQr.get(p.qr_code);
        return t
          ? { ...p, status: t.status, scanned_at: t.scanned_at }
          : p;
      });

      setParticipants(merged);
      setParticipantsError(null);
    } catch (err) {
      console.error(err);
      setParticipantsError('Erreur lors du chargement des participants');
    } finally {
      setParticipantsLoading(false);
    }
  }, [isAuthenticated, selectedEventId]);

  useEffect(() => {
    refreshParticipants();
  }, [refreshParticipants]);

  const fetchStudentOptions = useCallback(async (query: string) => {
    if (!isAuthenticated) return;
    const trimmed = query.trim();
    if (!trimmed) {
      setStudentOptions([]);
      return;
    }
    setStudentSearching(true);
    try {
      const res = await searchStudents(trimmed);
      const sorted = [...res].sort((a, b) => {
        const la = `${a.last_name} ${a.first_name}`.toLowerCase();
        const lb = `${b.last_name} ${b.first_name}`.toLowerCase();
        return la.localeCompare(lb);
      });
      setStudentOptions(sorted);
    } catch (err) {
      console.error(err);
      setStudentOptions([]);
    } finally {
      setStudentSearching(false);
    }
  }, [isAuthenticated]);

  const handleStudentQueryChange = (value: string) => {
    setStudentQuery(value);
    setSelectedStudent(null);
    void fetchStudentOptions(value);
  };

  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    setStudentQuery(`${student.last_name} ${student.first_name}`);
    setForm(form => ({
      ...form,
      last_name: student.last_name,
      first_name: student.first_name,
      email: student.email,
    }));
  };

  const ensureStudentExists = useCallback(async () => {
    if (!isAuthenticated) return;
    if (selectedStudent) return; // déjà dans la base
    if (!form.first_name || !form.last_name || !form.email) return;
    try {
      await createStudent({
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
      });
    } catch (err) {
      console.error('createStudent failed', err);
    }
  }, [form.first_name, form.last_name, form.email, isAuthenticated, selectedStudent]);


  // Ajouter manuellement
  const addParticipant = async () => {
    if (!selectedEventId) {
      present({ message: 'Sélectionne un événement avant d\'ajouter un participant.', duration: 2000, color: 'warning' });
      return;
    }
    if (!form.last_name || !form.first_name) {
      present({ message: 'Nom et prénom sont requis.', duration: 1800, color: 'warning' });
      return;
    }
    try {
      await ensureStudentExists();
      await createEventParticipant(selectedEventId, {
        first_name: form.first_name,
        last_name: form.last_name,
        promo: form.promo || undefined,
        email: form.email || undefined,
        tarif: form.tarif || undefined,
      });
      setForm({ last_name: '', first_name: '', promo: '', email: '', tarif: '' });
      await refreshParticipants();
      present({ message: 'Participant ajouté', duration: 1200, color: 'success' });
    } catch (err) {
      console.error(err);
      present({ message: 'Impossible d\'ajouter le participant', duration: 2000, color: 'danger' });
    }
  };

  // Supprimer
  const deleteParticipantLocal = async (id: number) => {
    if (!selectedEventId) return;
    try {
      await deleteEventParticipant(selectedEventId, id);
      if (editingId === id) setEditingId(null);
      await refreshParticipants();
      present({ message: 'Participant supprimé', duration: 1200, color: 'success' });
    } catch (err) {
      console.error(err);
      present({ message: 'Suppression impossible', duration: 2000, color: 'danger' });
    }
  };

  // Import CSV
  const handleCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedEventId) {
      present({ message: 'Sélectionne un événement avant l\'import CSV.', duration: 2000, color: 'warning' });
      return;
    }
    if (e.target.files && e.target.files[0]) {
      Papa.parse(e.target.files[0], {
        header: true,
        skipEmptyLines: true,
        complete: async (results: Papa.ParseResult<Record<string, string>>) => {
          const rows = results.data.filter(row => (row.nom || row.prenom));
          let created = 0;
          for (const row of rows) {
            try {
              await createEventParticipant(selectedEventId, {
                last_name: (row.nom || '').trim() || 'Inconnu',
                first_name: (row.prenom || '').trim() || 'Inconnu',
                promo: (row.promo || row.annee || '').trim() || undefined,
                email: (row.email || '').trim() || undefined,
                tarif: (row.tarif || '').trim() || undefined,
              });
              created += 1;
            } catch (err) {
              console.error('Erreur lors de l\'import d\'une ligne', err);
            }
          }
          await refreshParticipants();
          e.currentTarget.value = '';
          present({ message: `${created} participants importés`, duration: 1800, color: 'success' });
        }
      });
    }
  };

  // Envoyer mail (placeholder)
  const sendMail = (p: EventParticipant) => {
    alert(`Mail envoyé à ${p.email || 'contact inconnu'} avec le QR code: ${p.qr_code}`);
  };

  type EditableParticipantField = 'last_name' | 'first_name' | 'promo' | 'email' | 'tarif';

  // Mettre à jour inline (seulement si en édition)
  const updateParticipantField = (id: number, field: EditableParticipantField, value: string) => {
    if (editingId !== id) return; // verrouillé tant que pas en mode édition
    setParticipants(prev => prev.map(p => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const startEdit = (id: number) => setEditingId(id);
  const stopEdit = async () => {
    if (editingId === null) return;
    const current = participants.find(p => p.id === editingId);
    setEditingId(null);
    if (!current || !selectedEventId) return;

    try {
      await updateEventParticipant(selectedEventId, current.id, {
        last_name: current.last_name,
        first_name: current.first_name,
        promo: current.promo || undefined,
        email: current.email || undefined,
        tarif: current.tarif || undefined,
      });
      present({ message: 'Participant mis à jour', duration: 1200, color: 'success' });
    } catch (err) {
      console.error(err);
      present({ message: 'Impossible de mettre à jour', duration: 2000, color: 'danger' });
      refreshParticipants();
    }
  };

  if (!isAuthenticated) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar className="participants-toolbar">
            <IonTitle>Participants</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Authentification requise</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonText>
                <p>Connecte-toi pour gérer les participants et accéder aux bases de données.</p>
              </IonText>
              <IonButton
                className="ion-margin-top"
                onClick={() =>
                  router.push(`/login?redirect=${encodeURIComponent("/app/Participants")}`, "forward")
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
        <IonToolbar className="participants-toolbar">
          <IonTitle>Participants</IonTitle>
          {/* Bandeau : Sélecteur d’événement */}
          <IonButtons slot="end" className="participants-toolbar-right">
            <IonItem lines="none" className="toolbar-selects">
              <IonLabel position="stacked" className="toolbar-label">Événement</IonLabel>
              <IonSelect
                value={isDatabaseView ? 'database' : selectedEventId?.toString()}
                placeholder={eventsLoading ? 'Chargement...' : 'Choisir un événement'}
                interface="popover"
                disabled={eventsLoading}
                onIonChange={e => {
                  const value = e.detail.value;
                  if (value === 'database') {
                    setSelectedEventId(null);
                    return;
                  }
                  const numericValue = Number(value);
                  if (!Number.isNaN(numericValue)) {
                    setSelectedEventId(numericValue);
                  }
                }}
              >
                <IonSelectOption value="database">Base de donnée</IonSelectOption>
                {events.map(ev => (
                  <IonSelectOption key={ev.id} value={ev.id.toString()}>
                    {ev.name}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
            {eventsError && (
              <IonText color="danger" className="toolbar-error">
                {eventsError}
              </IonText>
            )}
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="participants-content">
        {/* Titre de la page / nom de l’événement */}
        <div className="event-title-wrap">
          <IonText color="dark">
            <h1 className="event-title">{selectedEventLabel}</h1>
          </IonText>
        </div>

        {/* Bloc 1 : Formulaire manuel */}
        <IonCard className="block-card">
          <IonCardHeader>
            <IonCardTitle>Ajout manuel</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonList className="manual-form-list">
              <IonItem>
                <IonInput
                  label="Nom"
                  labelPlacement="floating"
                  placeholder="Nom"
                  value={form.last_name}
                  onIonChange={e => {
                    const v = e.detail.value || '';
                    setForm({ ...form, last_name: v });
                    setStudentQuery(v);
                    handleStudentQueryChange(v);
                  }}
                />
              </IonItem>
              <div className="autocomplete-hint">
                {studentQuery
                  ? studentSearching
                    ? 'Recherche...'
                    : studentOptions.length === 0
                    ? 'Aucun résultat'
                    : 'Clique sur un étudiant pour pré-remplir'
                  : 'Tape un nom pour chercher dans la base'}
              </div>
              {studentOptions.length > 0 && (
                <div className="autocomplete-list">
                  {studentOptions.map(s => (
                    <button
                      type="button"
                      key={s.id}
                      className="autocomplete-item"
                      onClick={() => handleSelectStudent(s)}
                    >
                      <div className="autocomplete-name">{s.last_name} {s.first_name}</div>
                      <div className="autocomplete-email">{s.email}</div>
                    </button>
                  ))}
                </div>
              )}
              <IonItem>
                <IonInput
                  label="Prénom"
                  labelPlacement="floating"
                  placeholder="Prénom"
                  value={form.first_name}
                  onIonChange={e => setForm({ ...form, first_name: e.detail.value || '' })}
                />
              </IonItem>
              <IonItem>
                <IonInput
                  label="Promo"
                  labelPlacement="floating"
                  placeholder="Promo"
                  value={form.promo}
                  onIonChange={e => setForm({ ...form, promo: e.detail.value || '' })}
                />
              </IonItem>
              <IonItem>
                <IonInput
                  label="Email"
                  labelPlacement="floating"
                  placeholder="email@example.com"
                  type="email"
                  value={form.email}
                  onIonChange={e => setForm({ ...form, email: e.detail.value || '' })}
                />
              </IonItem>
              <IonItem>
                <IonInput
                  label="Tarif"
                  labelPlacement="floating"
                  placeholder="€"
                  value={form.tarif}
                  onIonChange={e => setForm({ ...form, tarif: e.detail.value || '' })}
                />
              </IonItem>

              <div className="form-actions">
                <IonButton onClick={() => void addParticipant()}>Ajouter</IonButton>
              </div>
            </IonList>
          </IonCardContent>
        </IonCard>

        {/* Bloc 2 : Import CSV */}
        <IonCard className="block-card">
          <IonCardHeader>
            <IonCardTitle>Importer depuis un CSV</IonCardTitle>
          </IonCardHeader>

          <IonCardContent>
            <div className="csv-dropzone">
              <label htmlFor="csvUpload" className="csv-button">
                Choisir un fichier CSV
              </label>
              <input
                id="csvUpload"
                className="csv-input-hidden"
                type="file"
                accept=".csv"
                onChange={handleCSV}
              />
            </div>

            <div className="csv-help">
              <IonText>
                <small>Entêtes attendues : <b>nom, prenom, promo, email, tarif</b></small>
              </IonText>
            </div>
          </IonCardContent>
        </IonCard>
        
        {/* Bloc 3 : soit base de donnée, soit participants de l'événement */}
        <IonCard className="block-card">
          <IonCardHeader>
            <IonCardTitle>
              {isDatabaseView
                ? 'Base de donnée des étudiants'
                : 'Liste des participants'}
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {isDatabaseView ? (
              // ========= MODE BASE DE DONNÉE =========
              dbLoading ? (
                <IonText>Chargement...</IonText>
              ) : dbError ? (
                <IonText color="danger">{dbError}</IonText>
              ) : dbStudents.length === 0 ? (
                <IonText>Aucun étudiant dans la base.</IonText>
              ) : (
                <div className="table-wrapper">
                  <IonGrid className="participants-table" fixed>
                    <IonRow className="table-header">
                      <IonCol>Nom</IonCol>
                      <IonCol>Prénom</IonCol>
                      <IonCol>Email</IonCol>
                      <IonCol>Type</IonCol>
                    </IonRow>

                    {dbStudents.map((s, idx) => (
                      <IonRow
                        key={s.id}
                        className={idx % 2 ? 'table-row odd' : 'table-row'}
                      >
                        <IonCol>{s.last_name}</IonCol>
                        <IonCol>{s.first_name}</IonCol>
                        <IonCol>{s.email}</IonCol>
                        <IonCol>{s.is_external ? 'Extérieur' : 'Élève ENPC'}</IonCol>
                      </IonRow>
                    ))}
                  </IonGrid>
                </div>
              )
            ) : participantsLoading ? (
              <IonText>Chargement des participants...</IonText>
            ) : participantsError ? (
              <IonText color="danger">{participantsError}</IonText>
            ) : participants.length === 0 ? (
              <IonText>Aucun participant pour cet événement.</IonText>
            ) : (
              // ========= MODE PARTICIPANTS =========
              <>
                <div className="table-actions">
                  <IonButton
                    size="small"
                    fill="outline"
                    onClick={() => void refreshParticipants()}
                    disabled={participantsLoading}
                  >
                    Rafraîchir
                  </IonButton>
                </div>
                <div className="table-wrapper">
                  <IonGrid className="participants-table" fixed>
                    <IonRow className="table-header">
                      <IonCol>Nom</IonCol>
                      <IonCol>Prénom</IonCol>
                      <IonCol>Promo</IonCol>
                      <IonCol>Email</IonCol>
                      <IonCol className="col-tarif">Tarif</IonCol>
                      <IonCol className="col-status">Statut</IonCol>
                      <IonCol className="col-qr">QR</IonCol>
                      <IonCol className="col-actions">Actions</IonCol>
                    </IonRow>

                    {participants.map((p, idx) => {
                      const locked = editingId !== p.id; // true => lecture seule
                      return (
                        <IonRow
                          key={p.id}
                          className={idx % 2 ? 'table-row odd' : 'table-row'}
                        >
                          <IonCol>
                            <IonInput
                              value={p.last_name}
                              disabled={locked}
                              className={locked ? 'locked' : ''}
                              onIonChange={e =>
                                updateParticipantField(p.id, 'last_name', e.detail.value || '')
                              }
                            />
                          </IonCol>
                          <IonCol>
                            <IonInput
                              value={p.first_name}
                              disabled={locked}
                              className={locked ? 'locked' : ''}
                              onIonChange={e =>
                                updateParticipantField(p.id, 'first_name', e.detail.value || '')
                              }
                            />
                          </IonCol>
                          <IonCol>
                            <IonInput
                              value={p.promo || ''}
                              disabled={locked}
                              className={locked ? 'locked' : ''}
                              onIonChange={e =>
                                updateParticipantField(p.id, 'promo', e.detail.value || '')
                              }
                            />
                          </IonCol>
                          <IonCol>
                            <IonInput
                              value={p.email || ''}
                              disabled={locked}
                              className={locked ? 'locked' : ''}
                              onIonChange={e =>
                                updateParticipantField(p.id, 'email', e.detail.value || '')
                              }
                            />
                          </IonCol>
                          <IonCol className="col-tarif">
                            <IonInput
                              value={p.tarif || ''}
                              disabled={locked}
                              className={locked ? 'locked' : ''}
                              onIonChange={e =>
                                updateParticipantField(p.id, 'tarif', e.detail.value || '')
                              }
                            />
                          </IonCol>
                          <IonCol className="col-status">
                            <div className={`status-chip ${statusClass(p.status)}`}>
                              {statusLabel(p.status)}
                            </div>
                            {p.scanned_at ? (
                              <div className="status-meta">Scanné le {formatScanDate(p.scanned_at)}</div>
                            ) : (
                              <div className="status-meta muted">En attente de scan</div>
                            )}
                          </IonCol>
                          <IonCol className="col-qr">
                            <div className="qr-wrap">
                              <QRCodeCanvas
                                value={p.qr_code}
                                size={56}
                              />
                            </div>
                          </IonCol>
                          <IonCol className="col-actions">
                            {locked ? (
                              <IonButton
                                fill="clear"
                                onClick={() => startEdit(p.id)}
                                title="Modifier"
                              >
                                <IonIcon icon={createOutline} />
                              </IonButton>
                            ) : (
                              <IonButton
                                fill="clear"
                                color="medium"
                                onClick={() => void stopEdit()}
                                title="Terminer"
                              >
                                Terminer
                              </IonButton>
                            )}
                            <IonButton
                              color="primary"
                              fill="clear"
                              onClick={() => sendMail(p)}
                              title="Envoyer par mail"
                            >
                              <IonIcon icon={mail} />
                            </IonButton>
                            <IonButton
                              color="danger"
                              fill="clear"
                              onClick={() => void deleteParticipantLocal(p.id)}
                              title="Supprimer"
                            >
                              <IonIcon icon={trash} />
                            </IonButton>
                          </IonCol>
                        </IonRow>
                      );
                    })}
                  </IonGrid>
                </div>
              </>
            )}
          </IonCardContent>
        </IonCard>

        
      </IonContent>
    </IonPage>
  );
};

export default Participants;

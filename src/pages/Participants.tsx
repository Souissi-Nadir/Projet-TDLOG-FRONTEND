/*
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './Participants.css';

const Participants: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Participants</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Participants</IonTitle>
          </IonToolbar>
        </IonHeader>
        <ExploreContainer name="Participants page" />
      </IonContent>
    </IonPage>
  );
};

export default Participants;
*/

import React, { useState } from 'react';
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
  IonIcon
} from '@ionic/react';
import { trash, mail } from 'ionicons/icons';
import Papa from 'papaparse';
import QRCode from 'qrcode.react';
import './Participants.css';

interface Participant {
  id: number;
  nom: string;
  prenom: string;
  promo: string;
  email: string;
  tarif: string;
  qrCode?: string;
}

let nextId = 1;

const Participants: React.FC = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [form, setForm] = useState({ nom: '', prenom: '', promo: '', email: '', tarif: '' });

  // Ajouter manuellement
  const addParticipant = () => {
    if (!form.nom || !form.prenom) return;
    const newParticipant: Participant = { id: nextId++, ...form, qrCode: `${form.nom}-${Date.now()}` };
    setParticipants([...participants, newParticipant]);
    setForm({ nom: '', prenom: '', promo: '', email: '', tarif: '' });
  };

  // Supprimer
  const deleteParticipant = (id: number) => {
    setParticipants(participants.filter(p => p.id !== id));
  };

  // Import CSV
  const handleCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      Papa.parse(e.target.files[0], {
        header: true,
        skipEmptyLines: true,
        complete: (results: any) => {
          const imported: Participant[] = results.data.map((row: any) => ({
            id: nextId++,
            nom: row.nom,
            prenom: row.prenom,
            promo: row.promo,
            email: row.email,
            tarif: row.tarif,
            qrCode: `${row.nom}-${Date.now()}`
          }));
          setParticipants([...participants, ...imported]);
        }
      });
    }
  };

  // Envoyer mail (placeholder)
  const sendMail = (p: Participant) => {
    alert(`Mail envoyé à ${p.email} avec le QR code: ${p.qrCode}`);
  };

  // Mettre à jour inline
  const updateParticipant = (id: number, field: keyof Participant, value: string) => {
    setParticipants(participants.map(p => (p.id === id ? { ...p, [field]: value } : p)));
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Participants</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Participants</IonTitle>
          </IonToolbar>
        </IonHeader>

        {/* Formulaire manuel */}
        <IonList>
          <IonItem>
            <IonInput placeholder="Nom" value={form.nom} onIonChange={e => setForm({...form, nom: e.detail.value!})} />
            <IonInput placeholder="Prénom" value={form.prenom} onIonChange={e => setForm({...form, prenom: e.detail.value!})} />
            <IonInput placeholder="Promo" value={form.promo} onIonChange={e => setForm({...form, promo: e.detail.value!})} />
            <IonInput placeholder="Email" value={form.email} onIonChange={e => setForm({...form, email: e.detail.value!})} />
            <IonInput placeholder="Tarif" value={form.tarif} onIonChange={e => setForm({...form, tarif: e.detail.value!})} />
            <IonButton onClick={addParticipant}>Ajouter</IonButton>
          </IonItem>
        </IonList>

        {/* Import CSV */}
        <IonItem>
          <IonLabel>Importer CSV :</IonLabel>
          <input type="file" accept=".csv" onChange={handleCSV} />
        </IonItem>

        {/* Tableau récapitulatif éditable */}
        <IonGrid>
          <IonRow>
            <IonCol>Nom</IonCol>
            <IonCol>Prénom</IonCol>
            <IonCol>Promo</IonCol>
            <IonCol>Email</IonCol>
            <IonCol>Tarif</IonCol>
            <IonCol>QR</IonCol>
            <IonCol>Actions</IonCol>
          </IonRow>
          {participants.map(p => (
            <IonRow key={p.id}>
              <IonCol>
                <IonInput value={p.nom} onIonChange={e => updateParticipant(p.id, 'nom', e.detail.value!)} />
              </IonCol>
              <IonCol>
                <IonInput value={p.prenom} onIonChange={e => updateParticipant(p.id, 'prenom', e.detail.value!)} />
              </IonCol>
              <IonCol>
                <IonInput value={p.promo} onIonChange={e => updateParticipant(p.id, 'promo', e.detail.value!)} />
              </IonCol>
              <IonCol>
                <IonInput value={p.email} onIonChange={e => updateParticipant(p.id, 'email', e.detail.value!)} />
              </IonCol>
              <IonCol>
                <IonInput value={p.tarif} onIonChange={e => updateParticipant(p.id, 'tarif', e.detail.value!)} />
              </IonCol>
              <IonCol>
                <QRCode value={p.qrCode!} size={64} />
              </IonCol>
              <IonCol>
                <IonButton color="danger" onClick={() => deleteParticipant(p.id)}>
                  <IonIcon icon={trash} />
                </IonButton>
                <IonButton color="primary" onClick={() => sendMail(p)}>
                  <IonIcon icon={mail} />
                </IonButton>
              </IonCol>
            </IonRow>
          ))}
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Participants;

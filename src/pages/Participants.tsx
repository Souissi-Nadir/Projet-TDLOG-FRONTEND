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

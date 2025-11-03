import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './Gestion_évenement.css';

const Gestion_évenement: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Gestion_évenement</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Gestion_évenement</IonTitle>
          </IonToolbar>
        </IonHeader>
        <ExploreContainer name="Gestion_évenement page" />
      </IonContent>
    </IonPage>
  );
};

export default Gestion_évenement;

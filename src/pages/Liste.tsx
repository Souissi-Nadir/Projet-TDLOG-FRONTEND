import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './Liste.css';

const Liste: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Liste</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Liste</IonTitle>
          </IonToolbar>
        </IonHeader>
        <ExploreContainer name="Liste page" />
      </IonContent>
    </IonPage>
  );
};

export default Liste;

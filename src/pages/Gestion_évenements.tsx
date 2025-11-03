import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './Gestion_évenements.css';

const Gestion_évenements: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Gestion d'évenements</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Gestion d'évenements</IonTitle>
          </IonToolbar>
        </IonHeader>
        <ExploreContainer name="Gestion d'évenements page" />
      </IonContent>
    </IonPage>
  );
};

export default Gestion_évenements;

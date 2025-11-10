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
  IonSelect,
  IonSelectOption,
  IonList,
  IonCard, // Utilisé pour styliser les boutons comme des blocs
  IonCardContent,
  IonText
} from '@ionic/react';
import { logOutOutline, personCircleOutline, chevronDownOutline } from 'ionicons/icons';
import './Gestion_évenements.css';

// --- Simulation de l'état de l'utilisateur (à remplacer par votre logique d'auth) ---
const isAuthenticated = true; // Simuler un utilisateur connecté pour l'exemple
const userName = "Jean Dupont";
const userProfilePicture = "URL_DE_LA_PHOTO_DE_PROFIL"; // Remplacez par une URL réelle si nécessaire
const activeAssociation = "Association Alpha";
const userAssociations = ["Association Alpha", "Beta Events", "Gamma Group"];

// Liste des actions/boutons
const eventActions = [
  "Liste événements",
  "Modifier événement",
  "Supprimer événement",
  "Historique événements",
];
// -----------------------------------------------------------------------------------

const Gestion_évenements: React.FC = () => {

  // Fonction factice pour simuler l'action des boutons
  const handleActionClick = (action: string) => {
    console.log(`Action cliquée: ${action}. Redirection vers la page ${action.replace(' ', '_')} à implémenter.`);
    // Ici, vous ajouterez la logique de navigation (ex: history.push('/liste-evenements'))
  };

  return (
    <IonPage>
      {/* Premier bandeau (Navigation/Auth) */}
      <IonHeader>
        <IonToolbar>
          
          {/* Contenu Gauche du bandeau */}
          <IonButtons slot="start">
            {isAuthenticated ? (
              <IonItem lines="none" style={{'--padding-start': '0px', '--inner-padding-end': '0px'}}>
                {/* Nom Prénom */}
                <IonLabel class="ion-text-wrap" style={{ marginRight: '10px' }}>
                  <IonText color="dark">
                    <p style={{ margin: '0', fontWeight: 'bold' }}>{userName}</p>
                  </IonText>
                </IonLabel>
                
                {/* Menu déroulant Association */}
                <IonSelect 
                  value={activeAssociation} 
                  placeholder="Sélectionner" 
                  interface="popover"
                  style={{ minWidth: '150px' }}
                >
                  {userAssociations.map((association, index) => (
                    <IonSelectOption key={index} value={association}>
                      {association}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
            ) : (
              // Utilisateur déconnecté: Bouton Se Connecter
              <IonButton routerLink="/login" fill="solid" color="primary">
                Se connecter
              </IonButton>
            )}
          </IonButtons>
          
          {/* Contenu Droit du bandeau */}
          <IonButtons slot="end">
            {isAuthenticated ? (
              // Utilisateur connecté: Photo de profil et Déconnexion
              <IonButton onClick={() => console.log('Déconnexion cliquée')}>
                <IonIcon 
                  icon={logOutOutline} 
                  slot="start" 
                  color="danger" 
                  size="large"
                />
                {/* Remplacer l'icône par l'image de profil si disponible. Pour l'exemple, on garde l'icône par défaut */}
                <IonIcon icon={personCircleOutline} size="large" /> 
              </IonButton>
            ) : (
              // Utilisateur déconnecté: Icône profil vierge
              <IonIcon icon={personCircleOutline} size="large" color="medium" />
            )}
          </IonButtons>

        </IonToolbar>
      </IonHeader>

      {/* Contenu principal */}
      <IonContent fullscreen>
        <IonList style={{ padding: '10px' }}>
          
          {/* Titre */}
          <IonHeader collapse="condense">
            <IonToolbar>
              <IonTitle size="large">Gestion d'événements</IonTitle>
            </IonToolbar>
          </IonHeader>
          
          {/* Succession de boutons rectangulaires */}
          {eventActions.map((action, index) => (
            <IonCard 
              key={index} 
              button 
              onClick={() => handleActionClick(action)}
              style={{ 
                margin: '10px 0', 
                width: '100%', 
                backgroundColor: '#f4f4f4', // Couleur de fond légèrement différente
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
          
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Gestion_évenements;
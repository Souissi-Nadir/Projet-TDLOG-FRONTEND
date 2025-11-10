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
  IonCard,
  IonCardContent,
  IonText
} from '@ionic/react';
import { logOutOutline, personCircleOutline, chevronDownOutline } from 'ionicons/icons';
import './Gestion_évenements.css'; // S'assurer que le fichier CSS est bien importé

// --- Simulation de l'état de l'utilisateur ---
const isAuthenticated = true;
const userName = "Jean Dupont";
const activeAssociation = "Association Alpha";
const userAssociations = ["Association Alpha", "Beta Events", "Gamma Group"];

// Liste des actions/boutons avec leurs couleurs associées
const eventActions = [
  { name: "Liste événements", color: "primary" }, // Bleu par défaut
  { name: "Modifier événement", color: "warning" }, // Jaune/Orange
  { name: "Supprimer événement", color: "danger" }, // Rouge
  { name: "Historique événements", color: "success" }, // Vert
];
// -----------------------------------------------------------------------------------

const Gestion_évenements: React.FC = () => {

  const handleActionClick = (action: string) => {
    console.log(`Action cliquée: ${action}.`);
    // Logique de navigation ici
  };

  // Ajout d'une fonction pour obtenir la classe CSS de la couleur
  const getColorClass = (color: string) => {
      // Les classes sont définies dans Gestion_évenements.css
      switch (color) {
          case 'primary': return 'btn-primary';
          case 'warning': return 'btn-warning';
          case 'danger': return 'btn-danger';
          case 'success': return 'btn-success';
          default: return 'btn-default';
      }
  };

  return (
    <IonPage>
      {/* Premier bandeau (Navigation/Auth) */}
      <IonHeader>
        <IonToolbar>
          
          {/* Contenu Gauche du bandeau */}
          <IonButtons slot="start">
            {/* Nouveau conteneur pour ajouter de la marge gauche */}
            <div className="header-left-content">
                {isAuthenticated ? (
                <IonItem lines="none" className="header-auth-item">
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
            </div>
          </IonButtons>
          
          {/* Contenu Droit du bandeau (inchangé) */}
          <IonButtons slot="end">
            {isAuthenticated ? (
              <IonButton onClick={() => console.log('Déconnexion cliquée')}>
                <IonIcon 
                  icon={logOutOutline} 
                  slot="start" 
                  color="danger" 
                  size="large"
                />
                <IonIcon icon={personCircleOutline} size="large" /> 
              </IonButton>
            ) : (
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
              onClick={() => handleActionClick(action.name)}
              // Appliquer la classe CSS pour la couleur et le style
              className={`action-button-card ${getColorClass(action.color)}`}
            >
              <IonCardContent className="ion-text-center">
                <IonLabel>
                  <h2 style={{ margin: '0', fontWeight: 'bold', color: 'white' }}>{action.name}</h2>
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
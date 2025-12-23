import { Redirect, Route } from 'react-router-dom';//import pour navigation entre pages
import { IonReactRouter } from '@ionic/react-router';
import { //import de structure de l'app 
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact
} from '@ionic/react';
import { ellipse, camera, list, person } from 'ionicons/icons';

//on import les composants react des différentes pages
import Participants from './pages/Participants';
import Scan from './pages/Scan';
import Gestion_évenements from './pages/Gestion_évenements';
import Login from './pages/Login';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';


setupIonicReact(); //initialise ionic pour fonctionner avec React

const Tabs: React.FC = () => ( //composant react de navigation interne qui def les onglets
  <IonTabs> 
    <IonRouterOutlet>
      <Route exact path="/app/Participants">
        <Participants />
      </Route>
      <Route exact path="/app/Scan">
        <Scan />
      </Route>
      <Route path="/app/Gestion_évenements">
        <Gestion_évenements />
      </Route>
      <Route exact path="/app">
        <Redirect to="/app/Participants" />
      </Route>
    </IonRouterOutlet>
    <IonTabBar slot="bottom">         
      <IonTabButton tab="Participants" href="/app/Participants">
        <IonIcon aria-hidden="true" icon={list} />
        <IonLabel>Participants</IonLabel>
      </IonTabButton>
      <IonTabButton tab="Scan" href="/app/Scan">
        <IonIcon aria-hidden="true" icon={camera} />
        <IonLabel>Scan</IonLabel>
      </IonTabButton>
      <IonTabButton tab="Gestion_évenements" href="/app/Gestion_évenements">
        <IonIcon aria-hidden="true" icon={person} />
        <IonLabel>Gestion d'évenements</IonLabel>
      </IonTabButton>
    </IonTabBar>
  </IonTabs>
);

const App: React.FC = () => ( //composant react global de notre application :Il configure Ionic, le routing avec React Router et détermine quelles pages sont affichées selon l’URL avec le composant TABS.
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet>
        <Route exact path="/login">
          <Login />
        </Route>
        <Route path="/app">
          <Tabs />
        </Route>
        <Route exact path="/">
          <Redirect to="/app/Participants" />
        </Route>
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;

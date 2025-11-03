import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { ellipse, camera, list, person } from 'ionicons/icons';
import Participants from './pages/Participants';
import Scan from './pages/Scan';
import Gestion_évenements from './pages/Gestion_évenements';

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

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonTabs>
        <IonRouterOutlet>
          <Route exact path="/Participants">
            <Participants />
          </Route>
          <Route exact path="/Scan">
            <Scan />
          </Route>
          <Route path="/Gestion_évenements">
            <Gestion_évenements />
          </Route>
          <Route exact path="/">
            <Redirect to="/Participants" />
          </Route>
        </IonRouterOutlet>
        <IonTabBar slot="bottom">
          <IonTabButton tab="Participants" href="/Participants">
            <IonIcon aria-hidden="true" icon={list} />
            <IonLabel>Participants</IonLabel>
          </IonTabButton>
          <IonTabButton tab="Scan" href="/Scan">
            <IonIcon aria-hidden="true" icon={camera} />
            <IonLabel>Scan</IonLabel>
          </IonTabButton>
          <IonTabButton tab="Gestion_évenements" href="/Gestion_évenements">
            <IonIcon aria-hidden="true" icon={person} />
            <IonLabel>Gestion d'évenements</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </IonReactRouter>
  </IonApp>
);

export default App;


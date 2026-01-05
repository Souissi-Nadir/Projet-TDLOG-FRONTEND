import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
  useIonRouter,
  useIonToast,
} from "@ionic/react";
import { FormEvent, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { login, signup } from "../api";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const router = useIonRouter();
  const [present] = useIonToast();
  const location = useLocation();

  const redirectPath = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    const redirect = searchParams.get("redirect");
    return redirect && redirect.startsWith("/app") ? redirect : "/app/Participants";
  }, [location.search]);

  const handleSubmit = async () => {
    if (!email || !password) {
      present({ message: "Email et mot de passe requis", duration: 2000, color: "warning" });
      return;
    }

    try {
      setIsLoading(true);
      await login(email, password);
      present({ message: "Connexion réussie", duration: 1500, color: "success" });
      router.push(redirectPath, "root");
    } catch (e: any) {
      console.error("Erreur connexion", e);
      present({
        message: "Connexion impossible. Vérifie tes identifiants.",
        duration: 2500,
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetSignupForm = () => {
    setSignupName("");
    setSignupEmail("");
    setSignupPassword("");
  };

  const handleSignup = async () => {
    if (!signupEmail || !signupPassword) {
      present({ message: "Email et mot de passe requis", duration: 2000, color: "warning" });
      return;
    }

    try {
      setIsCreatingAccount(true);
      await signup({ email: signupEmail, password: signupPassword, name: signupName });
      await login(signupEmail, signupPassword);
      present({ message: "Compte créé et connecté", duration: 1500, color: "success" });
      setIsSignupOpen(false);
      resetSignupForm();
      router.push(redirectPath, "root");
    } catch (e: any) {
      console.error("Erreur création compte", e);
      present({
        message: "Impossible de créer le compte. Vérifie les informations.",
        duration: 2500,
        color: "danger",
      });
    } finally {
      setIsCreatingAccount(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Connexion</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <form
          onSubmit={(event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            handleSubmit();
          }}
        >
          <IonText>
            <p>Connecte-toi avec ton compte administrateur TDLOG.</p>
          </IonText>

          <IonItem>
            <IonLabel position="stacked">Email</IonLabel>
            <IonInput
              type="email"
              value={email}
              onIonChange={(e) => setEmail(e.detail.value || "")}
              placeholder="admin@tdlog.local"
              disabled={isLoading}
            />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Mot de passe</IonLabel>
            <IonInput
              type="password"
              value={password}
              onIonChange={(e) => setPassword(e.detail.value || "")}
              placeholder="Mot de passe"
              disabled={isLoading}
            />
          </IonItem>

          <IonButton
            type="submit"
            expand="block"
            disabled={isLoading}
            className="ion-margin-top"
          >
            {isLoading ? "Connexion..." : "Se connecter"}
          </IonButton>

          <IonButton
            type="button"
            expand="block"
            fill="outline"
            className="ion-margin-top"
            onClick={() => setIsSignupOpen(true)}
          >
            Créer un compte
          </IonButton>
        </form>

        <IonModal
          isOpen={isSignupOpen}
          onDidDismiss={() => {
            setIsSignupOpen(false);
            resetSignupForm();
          }}
        >
          <IonHeader>
            <IonToolbar>
              <IonTitle>Créer un compte</IonTitle>
              <IonButtons slot="end">
                <IonButton
                  onClick={() => {
                    setIsSignupOpen(false);
                    resetSignupForm();
                  }}
                >
                  Fermer
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <form
              onSubmit={(event: FormEvent<HTMLFormElement>) => {
                event.preventDefault();
                handleSignup();
              }}
            >
              <IonList>
                <IonItem>
                  <IonLabel position="stacked">Nom</IonLabel>
                  <IonInput
                    value={signupName}
                    onIonChange={(e) => setSignupName(e.detail.value || "")}
                    placeholder="Nom complet"
                    disabled={isCreatingAccount}
                  />
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Email</IonLabel>
                  <IonInput
                    type="email"
                    value={signupEmail}
                    onIonChange={(e) => setSignupEmail(e.detail.value || "")}
                    placeholder="email@exemple.com"
                    disabled={isCreatingAccount}
                  />
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Mot de passe</IonLabel>
                  <IonInput
                    type="password"
                    value={signupPassword}
                    onIonChange={(e) => setSignupPassword(e.detail.value || "")}
                    placeholder="Mot de passe"
                    disabled={isCreatingAccount}
                  />
                </IonItem>
              </IonList>
              <IonButton
                type="submit"
                expand="block"
                disabled={isCreatingAccount}
                className="ion-margin-top"
              >
                {isCreatingAccount ? "Création..." : "Créer mon compte"}
              </IonButton>
            </form>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Login;

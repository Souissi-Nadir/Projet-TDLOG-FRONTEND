import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
  useIonRouter,
  useIonToast,
} from "@ionic/react";
import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { login } from "../api";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Connexion</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
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

        <IonButton expand="block" onClick={handleSubmit} disabled={isLoading} className="ion-margin-top">
          {isLoading ? "Connexion..." : "Se connecter"}
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default Login;

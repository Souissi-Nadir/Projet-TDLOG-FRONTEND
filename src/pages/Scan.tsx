import React, { useEffect, useRef, useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonText,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonAlert,
  useIonRouter,
} from "@ionic/react";
import { BrowserQRCodeReader, IScannerControls } from "@zxing/browser";
import "./Scan.css";
import { scanTicket } from "../api"; // ✅ appel backend centralisé
import { useIsAuthenticated } from "../hooks/useAuth";

type ScanStatus = "idle" | "success" | "error";

interface ScanResult {
  valid: boolean;
  reason?: string | null;
  user_email?: string | null;
  user_name?: string | null;
  event_id?: number | null;
  status?: string | null;
}

const Scan: React.FC = () => {
  const isAuthenticated = useIsAuthenticated();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const router = useIonRouter();
  const [status, setStatus] = useState<ScanStatus>("idle");
  const [message, setMessage] = useState("Place le QR code dans le cadre");
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastToken, setLastToken] = useState<string | null>(null);
  const [modalInfo, setModalInfo] = useState<{ name: string }>({ name: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- Appel au backend via api.ts ---
  const checkAndMarkTicket = async (
    token: string
  ): Promise<ScanResult | null> => {
    try {
      const data = (await scanTicket(token)) as ScanResult;
      return data;
    } catch (e) {
      console.error("Erreur scanTicket:", e);
      return null;
    }
  };

  const handleScan = async (token: string) => {
    console.log("QR scanné :", token);
    if (isProcessing) return;
    setIsProcessing(true);

    // évite de retraiter le même QR en boucle
    if (lastToken === token && status !== "idle") {
      setIsProcessing(false);
      return;
    }

    const data = await checkAndMarkTicket(token);
    setLastToken(token);

    if (!data) {
      setStatus("error");
      setMessage("Erreur de communication avec le serveur");
    } else if (data.valid) {
      setStatus("success");
      setMessage(
        data.user_name
          ? `Présence enregistrée pour ${data.user_name} ✅`
          : "Présence enregistrée ✅"
      );
      setModalInfo({
        name: data.user_name || "Participant confirmé",
      });
      setIsModalOpen(true);
    } else {
      if (data.reason === "already_scanned") {
        setStatus("error");
        setMessage("Le QR code a déjà été scanné");
      } else if (data.reason === "ticket_not_found") {
        setStatus("error");
        setMessage("Ticket introuvable");
      } else {
        setStatus("error");
        setMessage("Ticket invalide");
      }
    }

    setTimeout(() => {
      setStatus("idle");
      setMessage("Place le QR code dans le cadre");
      setIsProcessing(false);
    }, 1600);
  };

  useEffect(() => {
    if (!isAuthenticated) {
      controlsRef.current?.stop();
      return;
    }

    const reader = new BrowserQRCodeReader();

    const startScanner = async () => {
      if (!videoRef.current) return;

      try {
        const controls = await reader.decodeFromVideoDevice(
          undefined, // caméra par défaut
          videoRef.current,
          (result, _error) => {
            if (result) {
              const text = result.getText();
              handleScan(text);
            }
            // les erreurs sont normales tant qu'il ne voit pas de QR
          }
        );

        controlsRef.current = controls;
      } catch (e) {
        console.error("Erreur accès caméra:", e);
        setStatus("error");
        setMessage("Impossible d’accéder à la caméra");
      }
    };

    startScanner();

    return () => {
      controlsRef.current?.stop();
    };
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Scan</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Authentification requise</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonText>
                <p>Connecte-toi pour pouvoir scanner et valider les tickets.</p>
              </IonText>
              <IonButton
                className="ion-margin-top"
                onClick={() =>
                  router.push(`/login?redirect=${encodeURIComponent("/app/Scan")}`, "forward")
                }
              >
                Aller à la page de connexion
              </IonButton>
            </IonCardContent>
          </IonCard>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Scan</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className={`scan-content scan-status-${status}`}>
        <div className="scan-container">
          <IonText className="scan-extra-text">
            <p>Scanner un QR code svp</p>
          </IonText>
          <div className="scan-frame-wrapper">
            <div className="scan-frame">
              <video
                ref={videoRef}
                className="scan-video"
                autoPlay
                muted
                playsInline
              />
              <div className="scan-frame-border" />
            </div>
          </div>

          <div className="scan-message">
            <IonText>
              <p>{message}</p>
            </IonText>
          </div>
        </div>
      </IonContent>

      <IonAlert
        isOpen={isModalOpen}
        header="Scan confirmé"
        message={modalInfo.name}
        buttons={[
          {
            text: "Fermer",
            handler: () => setIsModalOpen(false),
          },
        ]}
        onDidDismiss={() => setIsModalOpen(false)}
      />
    </IonPage>
  );
};

export default Scan;

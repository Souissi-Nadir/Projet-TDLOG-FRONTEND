
import React, { useEffect, useRef, useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonText,
} from "@ionic/react";
import { BrowserQRCodeReader, IScannerControls } from "@zxing/browser"; // Import de IScannerControls
import "./Scan.css";

// --- Définitions ---
type ScanStatus = "idle" | "success" | "error";
const SCAN_API_URL = "/scan";

interface ScanResult {
  valid: boolean;
  reason?: string | null;      // "ticket_not_found", "already_scanned", ...
  user_email?: string | null;
  user_name?: string | null;
  event_id?: number | null;
  status?: string | null;      // UNUSED / SCANNED / CANCELED etc.
}

const Scan: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  // controlsRef stockera l'objet retourné par zxing pour contrôler le flux (démarrer/arrêter)
  const controlsRef = useRef<IScannerControls | null>(null); 
  const qrReaderRef = useRef<BrowserQRCodeReader | null>(null);

  const [status, setStatus] = useState<ScanStatus>("idle");
  const [message, setMessage] = useState("Place le QR code dans le cadre");
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastToken, setLastToken] = useState<string | null>(null);

  // --- Appel au backend ---
  const checkAndMarkTicket = async (
    token: string
  ): Promise<ScanResult | null> => {
    // Le reste de cette fonction reste inchangé
    try {
      const res = await fetch(SCAN_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (!res.ok) {
        console.error("HTTP error", res.status);
        return null;
      }

      const data: ScanResult = await res.json();
      return data;
    } catch (e) {
      console.error("Erreur réseau / backend", e);
      return null;
    }
  };

  // --- Handler de Scan (Déclenché par le Callback) ---
  const handleScanToken = async (token: string) => {
    // Si nous sommes déjà en train de traiter un résultat ou le même jeton, on ignore.
    if (isProcessing) return;
    
    // Si le dernier jeton scanné est le même et qu'il est déjà traité (statut non "idle"), on ignore.
    // Cela évite de spammer le serveur avec le même QR code.
    if (lastToken === token && status !== "idle") {
      return;
    }
    
    // **** Début du Traitement ****
    setIsProcessing(true);

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
    } else {
      // Gestion des raisons d'échec
      if (data.reason === "already_scanned") {
        setStatus("error");
        setMessage("Le QR code a déjà été scanné");
      } else if (data.reason === "ticket_not_found") {
        setStatus("error");
        setMessage("Ticket introuvable / QR non valide");
      } else {
        setStatus("error");
        setMessage("Le ticket n'est pas valide");
      }
    }

    // Réinitialiser le statut après un court délai
    setTimeout(() => {
      setStatus("idle");
      setMessage("Place le QR code dans le cadre");
      setIsProcessing(false);
    }, 1600);
  };
  // ----------------------------------------------------


  useEffect(() => {
    const setupCameraAndScanner = async () => {
      if (!videoRef.current) return;

      try {
        // 1) Instanciation du reader ZXing
        qrReaderRef.current = new BrowserQRCodeReader();

        // 2) Démarre le flux vidéo et la détection en mode continu
        controlsRef.current = await qrReaderRef.current.decodeFromVideoDevice(
          undefined, // Utilise la caméra par défaut (environnement)
          videoRef.current,
          (result, error) => {
            // Callback déclenché à chaque scan réussi
            if (result) {
              handleScanToken(result.getText());
            }
            // Les erreurs sont généralement des 'NotFoundException' (pas de QR) -> on les ignore.
            // if (error) console.error("Erreur de détection:", error);
          }
        );

      } catch (e) {
        console.error("Erreur accès caméra / scan :", e);
        setStatus("error");
        setMessage("Impossible d’accéder à la caméra ou de démarrer le scan.");
      }
    };

    setupCameraAndScanner();

    return () => {
      // Nettoyage à la sortie de la page: Utilise l'objet de contrôle IScannerControls
      if (controlsRef.current) {
        controlsRef.current.stop(); // Utilise stop() au lieu de l'obsolète reset()
        controlsRef.current = null;
      }
      qrReaderRef.current = null; // Libère l'instance du reader
    };
  }, []); // une seule fois au montage

  // Le reste du composant reste inchangé
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Scan</IonTitle>
        </IonToolbar>
      </IonHeader>

      {/* PAS de fullscreen → la TabBar reste dessous */}
      <IonContent className={`scan-content scan-status-${status}`}>
        <div className="scan-container">
          <div className="scan-frame-wrapper">
            <div className="scan-frame">
              {/* L'élément vidéo est toujours nécessaire pour afficher le flux */}
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
    </IonPage>
  );
};

export default Scan;
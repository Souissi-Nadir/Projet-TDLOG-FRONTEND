import React, { useEffect, useRef, useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonText,
} from "@ionic/react";
import { BrowserQRCodeReader, IScannerControls } from "@zxing/browser";
import "./Scan.css";
import { scanTicket } from "../api"; // 

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
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);

  const [status, setStatus] = useState<ScanStatus>("idle");
  const [message, setMessage] = useState("Place le QR code dans le cadre");
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastToken, setLastToken] = useState<string | null>(null);

  // --- Appel au backend via api.ts ---
  const checkAndMarkTicket = async (
    token: string
  ): Promise<ScanResult | null> => {
    try {
      const data = (await scanTicket(token)) as ScanResult;
      return data;
    } catch (e) {
      return null;
    }
  };

  const handleScan = async (token: string) => {
    if (isProcessing) return;
    setIsProcessing(true);

    // évite de retraiter 10 fois le même QR d'affilée
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
        setStatus("error");
        setMessage("Impossible d’accéder à la caméra");
      }
    };

    startScanner();

    return () => {
      controlsRef.current?.stop();
    };
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Scan</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className={`scan-content scan-status-${status}`}>
        <div className="scan-container">
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
    </IonPage>
  );
};

export default Scan;

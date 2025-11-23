import React, { useEffect, useRef, useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonText,
} from "@ionic/react";
import { BrowserQRCodeReader } from "@zxing/browser";
import "./Scan.css";

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
  const streamRef = useRef<MediaStream | null>(null);
  const qrReaderRef = useRef<BrowserQRCodeReader | null>(null);
  const scanIntervalRef = useRef<number | null>(null);

  const [status, setStatus] = useState<ScanStatus>("idle");
  const [message, setMessage] = useState("Place le QR code dans le cadre");
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastToken, setLastToken] = useState<string | null>(null);

  // --- Appel au backend ---
  const checkAndMarkTicket = async (
    token: string
  ): Promise<ScanResult | null> => {
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

  const handleScan = async (token: string) => {
    if (isProcessing) return;
    setIsProcessing(true);

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
        setMessage("Ticket introuvable / QR non valide");
      } else {
        setStatus("error");
        setMessage("Le ticket n'est pas valide");
      }
    }

    setTimeout(() => {
      setStatus("idle");
      setMessage("Place le QR code dans le cadre");
      setIsProcessing(false);
    }, 1600);
  };

  useEffect(() => {
    const setupCameraAndScanner = async () => {
      if (!videoRef.current) return;

      try {
        // 1) Demande d’accès caméra + affichage dans la vidéo
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment", // sur téléphone → caméra arrière
          },
          audio: false,
        });

        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        // 2) Instanciation du reader ZXing
        const reader = new BrowserQRCodeReader();
        qrReaderRef.current = reader;

        // 3) On scanne régulièrement le contenu de la vidéo
        scanIntervalRef.current = window.setInterval(async () => {
          if (!videoRef.current || !qrReaderRef.current) return;

          try {
            const result = await qrReaderRef.current.decodeFromVideoElement(
              videoRef.current
            );
            if (result) {
              const text = result.getText();
              handleScan(text);
            }
          } catch (err) {
            // Erreur "NotFoundException" = pas de QR dans l'image → normal, on ignore
            // On évite de spam la console ici
          }
        }, 500); // toutes les 500 ms
      } catch (e) {
        console.error("Erreur accès caméra :", e);
        setStatus("error");
        setMessage("Impossible d’accéder à la caméra");
      }
    };

    setupCameraAndScanner();

    return () => {
      // Nettoyage à la sortie de la page
      if (scanIntervalRef.current) {
        window.clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
      }
      if (qrReaderRef.current) {
        qrReaderRef.current.reset();
        qrReaderRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, []); // une seule fois au montage

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

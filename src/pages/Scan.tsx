import React, { useEffect, useRef, useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonText
} from '@ionic/react';
import { BrowserQRCodeReader, IScannerControls } from '@zxing/browser';
import './Scan.css';

type ScanStatus = 'idle' | 'success' | 'error';

// À adapter si ton backend est sur une autre URL
const SCAN_API_URL = '/scan';

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
  const controlsRef = useRef<IScannerControls | null>(null);

  const [status, setStatus] = useState<ScanStatus>('idle');
  const [message, setMessage] = useState<string>('Place le QR code dans le cadre');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastToken, setLastToken] = useState<string | null>(null);

  // ---- Appel au backend ----
  const checkAndMarkTicket = async (token: string): Promise<ScanResult | null> => {
    try {
      const res = await fetch(SCAN_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }) // <-- correspond à ScanRequest(token: str)
      });

      if (!res.ok) {
        console.error('HTTP error', res.status);
        return null;
      }

      const data: ScanResult = await res.json();
      return data;
    } catch (e) {
      console.error('Erreur réseau / backend', e);
      return null;
    }
  };

  // ---- Quand un QR est détecté ----
  const handleScan = async (token: string) => {
    if (isProcessing) return;
    setIsProcessing(true);

    // éviter de re-traiter en boucle le même token quand l’utilisateur ne bouge pas
    if (lastToken === token && status !== 'idle') {
      setIsProcessing(false);
      return;
    }

    const data = await checkAndMarkTicket(token);
    setLastToken(token);

    if (!data) {
      setStatus('error');
      setMessage('Erreur de communication avec le serveur');
    } else if (data.valid) {
      // ✅ Premier scan / ticket accepté
      setStatus('success');
      setMessage(
        data.user_name
          ? `Présence enregistrée pour ${data.user_name} ✅`
          : 'Présence enregistrée ✅'
      );
    } else {
      // ❌ Ticket refusé
      if (data.reason === 'already_scanned') {
        setStatus('error');
        setMessage('Le QR code a déjà été scanné');
      } else if (data.reason === 'ticket_not_found') {
        setStatus('error');
        setMessage('Ticket introuvable / QR non valide');
      } else {
        setStatus('error');
        setMessage("Le ticket n'est pas valide");
      }
    }

    // après un court délai on repasse en mode scan
    setTimeout(() => {
      setStatus('idle');
      setMessage('Place le QR code dans le cadre');
      setIsProcessing(false);
    }, 1600);
  };

  // ---- Initialisation de la caméra + lecteur de QR ----
  useEffect(() => {
    const codeReader = new BrowserQRCodeReader();
    let isCancelled = false;

    const startScanner = async () => {
      if (!videoRef.current) return;

      try {
        const controls = await codeReader.decodeFromVideoDevice(
          null,           // caméra par défaut
          videoRef.current,
          (result, error, ctrl) => {
            if (isCancelled) {
              ctrl?.stop();
              return;
            }

            if (result) {
              const text = result.getText();
              // Ici, "text" EST TON token
              handleScan(text);
            }
            // erreurs de décodage normales ignorées
          }
        );
        controlsRef.current = controls;
      } catch (e) {
        console.error('Erreur accès caméra :', e);
        setStatus('error');
        setMessage('Impossible d’accéder à la caméra');
      }
    };

    startScanner();

    return () => {
      isCancelled = true;
      if (controlsRef.current) {
        controlsRef.current.stop();
      }
      codeReader.reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Scan</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent
        fullscreen
        className={`scan-content scan-status-${status}`}
      >
        <div className="scan-overlay">
          {/* Carré caméra au centre */}
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

          {/* Message en bas */}
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
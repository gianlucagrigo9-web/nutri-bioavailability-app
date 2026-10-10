'use client';

// components/BarcodeScanner.tsx
//
// Widget camera per lo scanner barcode (PRD §7, Fase 3 punto 13). Usa
// html5-qrcode (richiede `npm install html5-qrcode` -- vedi package.json).
// Nessun dato della fotocamera lascia il dispositivo dell'utente: la
// decodifica del barcode avviene interamente nel browser, il risultato è
// solo la stringa numerica del codice, passata a onScan.

import { useEffect, useRef } from 'react';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
  onError: (message: string) => void;
}

export default function BarcodeScanner({ onScan, onClose, onError }: BarcodeScannerProps) {
  const containerId = 'barcode-scanner-viewport';
  const scannerRef = useRef<import('html5-qrcode').Html5Qrcode | null>(null);
  const stoppedRef = useRef(false);

  useEffect(() => {
    stoppedRef.current = false;
    let cancelled = false;

    // Import dinamico: html5-qrcode usa l'API MediaDevices del browser,
    // non deve essere valutato lato server (Next.js SSR).
    import('html5-qrcode').then(({ Html5Qrcode }) => {
      if (cancelled) return;
      const scanner = new Html5Qrcode(containerId);
      scannerRef.current = scanner;
      scanner
        .start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 280, height: 140 } },
          (decodedText) => {
            // Difensivo: un barcode letto male dalla fotocamera una tantum
            // non deve far scattare onScan più volte per la stessa sessione
            // di scansione -- fermiamo subito dopo il primo risultato valido.
            if (stoppedRef.current) return;
            stoppedRef.current = true;
            scanner
              .stop()
              .catch(() => {
                // Difensivo: se la fotocamera è già stata chiusa da un
                // unmount concorrente, stop() rifiuta -- non è un errore
                // da mostrare all'utente, il componente sta comunque per
                // smontarsi.
              })
              .finally(() => onScan(decodedText));
          },
          () => {
            // Callback di "nessun barcode in questo frame" -- chiamata
            // continuamente durante la scansione normale, non è un errore.
          }
        )
        .catch((err) => {
          if (!cancelled) {
            onClose();
            onError(
              'Impossibile accedere alla fotocamera: ' +
                (err instanceof Error ? err.message : String(err)) +
                '. Controlla di aver concesso il permesso fotocamera al sito.'
            );
          }
        });
    });

    return () => {
      cancelled = true;
      const scanner = scannerRef.current;
      if (scanner && !stoppedRef.current) {
        stoppedRef.current = true;
        scanner.stop().catch(() => {
          // Difensivo: stop() su uno scanner mai avviato con successo
          // rifiuta -- ignorato, stiamo comunque smontando il componente.
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-5 max-w-md w-full">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-slate-800">Scansiona codice a barre</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 h-8 w-8 flex items-center justify-center"
          >
            ✕
          </button>
        </div>
        <div id={containerId} className="rounded-xl overflow-hidden bg-slate-900" />
        <p className="text-xs text-slate-400 mt-3">
          Inquadra il codice a barre EAN del prodotto. La fotocamera non lascia il tuo dispositivo.
        </p>
      </div>
    </div>
  );
}

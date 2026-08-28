import { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScannerCameraOverlay } from '../components/scanner/ScannerCameraOverlay';

const ScannerOverlayContext = createContext({
  openScanner: () => {},
  closeScanner: () => {},
});

export function ScannerOverlayProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const openScanner = useCallback(() => setIsOpen(true), []);
  const closeScanner = useCallback(() => setIsOpen(false), []);

  const handleScanComplete = useCallback(
    (payload) => {
      setIsOpen(false);
      navigate('/scanner', {
        state: {
          detailOnly: true,
          barcode: payload.barcode,
          result: payload.result ?? null,
          barcodeNotFound: payload.barcodeNotFound ?? false,
        },
      });
    },
    [navigate]
  );

  return (
    <ScannerOverlayContext.Provider value={{ openScanner, closeScanner }}>
      {children}
      {isOpen && (
        <ScannerCameraOverlay onClose={closeScanner} onScanComplete={handleScanComplete} />
      )}
    </ScannerOverlayContext.Provider>
  );
}

export function useScannerOverlay() {
  return useContext(ScannerOverlayContext);
}

export default ScannerOverlayContext;

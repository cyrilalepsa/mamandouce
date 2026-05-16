import { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, Check } from 'lucide-react';
import { toast } from 'sonner';

export function OfflineSyncIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [showSyncSuccess, setShowSyncSuccess] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Trigger sync when back online
      requestSync();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast.info('Vous êtes hors ligne. Vos actions seront synchronisées automatiquement.');
    };
    
    const handleServiceWorkerMessage = (event) => {
      if (event.data.type === 'SYNC_COMPLETE') {
        setSyncing(false);
        if (event.data.processed > 0) {
          setShowSyncSuccess(true);
          toast.success(`${event.data.processed} action(s) synchronisée(s)`);
          setTimeout(() => setShowSyncSuccess(false), 3000);
        }
        checkPendingQueue();
      }
      if (event.data.type === 'QUEUE_STATUS') {
        setPendingCount(event.data.pendingCount);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    navigator.serviceWorker?.addEventListener('message', handleServiceWorkerMessage);
    
    // Check initial queue status
    checkPendingQueue();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      navigator.serviceWorker?.removeEventListener('message', handleServiceWorkerMessage);
    };
  }, []);

  const checkPendingQueue = () => {
    if (navigator.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'GET_QUEUE_STATUS' });
    }
  };

  const requestSync = () => {
    if (navigator.serviceWorker?.controller) {
      setSyncing(true);
      navigator.serviceWorker.controller.postMessage({ type: 'SYNC_NOW' });
    }
  };

  // Don't show if online and no pending items
  if (isOnline && pendingCount === 0 && !showSyncSuccess) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-4 md:w-auto">
      <div 
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg backdrop-blur-sm transition-all duration-300 ${
          !isOnline 
            ? 'bg-amber-500/90 text-white' 
            : showSyncSuccess 
              ? 'bg-green-500/90 text-white'
              : 'bg-slate-800/90 text-white'
        }`}
        data-testid="offline-sync-indicator"
      >
        {!isOnline ? (
          <>
            <WifiOff className="w-5 h-5" />
            <span className="text-sm font-medium">
              Hors ligne
              {pendingCount > 0 && ` • ${pendingCount} action(s) en attente`}
            </span>
          </>
        ) : showSyncSuccess ? (
          <>
            <Check className="w-5 h-5" />
            <span className="text-sm font-medium">Synchronisation réussie</span>
          </>
        ) : syncing ? (
          <>
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span className="text-sm font-medium">Synchronisation...</span>
          </>
        ) : pendingCount > 0 ? (
          <>
            <Wifi className="w-5 h-5" />
            <span className="text-sm font-medium">{pendingCount} action(s) en attente</span>
            <button 
              onClick={requestSync}
              className="ml-2 px-3 py-1 bg-white/20 rounded-full text-xs font-medium hover:bg-white/30 transition-colors"
              data-testid="sync-now-btn"
            >
              Synchroniser
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}

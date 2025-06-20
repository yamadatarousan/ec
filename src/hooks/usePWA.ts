import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isOffline: boolean;
  isStandalone: boolean;
  supportsPush: boolean;
  swRegistration: ServiceWorkerRegistration | null;
  updateAvailable: boolean;
}

interface PWAActions {
  install: () => Promise<boolean>;
  showUpdatePrompt: () => void;
  requestNotificationPermission: () => Promise<NotificationPermission>;
  subscribeToNotifications: () => Promise<boolean>;
  checkForUpdates: () => Promise<boolean>;
}

/**
 * PWA機能を管理するカスタムフック
 */
export function usePWA(): PWAState & PWAActions {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [swRegistration, setSwRegistration] =
    useState<ServiceWorkerRegistration | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  // PWAの状態を計算
  const isInstallable = installPrompt !== null;
  const isInstalled =
    typeof window !== 'undefined' &&
    (window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true);
  const isStandalone = isInstalled;
  const supportsPush =
    typeof window !== 'undefined' &&
    'PushManager' in window &&
    'serviceWorker' in navigator;

  // Service Workerの登録
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      registerServiceWorker();
    }
  }, []);

  // オンライン/オフライン状態の監視
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    setIsOffline(!navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // インストールプロンプトの監視
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  /**
   * Service Workerを登録する
   */
  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      setSwRegistration(registration);

      // 更新の監視
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              setUpdateAvailable(true);
            }
          });
        }
      });

      console.log('[PWA] Service Worker registered successfully');
    } catch (error) {
      console.error('[PWA] Service Worker registration failed:', error);
    }
  };

  /**
   * PWAをインストールする
   */
  const install = useCallback(async (): Promise<boolean> => {
    if (!installPrompt) {
      return false;
    }

    try {
      await installPrompt.prompt();
      const choiceResult = await installPrompt.userChoice;

      if (choiceResult.outcome === 'accepted') {
        setInstallPrompt(null);
        return true;
      }

      return false;
    } catch (error) {
      console.error('[PWA] Installation failed:', error);
      return false;
    }
  }, [installPrompt]);

  /**
   * アップデート通知を表示する
   */
  const showUpdatePrompt = useCallback(() => {
    if (swRegistration?.waiting) {
      // Service Workerにメッセージを送信してアップデートを適用
      swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });

      // ページをリロード
      window.location.reload();
    }
  }, [swRegistration]);

  /**
   * 通知許可を要求する
   */
  const requestNotificationPermission =
    useCallback(async (): Promise<NotificationPermission> => {
      if (!('Notification' in window)) {
        throw new Error('このブラウザは通知をサポートしていません');
      }

      const permission = await Notification.requestPermission();
      return permission;
    }, []);

  /**
   * プッシュ通知に登録する
   */
  const subscribeToNotifications = useCallback(async (): Promise<boolean> => {
    if (!swRegistration || !supportsPush) {
      return false;
    }

    try {
      const permission = await requestNotificationPermission();
      if (permission !== 'granted') {
        return false;
      }

      // VAPIDキーは実際のプロダクションでは環境変数から取得
      const vapidPublicKey =
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
        'BMqS1KmbOZ0B_m7AwWm1YRxj7cq83pRWqnHkU5BRDi1cDn6kGBEONWQw-z-ydGt9d7hkGlGUjsU1WC0mfD0HzDM';

      const subscription = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      // サーバーに登録情報を送信
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      });

      return true;
    } catch (error) {
      console.error('[PWA] Push notification subscription failed:', error);
      return false;
    }
  }, [swRegistration, supportsPush, requestNotificationPermission]);

  /**
   * アップデートをチェックする
   */
  const checkForUpdates = useCallback(async (): Promise<boolean> => {
    if (!swRegistration) {
      return false;
    }

    try {
      await swRegistration.update();
      return updateAvailable;
    } catch (error) {
      console.error('[PWA] Update check failed:', error);
      return false;
    }
  }, [swRegistration, updateAvailable]);

  return {
    // State
    isInstallable,
    isInstalled,
    isOffline,
    isStandalone,
    supportsPush,
    swRegistration,
    updateAvailable,

    // Actions
    install,
    showUpdatePrompt,
    requestNotificationPermission,
    subscribeToNotifications,
    checkForUpdates,
  };
}

/**
 * VAPID公開キーをUint8Arrayに変換する
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = typeof window !== 'undefined' ? window.atob(base64) : '';
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

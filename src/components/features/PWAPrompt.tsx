'use client';

import React, { useState, useEffect } from 'react';
import { X, Download, Smartphone, Monitor, Wifi, Bell } from 'lucide-react';
import { Button, Card, CardContent } from '@/components/ui';
import { usePWA } from '@/hooks/usePWA';

interface PWAPromptProps {
  className?: string;
}

/**
 * PWAインストール・機能案内プロンプトコンポーネント
 */
export const PWAPrompt: React.FC<PWAPromptProps> = ({ className }) => {
  const {
    isInstallable,
    isInstalled,
    isOffline,
    updateAvailable,
    install,
    showUpdatePrompt,
    requestNotificationPermission,
    subscribeToNotifications,
  } = usePWA();

  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showUpdatePromptState, setShowUpdatePromptState] = useState(false);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const [dismissed, setDismissed] = useState<{ [key: string]: boolean }>({});

  // インストールプロンプトの表示制御
  useEffect(() => {
    if (isInstallable && !isInstalled && !dismissed.install) {
      // 少し遅延してからプロンプトを表示
      const timer = setTimeout(() => {
        setShowInstallPrompt(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled, dismissed.install]);

  // アップデートプロンプトの表示制御
  useEffect(() => {
    if (updateAvailable && !dismissed.update) {
      setShowUpdatePromptState(true);
    }
  }, [updateAvailable, dismissed.update]);

  // 通知許可プロンプトの表示制御
  useEffect(() => {
    if (
      isInstalled &&
      !dismissed.notification &&
      Notification.permission === 'default'
    ) {
      // インストール後少し時間をおいて表示
      const timer = setTimeout(() => {
        setShowNotificationPrompt(true);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isInstalled, dismissed.notification]);

  const handleInstall = async () => {
    const success = await install();
    if (success) {
      setShowInstallPrompt(false);
    }
  };

  const handleUpdate = () => {
    showUpdatePrompt();
    setShowUpdatePromptState(false);
  };

  const handleNotificationEnable = async () => {
    const success = await subscribeToNotifications();
    setShowNotificationPrompt(false);
    if (success) {
      // 成功メッセージを表示（トースト等）
    }
  };

  const handleDismiss = (type: string) => {
    setDismissed(prev => ({ ...prev, [type]: true }));

    if (type === 'install') setShowInstallPrompt(false);
    if (type === 'update') setShowUpdatePromptState(false);
    if (type === 'notification') setShowNotificationPrompt(false);

    // localStorageに保存して永続化
    localStorage.setItem(`pwa-dismissed-${type}`, 'true');
  };

  // 初期化時にdismiss状態を復元
  useEffect(() => {
    const installDismissed =
      localStorage.getItem('pwa-dismissed-install') === 'true';
    const updateDismissed =
      localStorage.getItem('pwa-dismissed-update') === 'true';
    const notificationDismissed =
      localStorage.getItem('pwa-dismissed-notification') === 'true';

    setDismissed({
      install: installDismissed,
      update: updateDismissed,
      notification: notificationDismissed,
    });
  }, []);

  if (!showInstallPrompt && !showUpdatePromptState && !showNotificationPrompt) {
    return null;
  }

  return (
    <div className={`fixed bottom-4 left-4 right-4 z-50 ${className}`}>
      {/* インストールプロンプト */}
      {showInstallPrompt && (
        <Card className="mb-4 shadow-lg border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Download className="h-6 w-6 text-blue-600" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900">
                  ECストアをインストール
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  アプリとしてインストールして、より快適にご利用ください
                </p>

                <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center">
                    <Smartphone className="h-4 w-4 mr-1" />
                    ホーム画面に追加
                  </div>
                  <div className="flex items-center">
                    <Wifi className="h-4 w-4 mr-1" />
                    オフライン対応
                  </div>
                  <div className="flex items-center">
                    <Monitor className="h-4 w-4 mr-1" />
                    フルスクリーン表示
                  </div>
                </div>

                <div className="mt-4 flex space-x-2">
                  <Button
                    onClick={handleInstall}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    インストール
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDismiss('install')}
                  >
                    後で
                  </Button>
                </div>
              </div>

              <button
                onClick={() => handleDismiss('install')}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* アップデートプロンプト */}
      {showUpdatePromptState && (
        <Card className="mb-4 shadow-lg border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Download className="h-6 w-6 text-green-600" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900">
                  新しいバージョンが利用可能
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  最新機能と改善された体験をお楽しみください
                </p>

                <div className="mt-4 flex space-x-2">
                  <Button
                    onClick={handleUpdate}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    アップデート
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDismiss('update')}
                  >
                    後で
                  </Button>
                </div>
              </div>

              <button
                onClick={() => handleDismiss('update')}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 通知許可プロンプト */}
      {showNotificationPrompt && (
        <Card className="mb-4 shadow-lg border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Bell className="h-6 w-6 text-purple-600" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900">
                  通知を有効にする
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  セール情報や注文状況をお知らせします
                </p>

                <div className="mt-4 flex space-x-2">
                  <Button
                    onClick={handleNotificationEnable}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    通知を許可
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDismiss('notification')}
                  >
                    しない
                  </Button>
                </div>
              </div>

              <button
                onClick={() => handleDismiss('notification')}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* オフライン状態インジケーター */}
      {isOffline && (
        <Card className="mb-4 shadow-lg border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
          <CardContent className="p-3">
            <div className="flex items-center space-x-2">
              <div className="flex-shrink-0">
                <Wifi className="h-5 w-5 text-orange-600" />
              </div>
              <p className="text-sm text-gray-700">
                オフラインモードで動作中 - 一部機能に制限があります
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

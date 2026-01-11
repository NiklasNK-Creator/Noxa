import { useState, useEffect } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

interface InstallDialogProps {
  manifest: any;
  onAccept: (grantedPermissions: string[]) => void;
  onCancel: () => void;
}

const permissionNames: Record<string, Record<string, string>> = {
  en: {
    'file-system': 'File System Access',
    'clipboard': 'Clipboard Access',
    'notifications': 'Notifications',
    'storage': 'Local Storage',
    'network': 'Network Requests',
    'media': 'Media Access (Microphone & Camera)',
    'microphone': 'Microphone Access',
    'camera': 'Camera Access',
  },
  de: {
    'file-system': 'Dateisystem-Zugriff',
    'clipboard': 'Zwischenablage-Zugriff',
    'notifications': 'Benachrichtigungen',
    'storage': 'Lokaler Speicher',
    'network': 'Netzwerk-Anfragen',
    'media': 'Media-Zugriff (Mikrofon & Kamera)',
    'microphone': 'Mikrofon-Zugriff',
    'camera': 'Kamera-Zugriff',
  },
  es: {
    'file-system': 'Acceso al Sistema de Archivos',
    'clipboard': 'Acceso al Portapapeles',
    'notifications': 'Notificaciones',
    'storage': 'Almacenamiento Local',
    'network': 'Solicitudes de Red',
    'media': 'Acceso a Medios (Micrófono y Cámara)',
    'microphone': 'Acceso al Micrófono',
    'camera': 'Acceso a la Cámara',
  },
  fr: {
    'file-system': 'Accès au Système de Fichiers',
    'clipboard': 'Accès au Presse-papiers',
    'notifications': 'Notifications',
    'storage': 'Stockage Local',
    'network': 'Requêtes Réseau',
    'media': 'Accès Médias (Microphone et Caméra)',
    'microphone': 'Accès au Microphone',
    'camera': 'Accès à la Caméra',
  },
  ja: {
    'file-system': 'ファイルシステムアクセス',
    'clipboard': 'クリップボードアクセス',
    'notifications': '通知',
    'storage': 'ローカルストレージ',
    'network': 'ネットワークリクエスト',
    'media': 'メディアアクセス（マイクとカメラ）',
    'microphone': 'マイクアクセス',
    'camera': 'カメラアクセス',
  },
  zh: {
    'file-system': '文件系统访问',
    'clipboard': '剪贴板访问',
    'notifications': '通知',
    'storage': '本地存储',
    'network': '网络请求',
    'media': '媒体访问（麦克风和摄像头）',
    'microphone': '麦克风访问',
    'camera': '摄像头访问',
  },
  ru: {
    'file-system': 'Доступ к файловой системе',
    'clipboard': 'Доступ к буферу обмена',
    'notifications': 'Уведомления',
    'storage': 'Локальное хранилище',
    'network': 'Сетевые запросы',
    'media': 'Доступ к медиа (Микрофон и Камера)',
    'microphone': 'Доступ к микрофону',
    'camera': 'Доступ к камере',
  },
  pt: {
    'file-system': 'Acesso ao Sistema de Arquivos',
    'clipboard': 'Acesso à Área de Transferência',
    'notifications': 'Notificações',
    'storage': 'Armazenamento Local',
    'network': 'Solicitações de Rede',
    'media': 'Acesso a Mídia (Microfone e Câmera)',
    'microphone': 'Acesso ao Microfone',
    'camera': 'Acesso à Câmera',
  },
  it: {
    'file-system': 'Accesso al File System',
    'clipboard': 'Accesso agli Appunti',
    'notifications': 'Notifiche',
    'storage': 'Archiviazione Locale',
    'network': 'Richieste di Rete',
    'media': 'Accesso ai Media (Microfono e Fotocamera)',
    'microphone': 'Accesso al Microfono',
    'camera': 'Accesso alla Fotocamera',
  },
  nl: {
    'file-system': 'Bestandssysteem Toegang',
    'clipboard': 'Klembord Toegang',
    'notifications': 'Meldingen',
    'storage': 'Lokale Opslag',
    'network': 'Netwerk Verzoeken',
    'media': 'Media Toegang (Microfoon & Camera)',
    'microphone': 'Microfoon Toegang',
    'camera': 'Camera Toegang',
  },
  pl: {
    'file-system': 'Dostęp do Systemu Plików',
    'clipboard': 'Dostęp do Schowka',
    'notifications': 'Powiadomienia',
    'storage': 'Lokalne Magazyn',
    'network': 'Żądania Sieciowe',
    'media': 'Dostęp do Mediów (Mikrofon i Kamera)',
    'microphone': 'Dostęp do Mikrofonu',
    'camera': 'Dostęp do Kamery',
  },
  tr: {
    'file-system': 'Dosya Sistemi Erişimi',
    'clipboard': 'Pano Erişimi',
    'notifications': 'Bildirimler',
    'storage': 'Yerel Depolama',
    'network': 'Ağ İstekleri',
    'media': 'Medya Erişimi (Mikrofon ve Kamera)',
    'microphone': 'Mikrofon Erişimi',
    'camera': 'Kamera Erişimi',
  },
};

const translations: Record<string, Record<string, string>> = {
  en: {
    installPlugin: 'Install Plugin',
    requestedPermissions: 'Requested Permissions',
    noPermissions: 'This plugin does not require any special permissions.',
    grant: 'Grant',
    deny: 'Deny',
    accept: 'Accept & Install',
    cancel: 'Cancel',
    warning: 'Warning',
    permissionsWarning: 'Only grant permissions if you trust this plugin.',
  },
  de: {
    installPlugin: 'Plugin installieren',
    requestedPermissions: 'Angeforderte Berechtigungen',
    noPermissions: 'Dieses Plugin benötigt keine besonderen Berechtigungen.',
    grant: 'Gewähren',
    deny: 'Verweigern',
    accept: 'Akzeptieren & Installieren',
    cancel: 'Abbrechen',
    warning: 'Warnung',
    permissionsWarning: 'Gewähre Berechtigungen nur, wenn du diesem Plugin vertraust.',
  },
  es: {
    installPlugin: 'Instalar Complemento',
    requestedPermissions: 'Permisos Solicitados',
    noPermissions: 'Este complemento no requiere permisos especiales.',
    grant: 'Conceder',
    deny: 'Denegar',
    accept: 'Aceptar e Instalar',
    cancel: 'Cancelar',
    warning: 'Advertencia',
    permissionsWarning: 'Solo concede permisos si confías en este complemento.',
  },
  fr: {
    installPlugin: 'Installer le Plugin',
    requestedPermissions: 'Permissions Demandées',
    noPermissions: 'Ce plugin ne nécessite aucune permission spéciale.',
    grant: 'Accorder',
    deny: 'Refuser',
    accept: 'Accepter et Installer',
    cancel: 'Annuler',
    warning: 'Avertissement',
    permissionsWarning: 'N\'accorde des permissions que si tu fais confiance à ce plugin.',
  },
  ja: {
    installPlugin: 'プラグインをインストール',
    requestedPermissions: '要求された権限',
    noPermissions: 'このプラグインは特別な権限を必要としません。',
    grant: '許可',
    deny: '拒否',
    accept: '承認してインストール',
    cancel: 'キャンセル',
    warning: '警告',
    permissionsWarning: 'このプラグインを信頼する場合のみ権限を許可してください。',
  },
  zh: {
    installPlugin: '安装插件',
    requestedPermissions: '请求的权限',
    noPermissions: '此插件不需要任何特殊权限。',
    grant: '授予',
    deny: '拒绝',
    accept: '接受并安装',
    cancel: '取消',
    warning: '警告',
    permissionsWarning: '仅在信任此插件时授予权限。',
  },
  ru: {
    installPlugin: 'Установить плагин',
    requestedPermissions: 'Запрошенные разрешения',
    noPermissions: 'Этот плагин не требует специальных разрешений.',
    grant: 'Предоставить',
    deny: 'Отказать',
    accept: 'Принять и установить',
    cancel: 'Отмена',
    warning: 'Предупреждение',
    permissionsWarning: 'Предоставляйте разрешения только если вы доверяете этому плагину.',
  },
  pt: {
    installPlugin: 'Instalar Plugin',
    requestedPermissions: 'Permissões Solicitadas',
    noPermissions: 'Este plugin não requer permissões especiais.',
    grant: 'Conceder',
    deny: 'Negar',
    accept: 'Aceitar e Instalar',
    cancel: 'Cancelar',
    warning: 'Aviso',
    permissionsWarning: 'Conceda permissões apenas se confiar neste plugin.',
  },
  it: {
    installPlugin: 'Installa Plugin',
    requestedPermissions: 'Permessi Richiesti',
    noPermissions: 'Questo plugin non richiede permessi speciali.',
    grant: 'Concedi',
    deny: 'Nega',
    accept: 'Accetta e Installa',
    cancel: 'Annulla',
    warning: 'Avviso',
    permissionsWarning: 'Concedi permessi solo se ti fidi di questo plugin.',
  },
  nl: {
    installPlugin: 'Plugin Installeren',
    requestedPermissions: 'Aangevraagde Machtigingen',
    noPermissions: 'Deze plugin vereist geen speciale machtigingen.',
    grant: 'Toestaan',
    deny: 'Weigeren',
    accept: 'Accepteren & Installeren',
    cancel: 'Annuleren',
    warning: 'Waarschuwing',
    permissionsWarning: 'Verleen alleen machtigingen als je deze plugin vertrouwt.',
  },
  pl: {
    installPlugin: 'Zainstaluj Plugin',
    requestedPermissions: 'Żądane Uprawnienia',
    noPermissions: 'Ten plugin nie wymaga specjalnych uprawnień.',
    grant: 'Przyznaj',
    deny: 'Odmów',
    accept: 'Zaakceptuj i Zainstaluj',
    cancel: 'Anuluj',
    warning: 'Ostrzeżenie',
    permissionsWarning: 'Przyznawaj uprawnienia tylko jeśli ufasz temu pluginowi.',
  },
  tr: {
    installPlugin: 'Eklentiyi Yükle',
    requestedPermissions: 'İstenen İzinler',
    noPermissions: 'Bu eklenti özel izin gerektirmez.',
    grant: 'İzin Ver',
    deny: 'Reddet',
    accept: 'Kabul Et ve Yükle',
    cancel: 'İptal',
    warning: 'Uyarı',
    permissionsWarning: 'Yalnızca bu eklentiye güveniyorsanız izin verin.',
  },
};

export default function InstallDialog({ manifest, onAccept, onCancel }: InstallDialogProps) {
  const { language } = useSettingsStore();
  const t = translations[language] || translations.en;
  const permNames = permissionNames[language] || permissionNames.en;
  
  const requestedPermissions = manifest.permissions || [];
  const [grantedPermissions, setGrantedPermissions] = useState<string[]>([]);

  useEffect(() => {
    // Standardmäßig alle Permissions verweigern
    setGrantedPermissions([]);
  }, []);

  const togglePermission = (permission: string) => {
    setGrantedPermissions(prev => {
      if (prev.includes(permission)) {
        return prev.filter(p => p !== permission);
      } else {
        return [...prev, permission];
      }
    });
  };

  const handleAccept = () => {
    onAccept(grantedPermissions);
  };

  return (
    <div className="install-dialog-overlay" onClick={onCancel}>
      <div className="install-dialog" onClick={(e) => e.stopPropagation()}>
        <h2 className="install-dialog-title">{t.installPlugin}</h2>
        
        <div className="install-dialog-info">
          <p><strong>{manifest.name}</strong></p>
          <p>{manifest.description || ''}</p>
        </div>

        {requestedPermissions.length > 0 ? (
          <>
            <div className="install-dialog-warning">
              <strong>{t.warning}:</strong> {t.permissionsWarning}
            </div>
            
            <div className="install-dialog-permissions">
              <h3>{t.requestedPermissions}</h3>
              {requestedPermissions.map((permission: string) => (
                <div key={permission} className="permission-item">
                  <label className="permission-checkbox">
                    <input
                      type="checkbox"
                      checked={grantedPermissions.includes(permission)}
                      onChange={() => togglePermission(permission)}
                    />
                    <span>{permNames[permission] || permission}</span>
                  </label>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="install-dialog-no-permissions">
            {t.noPermissions}
          </div>
        )}

        <div className="install-dialog-actions">
          <button className="install-dialog-button install-dialog-button-cancel" onClick={onCancel}>
            {t.cancel}
          </button>
          <button className="install-dialog-button install-dialog-button-accept" onClick={handleAccept}>
            {t.accept}
          </button>
        </div>
      </div>
    </div>
  );
}

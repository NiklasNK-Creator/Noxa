import { useSettingsStore } from '../store/useSettingsStore';
import type { StorePlugin } from '../types/electron';

interface ExtensionWarningDialogProps {
  plugin: StorePlugin;
  manifest: any;
  onAccept: () => void;
  onCancel: () => void;
}

const translations: Record<string, Record<string, string>> = {
  en: {
    warning: 'Warning: Extension Installation',
    extensionWarning: 'You are about to install an Extension. Extensions have full access to the client and can modify core functionality, add new settings, themes, and features. This could potentially cause harm to your system or data.',
    accept: 'I Understand, Install Anyway',
    cancel: 'Cancel',
    extensionName: 'Extension',
  },
  de: {
    warning: 'Warnung: Extension-Installation',
    extensionWarning: 'Sie sind dabei, eine Extension zu installieren. Extensions haben vollen Zugriff auf den Client und können Kernfunktionen ändern, neue Einstellungen, Themes und Features hinzufügen. Dies könnte potenziell Schaden an Ihrem System oder Daten verursachen.',
    accept: 'Ich verstehe, trotzdem installieren',
    cancel: 'Abbrechen',
    extensionName: 'Extension',
  },
  es: {
    warning: 'Advertencia: Instalación de Extensión',
    extensionWarning: 'Estás a punto de instalar una Extensión. Las extensiones tienen acceso completo al cliente y pueden modificar la funcionalidad principal, agregar nuevas configuraciones, temas y funciones. Esto podría causar daño a su sistema o datos.',
    accept: 'Entiendo, instalar de todos modos',
    cancel: 'Cancelar',
    extensionName: 'Extensión',
  },
  fr: {
    warning: 'Avertissement: Installation d\'Extension',
    extensionWarning: 'Vous êtes sur le point d\'installer une Extension. Les extensions ont un accès complet au client et peuvent modifier les fonctionnalités principales, ajouter de nouveaux paramètres, thèmes et fonctionnalités. Cela pourrait potentiellement causer des dommages à votre système ou à vos données.',
    accept: 'Je comprends, installer quand même',
    cancel: 'Annuler',
    extensionName: 'Extension',
  },
  ja: {
    warning: '警告: 拡張機能のインストール',
    extensionWarning: '拡張機能をインストールしようとしています。拡張機能はクライアントへの完全なアクセス権を持ち、コア機能を変更し、新しい設定、テーマ、機能を追加できます。これはシステムやデータに損害を与える可能性があります。',
    accept: '理解しました、それでもインストールします',
    cancel: 'キャンセル',
    extensionName: '拡張機能',
  },
  zh: {
    warning: '警告: 扩展安装',
    extensionWarning: '您即将安装一个扩展。扩展拥有对客户端的完全访问权限，可以修改核心功能、添加新设置、主题和功能。这可能会对您的系统或数据造成损害。',
    accept: '我理解，仍然安装',
    cancel: '取消',
    extensionName: '扩展',
  },
  ru: {
    warning: 'Предупреждение: Установка расширения',
    extensionWarning: 'Вы собираетесь установить расширение. Расширения имеют полный доступ к клиенту и могут изменять основные функции, добавлять новые настройки, темы и функции. Это может потенциально нанести вред вашей системе или данным.',
    accept: 'Я понимаю, все равно установить',
    cancel: 'Отмена',
    extensionName: 'Расширение',
  },
  pt: {
    warning: 'Aviso: Instalação de Extensão',
    extensionWarning: 'Você está prestes a instalar uma Extensão. As extensões têm acesso completo ao cliente e podem modificar a funcionalidade principal, adicionar novas configurações, temas e recursos. Isso pode causar danos ao seu sistema ou dados.',
    accept: 'Entendo, instalar mesmo assim',
    cancel: 'Cancelar',
    extensionName: 'Extensão',
  },
  it: {
    warning: 'Avviso: Installazione Estensione',
    extensionWarning: 'Stai per installare un\'Estensione. Le estensioni hanno accesso completo al client e possono modificare le funzionalità principali, aggiungere nuove impostazioni, temi e funzionalità. Questo potrebbe potenzialmente causare danni al sistema o ai dati.',
    accept: 'Capisco, installa comunque',
    cancel: 'Annulla',
    extensionName: 'Estensione',
  },
  nl: {
    warning: 'Waarschuwing: Extensie-installatie',
    extensionWarning: 'U staat op het punt een Extensie te installeren. Extensies hebben volledige toegang tot de client en kunnen kernfunctionaliteit wijzigen, nieuwe instellingen, thema\'s en functies toevoegen. Dit kan mogelijk schade aan uw systeem of gegevens veroorzaken.',
    accept: 'Ik begrijp het, installeer toch',
    cancel: 'Annuleren',
    extensionName: 'Extensie',
  },
  pl: {
    warning: 'Ostrzeżenie: Instalacja rozszerzenia',
    extensionWarning: 'Zaraz zainstalujesz Rozszerzenie. Rozszerzenia mają pełny dostęp do klienta i mogą modyfikować główne funkcje, dodawać nowe ustawienia, motywy i funkcje. Może to potencjalnie spowodować szkody w systemie lub danych.',
    accept: 'Rozumiem, zainstaluj mimo to',
    cancel: 'Anuluj',
    extensionName: 'Rozszerzenie',
  },
  tr: {
    warning: 'Uyarı: Uzantı Kurulumu',
    extensionWarning: 'Bir Uzantı kurmak üzeresiniz. Uzantılar istemciye tam erişime sahiptir ve temel işlevselliği değiştirebilir, yeni ayarlar, temalar ve özellikler ekleyebilir. Bu potansiyel olarak sisteminize veya verilerinize zarar verebilir.',
    accept: 'Anladım, yine de kur',
    cancel: 'İptal',
    extensionName: 'Uzantı',
  },
};

export default function ExtensionWarningDialog({ plugin, manifest, onAccept, onCancel }: ExtensionWarningDialogProps) {
  const { language } = useSettingsStore();
  const t = translations[language] || translations.en;

  return (
    <div className="install-dialog-overlay" onClick={onCancel}>
      <div className="install-dialog extension-warning-dialog" onClick={(e) => e.stopPropagation()}>
        <h2 className="install-dialog-title">{t.warning}</h2>
        
        <div className="install-dialog-info">
          <p><strong>{plugin.name}</strong></p>
          <p>{manifest?.description || ''}</p>
        </div>

        <div className="install-dialog-warning extension-warning-content">
          <strong>{t.warning}:</strong>
          <p>{t.extensionWarning}</p>
        </div>

        <div className="install-dialog-actions">
          <button className="install-dialog-button install-dialog-button-cancel" onClick={onCancel}>
            {t.cancel}
          </button>
          <button className="install-dialog-button install-dialog-button-danger" onClick={onAccept}>
            {t.accept}
          </button>
        </div>
      </div>
    </div>
  );
}

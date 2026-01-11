export default function TitleBar() {
  const { windowMinimize, windowMaximize, windowClose } = window.electronAPI;

  return (
    <div className="titlebar" data-theme>
      <div className="titlebar-drag-region">
        <span className="titlebar-title">Noxa</span>
      </div>
      <div className="titlebar-controls">
        <button
          className="titlebar-button"
          onClick={() => windowMinimize()}
          aria-label="Minimize"
        >
          <svg width="12" height="12" viewBox="0 0 12 12">
            <rect x="0" y="5" width="12" height="2" fill="currentColor" />
          </svg>
        </button>
        <button
          className="titlebar-button"
          onClick={() => windowMaximize()}
          aria-label="Maximize"
        >
          <svg width="12" height="12" viewBox="0 0 12 12">
            <rect x="2" y="2" width="8" height="8" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </svg>
        </button>
        <button
          className="titlebar-button titlebar-button-close"
          onClick={() => windowClose()}
          aria-label="Close"
        >
          <svg width="12" height="12" viewBox="0 0 12 12">
            <path d="M1 1 L11 11 M11 1 L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

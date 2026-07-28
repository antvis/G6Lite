export function AntVLogo({ className }: { className?: string }) {
  return (
    <span className={className ? `antv-logo ${className}` : 'antv-logo'} aria-label="AntV">
      <span className="antv-logo-mark" aria-hidden>
        <svg viewBox="0 0 32 28" role="presentation">
          <path d="M5 21 12 7l7 14 8-14" />
          <circle cx="5" cy="21" r="2.4" />
          <circle cx="12" cy="7" r="2.4" />
          <circle cx="19" cy="21" r="2.4" />
          <circle cx="27" cy="7" r="2.4" />
        </svg>
      </span>
      <span className="antv-logo-text">AntV</span>
    </span>
  );
}

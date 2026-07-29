import { withBasePath } from '@/lib/shared';

export function AntVLogo({ className }: { className?: string }) {
  return (
    <span className={className ? `antv-logo ${className}` : 'antv-logo'} aria-label="AntV">
      <span className="antv-logo-mark" aria-hidden>
        <img src={withBasePath('/icon.svg')} alt="" width="32" height="28" />
      </span>
      <span className="antv-logo-text">AntV</span>
    </span>
  );
}

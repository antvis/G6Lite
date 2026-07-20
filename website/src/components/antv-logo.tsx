export const ANTV_LOGO_URL =
  'https://mdn.alipayobjects.com/huamei_qa8qxu/afts/img/A%2AA-lcQbVTpjwAAAAAAAAAAAAADmJ7AQ/original';

export function AntVLogo({ className }: { className?: string }) {
  return (
    <span className={className ? `antv-logo ${className}` : 'antv-logo'} aria-label="AntV">
      <span className="antv-logo-mark" aria-hidden>
        <img src={ANTV_LOGO_URL} alt="" width={82} height={28} loading="eager" />
      </span>
      <span className="antv-logo-text">AntV</span>
    </span>
  );
}

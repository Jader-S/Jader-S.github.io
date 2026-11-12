interface Props {
  label?: string;
}

export default function LoadingHUD({ label = 'Calibrating' }: Props) {
  return (
    <div className="loading-hud" role="status" aria-live="polite">
      <div className="loading-hud__ring" />
      <div className="loading-hud__label">{label}</div>
    </div>
  );
}
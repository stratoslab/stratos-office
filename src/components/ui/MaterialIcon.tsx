interface MaterialIconProps {
  name: string;
  className?: string;
  filled?: boolean;
  size?: number;
  style?: React.CSSProperties;
}

export default function MaterialIcon({
  name,
  className = "",
  filled = false,
  size = 24,
  style,
}: MaterialIconProps) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' ${size}`,
        fontSize: size,
        lineHeight: 1,
        ...style,
      }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}

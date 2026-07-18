interface MaterialIconProps {
  name: string
  filled?: boolean
  size?: number
  color?: string
  style?: React.CSSProperties
}

export default function MaterialIcon({ name, filled = false, size = 24, color, style }: MaterialIconProps) {
  return (
    <span
      className="material-symbols-outlined"
      style={{
        fontSize: size,
        color,
        fontVariationSettings: filled ? "'FILL' 1" : "'FILL' 0",
        verticalAlign: 'middle',
        ...style,
      }}
    >
      {name}
    </span>
  )
}
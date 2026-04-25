export default function Logo({ size = 'md', className = '' }) {
  const sizes = { sm: 28, md: 36, lg: 48 }
  const px = sizes[size] || sizes.md
  const textSize = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl' : 'text-base'
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg width={px} height={Math.round(px * 0.83)} viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* ===== P LETTER ===== */}
        {/* Gold: left vertical bar of P */}
        <polygon points="5,20 20,20 20,95 5,95" fill="#F5A623"/>
        {/* Gold: middle horizontal arm of P (bowl midpoint) */}
        <polygon points="5,45 55,45 55,60 5,60" fill="#F5A623"/>
        {/* Black: top horizontal bar of P (overlays gold, full width of P) */}
        <polygon points="5,5 70,5 70,20 5,20" fill="#111111"/>
        {/* Black: right side vertical of P bowl */}
        <polygon points="55,5 70,5 70,60 55,60" fill="#111111"/>

        {/* ===== X LETTER ===== */}
        {/* Black: main left diagonal of X (bottom-left to top-right, thick) */}
        <polygon points="25,95 42,95 90,5 73,5" fill="#111111"/>
        {/* Black: lower-right arm of X */}
        <polygon points="73,95 90,95 66,58 49,58" fill="#111111"/>
        {/* Gold: upper-right arm of X */}
        <polygon points="90,5 107,5 83,38 66,38" fill="#F5A623"/>
      </svg>
      <div className={`font-condensed font-bold tracking-wide leading-none ${textSize}`}>
        <span className="text-white">PARKER</span>
        <br />
        <span className="text-gold">EXPRESS</span>
      </div>
    </div>
  )
}

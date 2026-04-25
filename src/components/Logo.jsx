export default function Logo({ size = 'md', className = '' }) {
  const sizes = { sm: 28, md: 36, lg: 48 }
  const px = sizes[size] || sizes.md
  const textSize = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl' : 'text-base'
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg width={px} height={px} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* P shape - gold left vertical bar */}
        <rect x="8" y="28" width="14" height="52" fill="#F5A623"/>
        {/* P shape - gold middle horizontal bar */}
        <rect x="8" y="42" width="38" height="14" fill="#F5A623"/>
        {/* P shape - black top horizontal bar */}
        <rect x="8" y="8" width="52" height="14" fill="#111111"/>
        {/* P shape - black right bump (vertical right side of P bowl) */}
        <rect x="46" y="8" width="14" height="48" fill="#111111"/>
        {/* X shape - black main diagonal (bottom-left to upper area) */}
        <polygon points="18,92 32,92 78,8 64,8" fill="#111111"/>
        {/* X shape - black lower-right arm */}
        <polygon points="64,92 78,92 58,62 44,62" fill="#111111"/>
        {/* X shape - gold upper-right arm */}
        <polygon points="78,8 92,8 72,38 58,38" fill="#F5A623"/>
      </svg>
      <div className={`font-condensed font-bold tracking-wide leading-none ${textSize}`}>
        <span className="text-white">PARKER</span>
        <br />
        <span className="text-gold">EXPRESS</span>
      </div>
    </div>
  )
}

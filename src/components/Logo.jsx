export default function Logo({ size = 'md', className = '' }) {
  const sizes = { sm: 28, md: 36, lg: 48 }
  const px = sizes[size] || sizes.md
  const textSize = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl' : 'text-base'
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg width={px} height={px} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="22" width="15" height="68" fill="#F5A623"/>
        <rect x="4" y="44" width="52" height="14" fill="#F5A623"/>
        <polygon points="76,4 94,4 70,36 52,36" fill="#F5A623"/>
        <rect x="4" y="4" width="62" height="18" fill="#111"/>
        <rect x="51" y="4" width="15" height="54" fill="#111"/>
        <polygon points="20,96 36,96 86,4 70,4" fill="#111"/>
        <polygon points="70,96 86,96 62,58 46,58" fill="#111"/>
      </svg>
      <div className={`font-condensed font-bold tracking-wide leading-none ${textSize}`}>
        <span className="text-white">PARKER</span>
        <br />
        <span className="text-gold">EXPRESS</span>
      </div>
    </div>
  )
}

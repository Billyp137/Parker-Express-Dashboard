export default function Logo({ size = 'md', className = '' }) {
  const sizes = { sm: 28, md: 36, lg: 48 }
  const px = sizes[size] || sizes.md
  const textSize = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl' : 'text-base'

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg width={px} height={px} viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="6" fill="#111"/>
        {/* P shape */}
        <path d="M6 10 L6 28 Q6 36 14 36 L24 36" stroke="white" strokeWidth="4.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 26 L14 36" stroke="#F5A623" strokeWidth="4.5" strokeLinecap="round"/>
        {/* X shape */}
        <path d="M20 10 L38 36" stroke="white" strokeWidth="4.5" strokeLinecap="round"/>
        <path d="M38 10 L27 26" stroke="#F5A623" strokeWidth="4.5" strokeLinecap="round"/>
      </svg>
      <div className={`font-condensed font-bold tracking-wide leading-none ${textSize}`}>
        <span className="text-white">PARKER</span>
        <br />
        <span className="text-gold">EXPRESS</span>
      </div>
    </div>
  )
}

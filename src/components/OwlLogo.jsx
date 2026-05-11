// Mascote coruja SVG inline — permite animações e colorização via CSS
export default function OwlLogo({ size = 48, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Corpo */}
      <ellipse cx="32" cy="40" rx="16" ry="18" fill="currentColor" className="text-primary" />
      {/* Cabeça */}
      <circle cx="32" cy="20" r="14" fill="currentColor" className="text-primary" />
      {/* Orelhas/tufos */}
      <polygon points="20,10 16,2 24,8" fill="currentColor" className="text-primary" />
      <polygon points="44,10 48,2 40,8" fill="currentColor" className="text-primary" />
      {/* Olhos externos */}
      <circle cx="26" cy="19" r="6" fill="white" />
      <circle cx="38" cy="19" r="6" fill="white" />
      {/* Pupilas */}
      <circle cx="26" cy="19" r="3.5" fill="#0f1f14" />
      <circle cx="38" cy="19" r="3.5" fill="#0f1f14" />
      {/* Brilho nos olhos (âmbar) */}
      <circle cx="27.2" cy="17.8" r="1.3" fill="#f59e0b" />
      <circle cx="39.2" cy="17.8" r="1.3" fill="#f59e0b" />
      {/* Bico */}
      <polygon points="32,24 29,28 35,28" fill="#f59e0b" />
      {/* Peito claro */}
      <ellipse cx="32" cy="42" rx="9" ry="11" fill="#2d6a4f" />
      {/* Padrão do peito */}
      <ellipse cx="32" cy="44" rx="5" ry="7" fill="#1a472a" opacity="0.4" />
      {/* Pés */}
      <g stroke="#f59e0b" strokeWidth="2" strokeLinecap="round">
        <line x1="25" y1="56" x2="21" y2="62" />
        <line x1="25" y1="56" x2="25" y2="63" />
        <line x1="25" y1="56" x2="29" y2="62" />
        <line x1="39" y1="56" x2="35" y2="62" />
        <line x1="39" y1="56" x2="39" y2="63" />
        <line x1="39" y1="56" x2="43" y2="62" />
      </g>
    </svg>
  )
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="logo">
      <svg className="logo-mark" viewBox="0 0 64 64" aria-hidden="true">
        <rect width="64" height="64" rx="16" fill="#1F4F4A" />
        <rect x="14" y="34" width="8" height="16" rx="2" fill="#F4F0EA" />
        <rect x="28" y="22" width="8" height="28" rx="2" fill="#F4F0EA" />
        <rect x="42" y="14" width="8" height="36" rx="2" fill="#C4A574" />
      </svg>
      {!compact && (
        <span>
          LinkedIn <b>Studio</b>
        </span>
      )}
    </div>
  )
}

export function NavIcon({ name }: { name: string }) {
  const common = {
    className: 'nav-ico',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
  }
  switch (name) {
    case 'home':
      return (
        <svg {...common}>
          <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" />
        </svg>
      )
    case 'strategy':
      return (
        <svg {...common}>
          <rect x="4" y="14" width="4" height="6" rx="1" />
          <rect x="10" y="10" width="4" height="10" rx="1" />
          <rect x="16" y="6" width="4" height="14" rx="1" />
        </svg>
      )
    case 'create':
      return (
        <svg {...common}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      )
    case 'calendar':
      return (
        <svg {...common}>
          <rect x="4" y="6" width="16" height="14" rx="2" />
          <path d="M4 10h16M8 4v4M16 4v4" />
        </svg>
      )
    case 'library':
      return (
        <svg {...common}>
          <path d="M5 5h10v14H5zM15 8h4v11h-4" />
        </svg>
      )
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
        </svg>
      )
  }
}

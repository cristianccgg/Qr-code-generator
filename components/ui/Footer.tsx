import Link from 'next/link'

interface FooterProps {
  variant?: 'light' | 'dark' | 'transparent'
  className?: string
}

export default function Footer({ variant = 'transparent', className = '' }: FooterProps) {
  const baseStyles = 'py-8 text-sm'

  const variantStyles = {
    light: 'bg-gray-50 text-gray-600',
    dark: 'bg-gray-900 text-gray-400',
    transparent: 'text-white/60',
  }

  const linkStyles = {
    light: 'text-gray-600 hover:text-gray-900',
    dark: 'text-gray-400 hover:text-white',
    transparent: 'text-white/60 hover:text-white',
  }

  return (
    <footer className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Copyright */}
          <p>&copy; {new Date().getFullYear()} QR Generator. All rights reserved.</p>

          {/* Links */}
          <nav className="flex items-center gap-6">
            <Link
              href="/pricing"
              className={`transition-colors ${linkStyles[variant]}`}
            >
              Pricing
            </Link>
            <Link
              href="/legal/terms"
              className={`transition-colors ${linkStyles[variant]}`}
            >
              Terms of Service
            </Link>
            <Link
              href="/legal/privacy"
              className={`transition-colors ${linkStyles[variant]}`}
            >
              Privacy Policy
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}

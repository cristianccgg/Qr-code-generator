'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { FiMenu, FiX, FiGrid } from 'react-icons/fi';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const loading = status === 'loading';

  return (
    <nav className="backdrop-blur-md bg-white/10 border-b border-white/20 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo y brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-[50px] h-[50px] transition-transform group-hover:scale-110">
              <Image
                src="/images/qr-logo.jpeg"
                alt="QR Generator Logo"
                fill
                className="object-cover rounded-xl shadow-lg"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-black text-lg md:text-xl tracking-tight">
                QR Generator
              </span>
              <span className="text-white/60 text-xs font-medium hidden md:block">
                Fast & Free
              </span>
            </div>
          </Link>

          {/* Desktop buttons */}
          <div className="hidden md:flex items-center gap-3">
            {!loading && (
              <>
                {session ? (
                  // Usuario autenticado
                  <>
                    <Link
                      href="/dashboard"
                      className="px-6 py-2.5 text-white font-semibold rounded-xl hover:bg-white/10 transition-all flex items-center gap-2"
                    >
                      <FiGrid className="text-lg" />
                      Dashboard
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="px-6 py-2.5 bg-white/20 backdrop-blur text-white font-bold rounded-xl border-2 border-white/30 hover:bg-white hover:text-[#f5576c] transition-all hover:scale-105"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  // Usuario no autenticado
                  <>
                    <Link
                      href="/auth/signin"
                      className="px-6 py-2.5 bg-white/20 backdrop-blur text-white font-bold rounded-xl border-2 border-white/30 hover:bg-white hover:text-[#f5576c] transition-all hover:scale-105"
                    >
                      Log In
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="px-6 py-2.5 bg-gradient-to-r from-[#40B49D] to-[#2d8b7a] text-white font-bold rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all"
                    >
                      Sign Up Free
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-all"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <FiX className="w-6 h-6" />
            ) : (
              <FiMenu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && !loading && (
          <div className="md:hidden pb-4 flex flex-col gap-2 animate-slideInUp">
            {session ? (
              // Usuario autenticado (mobile)
              <>
                <Link
                  href="/dashboard"
                  className="w-full px-6 py-3 text-white font-semibold rounded-xl hover:bg-white/10 transition-all text-left flex items-center gap-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FiGrid className="text-lg" />
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    signOut({ callbackUrl: '/' });
                  }}
                  className="w-full px-6 py-3 bg-white/20 backdrop-blur text-white font-bold rounded-xl border-2 border-white/30 hover:bg-white hover:text-[#f5576c] transition-all text-left"
                >
                  Sign Out
                </button>
              </>
            ) : (
              // Usuario no autenticado (mobile)
              <>
                <Link
                  href="/auth/signin"
                  className="w-full px-6 py-3 bg-white/20 backdrop-blur text-white font-bold rounded-xl border-2 border-white/30 hover:bg-white hover:text-[#f5576c] transition-all text-left"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Log In
                </Link>
                <Link
                  href="/auth/signup"
                  className="w-full px-6 py-3 bg-gradient-to-r from-[#40B49D] to-[#2d8b7a] text-white font-bold rounded-xl shadow-lg text-left"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up Free
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left side - Demo Mode indicator */}
          <div className="text-sm text-gray-400">
            Demo Mode - Switch Views:
          </div>

          {/* Center - Navigation Links */}
          <nav className="flex items-center gap-6">
            <Link
              href="/"
              className={`flex items-center gap-2 px-3 py-1 rounded transition-colors ${
                pathname === '/' ? 'bg-gray-800' : 'hover:bg-gray-800'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Public Site</span>
            </Link>

            <Link
              href="/doctor/dashboard"
              className={`flex items-center gap-2 px-3 py-1 rounded transition-colors ${
                pathname?.startsWith('/doctor') ? 'bg-gray-800' : 'hover:bg-gray-800'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Doctor</span>
            </Link>

            <Link
              href="/hospital/dashboard"
              className={`flex items-center gap-2 px-3 py-1 rounded transition-colors ${
                pathname?.startsWith('/hospital') ? 'bg-gray-800' : 'hover:bg-gray-800'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>Hospital</span>
            </Link>

            <Link
              href="/register/doctor"
              className={`flex items-center gap-2 px-3 py-1 rounded transition-colors ${
                pathname?.startsWith('/register/doctor') ? 'bg-gray-800' : 'hover:bg-gray-800'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <span>Doctor Register</span>
            </Link>

            <Link
              href="/register/hospital"
              className={`flex items-center gap-2 px-3 py-1 rounded transition-colors ${
                pathname?.startsWith('/register/hospital') ? 'bg-gray-800' : 'hover:bg-gray-800'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <span>Hospital Register</span>
            </Link>

            <Link
              href="/admin/login"
              className={`flex items-center gap-2 px-3 py-1 rounded transition-colors ${
                pathname?.startsWith('/admin') ? 'bg-gray-800' : 'hover:bg-gray-800'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Admin</span>
            </Link>
          </nav>

          {/* Right side - Login button */}
          <div>
            <Link
              href="/login"
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}


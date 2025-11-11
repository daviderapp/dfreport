'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface NavbarProps {
  user: {
    name: string;
    email: string;
  };
  hasFamiglia: boolean;
  isCapofamiglia?: boolean;
  isLavoratore?: boolean;
}

export function Navbar({ user, hasFamiglia, isCapofamiglia = false, isLavoratore = false }: NavbarProps) {
  const pathname = usePathname();

  const navLinks = [
    // Se non ha famiglia, mostra SOLO gestione profilo
    ...(!hasFamiglia ? [
      { href: '/profilo', label: 'Gestione Profilo' },
    ] : []),
    // Se ha famiglia, mostra tutto il resto
    ...(hasFamiglia ? [
      { href: '/dashboard', label: 'Dashboard' },
      { href: '/report', label: 'Report' },
      { href: '/abitazioni', label: 'Abitazioni' },
    ] : []),
    ...(isCapofamiglia ? [
      { href: '/famiglia/membri', label: 'Gestione Membri' },
    ] : []),
  ];

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* ROW DESKTOP: 3 COLONNE */}
        <div className="flex h-16 items-center">
          {/* Colonna sinistra (logo) */}
          <div className="flex-1 flex items-center justify-start">
            <Link href="/dashboard" className="flex items-center">
              <Image src="/dfreport-logo.png" alt="DFReport" width={100} height={100} />
            </Link>
          </div>

          {/* Colonna centrale (nav links) */}
          <div className="flex-1 hidden sm:flex items-center justify-center">
            <div className="flex space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'inline-flex items-center px-3 py-2 text-sm font-medium rounded-md',
                    pathname === link.href
                      ? 'text-green-600 bg-green-50'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Colonna destra (utente) */}
          <div className="flex-1 flex items-center justify-end">
            <div className="relative hidden sm:block group">
              {/* Trigger (nome + email) */}
              <button
                type="button"
                className="text-right flex flex-col items-end focus:outline-none"
                aria-haspopup="menu"
                aria-expanded="false"
              >

                <div className="h-12 w-12 rounded-full bg-green-600 text-white flex items-center justify-center font-semibold uppercase hover:bg-green-500">
              {user.name[0] + "" + user.name.split(" ")[1][0]}
            </div>
              </button>

              {/* Dropdown */}
              <div
                className="
                  absolute right-0 top-full z-50 w-48 origin-top-right
                  rounded-xl border border-gray-100 bg-white shadow-lg ring-1 ring-black/5
                  invisible opacity-0 scale-95 translate-y-0 transition ease-out duration-150
                  group-hover:visible group-hover:opacity-100 group-hover:scale-100
                  group-focus-within:visible group-focus-within:opacity-100 group-focus-within:scale-100
                  before:content-[''] before:absolute before:-top-2 before:left-0 before:right-0 before:h-2
                "
                role="menu"
              >
                <div className="p-1">
                  <Link
                    href="/profilo"
                    className="block w-full px-3 py-2 text-sm rounded-md text-gray-700 hover:bg-gray-50"
                    role="menuitem"
                  >
                    Profilo
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 text-sm rounded-md text-gray-700 hover:bg-gray-50"
                    role="menuitem"
                  >
                    Esci
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MENU MOBILE */}
        <div className="sm:hidden border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'block px-3 py-2 text-base font-medium rounded-md',
                  pathname === link.href
                    ? 'text-green-600 bg-green-50'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

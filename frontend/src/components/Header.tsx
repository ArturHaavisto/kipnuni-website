import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth0 } from '@auth0/auth0-react';
import { NavLink, Link } from 'react-router-dom';
import LanguageSwitcher from './LanguageSwitcher';
import { DarkModeToggle } from './DarkModeToggle';
import { NavModeToggle } from './NavModeToggle';

const AUTH0_AVAILABLE =
  !!import.meta.env.VITE_AUTH0_DOMAIN && !!import.meta.env.VITE_AUTH0_CLIENT_ID;

const navLinks = [
  { to: '/', label: 'nav.now' },
  { to: '/me', label: 'nav.me' },
  { to: '/link', label: 'nav.link' },
  { to: '/history', label: 'nav.history' },
  { to: '/future', label: 'nav.future' },
] as const;

/** Only rendered when Auth0 is configured (wrapped in Auth0Provider) */
function AuthButtons() {
  const { t } = useTranslation();
  const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0();

  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 dark:text-gray-300">{user?.name}</span>
        <button
          onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
          className="rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
        >
          {t('nav.logout')}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => loginWithRedirect()}
      className="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
    >
      {t('nav.login')}
    </button>
  );
}

export default function Header() {
  const { t } = useTranslation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `transition-colors ${isActive ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'}`;

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur dark:border-gray-700 dark:bg-gray-900/95">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Left: Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo-website.png" alt={t('common.appName')} className="h-8 w-8 object-contain" />
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            {t('common.appName')}
          </span>
        </Link>

        {/* Center: Nav links (hidden on mobile) */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map(({ to, label }) => (
            <NavLink key={to} to={to} end={to === '/'} className={linkClass}>
              {t(label)}
            </NavLink>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          <DarkModeToggle />
          <div className="hidden md:block"><LanguageSwitcher /></div>
          <NavModeToggle />
          <div className="hidden md:block">{AUTH0_AVAILABLE && <AuthButtons />}</div>

          {/* Hamburger (mobile) */}
          <button
            onClick={() => setDrawerOpen(!drawerOpen)}
            aria-label={t('header.menu')}
            className="rounded-md p-2 text-gray-600 hover:bg-gray-100 md:hidden dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
              {drawerOpen ? (
                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
              ) : (
                <path fillRule="evenodd" d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75ZM2 10a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 10Zm0 5.25a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <nav className="border-t border-gray-200 px-4 pb-4 pt-2 md:hidden dark:border-gray-700">
          <div className="flex flex-col gap-3">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={linkClass}
                onClick={() => setDrawerOpen(false)}
              >
                {t(label)}
              </NavLink>
            ))}
            <div className="pt-2"><LanguageSwitcher /></div>
            {AUTH0_AVAILABLE && <AuthButtons />}
          </div>
        </nav>
      )}
    </header>
  );
}

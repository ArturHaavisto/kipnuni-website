import { useTranslation } from 'react-i18next';
import { useAuth0 } from '@auth0/auth0-react';
import { Link } from 'react-router-dom';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header() {
  const { t } = useTranslation();
  const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0();

  return (
    <header className="bg-white shadow-sm dark:bg-gray-900">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link to="/" className="text-xl font-bold text-gray-900 dark:text-white">
          {t('common.appName')}
        </Link>

        <nav className="flex items-center gap-4">
          <Link to="/" className="text-gray-600 hover:text-gray-900 dark:text-gray-300">
            {t('nav.home')}
          </Link>
          <Link to="/about" className="text-gray-600 hover:text-gray-900 dark:text-gray-300">
            {t('nav.about')}
          </Link>
          <Link to="/contact" className="text-gray-600 hover:text-gray-900 dark:text-gray-300">
            {t('nav.contact')}
          </Link>

          <LanguageSwitcher />

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">{user?.name}</span>
              <button
                onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                className="rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
              >
                {t('nav.logout')}
              </button>
            </div>
          ) : (
            <button
              onClick={() => loginWithRedirect()}
              className="rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
            >
              {t('nav.login')}
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}

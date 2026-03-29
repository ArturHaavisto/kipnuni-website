import { useTranslation } from 'react-i18next';
import { 
  SiYoutube, 
  SiGithub, 
  SiInstagram, 
  SiFacebook, 
  SiTiktok, 
  SiTelegram 
} from 'react-icons/si';
import { FaLinkedin } from 'react-icons/fa';
import { Mail } from 'lucide-react';
import React from 'react';
import linksData from '@/content/links.yaml';

interface LinkItem {
  id: string;
  url: string;
  icon: string;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  youtube: <SiYoutube className="h-6 w-6 text-[#FF0000]" />,
  github: <SiGithub className="h-6 w-6 text-gray-900 dark:text-white" />,
  linkedin: <FaLinkedin className="h-6 w-6 text-[#0A66C2]" />,
  instagram: <SiInstagram className="h-6 w-6 text-[#E4405F]" />,
  facebook: <SiFacebook className="h-6 w-6 text-[#1877F2]" />,
  tiktok: <SiTiktok className="h-6 w-6 text-gray-900 dark:text-white" />,
  telegram: <SiTelegram className="h-6 w-6 text-[#2AABEE]" />,
  email: <Mail className="h-6 w-6 text-gray-700 dark:text-gray-300" />,
};

export default function LinkPage() {
  const { t } = useTranslation();
  const links = (linksData as { links: LinkItem[] }).links;

  return (
    <div className="mx-auto max-w-2xl text-center">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        {t('link.title')}
      </h1>
      <p className="mt-3 text-gray-600 dark:text-gray-300">
        {t('link.description')}
      </p>
      <div className="mt-6 grid gap-3 text-start sm:grid-cols-2">
        {links.map((link) => (
          <a
            key={link.id}
            href={link.url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <div className="flex h-8 w-8 items-center justify-center">
              {ICON_MAP[link.icon] ?? <Mail className="h-6 w-6" />}
            </div>
            <span className="font-medium text-gray-900 dark:text-white">
              {t(`link.items.${link.id}`)}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

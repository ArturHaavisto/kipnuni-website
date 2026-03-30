import { useTranslation } from 'react-i18next';

interface HUDProps {
  activeZoneId: string;
}

export function HUD({ activeZoneId }: HUDProps) {
  const { t } = useTranslation();

  return (
    <div className="pointer-events-none absolute inset-x-0 top-4 z-10 flex justify-center">
      <div className="rounded-full bg-black/60 px-6 py-2 text-lg font-bold text-white backdrop-blur-sm">
        {t(`nav.${activeZoneId}`)}
      </div>
    </div>
  );
}

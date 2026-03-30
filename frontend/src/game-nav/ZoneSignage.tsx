import { Text } from '@react-three/drei';
import { useTranslation } from 'react-i18next';
import { spatialRoutes } from '@/navigation/routes';
import { gridToWorld } from './constants';

interface ZoneSignageProps {
  activeZoneId: string;
}

export function ZoneSignage({ activeZoneId }: ZoneSignageProps) {
  const { t } = useTranslation();

  return (
    <group>
      {spatialRoutes.map((route) => {
        if (route.id === activeZoneId) return null;
        const [wx, , wz] = gridToWorld(route.x, route.y);
        return (
          <Text
            key={route.id}
            position={[wx, 1.2, wz]}
            rotation={[-Math.PI / 4, 0, 0]}
            fontSize={0.6}
            color="#e2e8f0"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.04}
            outlineColor="#1e293b"
          >
            {t(`nav.${route.id}`)}
          </Text>
        );
      })}
    </group>
  );
}

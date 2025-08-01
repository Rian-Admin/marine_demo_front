import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { translate } from '@/utils/i18n';

// 타입 정의
interface CameraData {
  id: string;
  position: [number, number];
  direction: number;
  angle: number;
  color: string;
  sector: string;
}

interface MapViewProps {
  mapCenter?: [number, number];
  language?: string;
}

// 클라이언트 전용 지도 컴포넌트
const ClientOnlyMapComponent: React.FC<MapViewProps> = ({
  mapCenter = [35.193097, 126.221395],
  language = 'ko',
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [MapComponents, setMapComponents] = useState<
    typeof import('react-leaflet') | null
  >(null);
  const [L, setL] = useState<typeof import('leaflet') | null>(null);

  // 동적으로 Leaflet 라이브러리 로드
  useEffect(() => {
    const loadLeaflet = async () => {
      try {
        // Leaflet과 React-Leaflet을 동적으로 import
        const leaflet = await import('leaflet');
        const reactLeaflet = await import('react-leaflet');

        // Leaflet CSS 동적 로드
        if (typeof document !== 'undefined') {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
          document.head.appendChild(link);
        }

        // Leaflet 아이콘 마커 깨짐 방지
        delete (
          leaflet.default.Icon.Default.prototype as { _getIconUrl?: unknown }
        )._getIconUrl;
        leaflet.default.Icon.Default.mergeOptions({
          iconRetinaUrl:
            'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
          iconUrl:
            'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
          shadowUrl:
            'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
        });

        // 전역 CSS 추가
        if (
          typeof document !== 'undefined' &&
          !document.getElementById('leaflet-animation-css')
        ) {
          const style = document.createElement('style');
          style.id = 'leaflet-animation-css';
          style.innerHTML = `
            @keyframes pulse {
              0% { opacity: 1; transform: scale(1); }
              50% { opacity: 0.7; transform: scale(1.1); }
              100% { opacity: 1; transform: scale(1); }
            }
            .neon-circle-outer {
              filter: drop-shadow(0 0 4px rgba(0, 224, 224, 0.6));
            }
            .neon-circle-middle, .neon-circle-inner {
              filter: drop-shadow(0 0 2px rgba(0, 224, 224, 0.5));
            }
            .neon-center-dot {
              filter: drop-shadow(0 0 4px rgba(0, 224, 224, 0.7));
            }
            .neon-sector-line {
              filter: drop-shadow(0 0 2px rgba(0, 224, 224, 0.5));
            }
            .sector-polygon-1 {
              filter: drop-shadow(0 0 3px rgba(0, 224, 224, 0.4));
            }
            .sector-polygon-2 {
              filter: drop-shadow(0 0 3px rgba(112, 208, 112, 0.4));
            }
            .sector-polygon-3 {
              filter: drop-shadow(0 0 3px rgba(224, 112, 224, 0.4));
            }
            .sector-label {
              text-shadow: 0 0 3px rgba(0, 224, 224, 0.6), 0 0 5px rgba(0, 224, 224, 0.4);
              font-weight: bold;
            }
          `;
          document.head.appendChild(style);
        }

        setL(leaflet.default);
        setMapComponents(reactLeaflet);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load Leaflet:', error);
        setIsLoading(false);
      }
    };

    loadLeaflet();
  }, []);

  // 카메라 시야각 생성 함수
  const createViewField = useCallback(
    (
      center: [number, number],
      direction: number,
      angle: number,
      distance: number
    ): Array<[number, number]> => {
      const lat = center[0];
      const lng = center[1];

      const rad = (deg: number) => (deg * Math.PI) / 180;
      const earthRadius = 6378137;

      const points: Array<[number, number]> = [];
      points.push(center);

      const halfAngle = angle / 2;
      const segments = 12;

      for (let i = 0; i <= segments; i++) {
        const bearing = direction - halfAngle + (angle * i) / segments;
        const bearingRad = rad(bearing);

        const dLat =
          ((distance * Math.cos(bearingRad)) / earthRadius) * (180 / Math.PI);
        const dLng =
          ((distance * Math.sin(bearingRad)) /
            (earthRadius * Math.cos(rad(lat)))) *
          (180 / Math.PI);

        const newLat = lat + dLat;
        const newLng = lng + dLng;
        points.push([newLat, newLng]);
      }

      points.push(center);
      return points;
    },
    []
  );

  // 레이더 오버레이 컴포넌트
  const RadarCircleOverlay = ({ center }: { center: [number, number] }) => {
    const map = MapComponents?.useMap();

    useEffect(() => {
      if (map && L && MapComponents) {
        const circleRadius = 300;
        const overlayGroup = L.layerGroup().addTo(map);

        const rad = (deg: number) => (deg * Math.PI) / 180;

        // 원형 레이더 경계선들
        L.circle(center, {
          radius: circleRadius,
          color: '#00e0e0',
          fillColor: 'rgba(0, 224, 224, 0.02)',
          weight: 1.8,
          opacity: 0.7,
          className: 'neon-circle-outer',
        }).addTo(overlayGroup);

        L.circle(center, {
          radius: circleRadius * 0.7,
          color: '#00e0e0',
          fillColor: 'transparent',
          weight: 1.5,
          opacity: 0.6,
          className: 'neon-circle-middle',
        }).addTo(overlayGroup);

        L.circle(center, {
          radius: circleRadius * 0.4,
          color: '#00e0e0',
          fillColor: 'transparent',
          weight: 1.2,
          opacity: 0.5,
          className: 'neon-circle-inner',
        }).addTo(overlayGroup);

        L.circle(center, {
          radius: 4,
          color: '#ffffff',
          fillColor: '#00e0e0',
          fillOpacity: 0.8,
          weight: 1.5,
          className: 'neon-center-dot',
        }).addTo(overlayGroup);

        // 섹터 구분선
        const createSectorLine = (angle: number) => {
          const angleRad = rad(angle);
          const endLat =
            center[0] + (circleRadius * Math.cos(angleRad)) / 111320;
          const endLng =
            center[1] +
            (circleRadius * Math.sin(angleRad)) /
              (111320 * Math.cos(rad(center[0])));

          L.polyline([center, [endLat, endLng]], {
            color: '#00e0e0',
            weight: 1.5,
            opacity: 0.7,
            className: 'neon-sector-line',
          }).addTo(overlayGroup);
        };

        createSectorLine(0);
        createSectorLine(120);
        createSectorLine(240);

        // 거리 레이블
        const addDistanceLabel = (distance: number, text: string) => {
          const labelLat =
            center[0] + (distance * Math.cos(Math.PI / 4)) / 111320;
          const labelLng =
            center[1] +
            (distance * Math.sin(Math.PI / 4)) /
              (111320 * Math.cos((Math.PI / 180) * center[0]));

          L.marker([labelLat, labelLng], {
            icon: L.divIcon({
              html: `<div style="color:#00e0e0; font-weight:bold; font-size:12px; text-shadow: 0 0 3px rgba(0, 224, 224, 0.7);">${text}</div>`,
              className: 'distance-label',
              iconSize: [60, 20],
              iconAnchor: [30, 10],
            }),
          }).addTo(overlayGroup);
        };

        addDistanceLabel(circleRadius * 0.4, '120m');
        addDistanceLabel(circleRadius * 0.7, '210m');
        addDistanceLabel(circleRadius, '300m');

        // 섹터 레이블
        const addSectorLabel = (angle: number, text: string, color: string) => {
          const angleRad = rad(angle);
          const labelDistance = circleRadius * 0.6;

          const labelLat =
            center[0] + (labelDistance * Math.cos(angleRad)) / 111320;
          const labelLng =
            center[1] +
            (labelDistance * Math.sin(angleRad)) /
              (111320 * Math.cos(rad(center[0])));

          L.marker([labelLat, labelLng], {
            icon: L.divIcon({
              html: `<div style="color:${color}; font-weight:bold; font-size:15px; text-align:center; text-shadow: 0 0 3px ${color}, 0 0 5px rgba(255,255,255,0.3);">${text}</div>`,
              className: 'sector-label',
              iconSize: [100, 30],
              iconAnchor: [50, 15],
            }),
          }).addTo(overlayGroup);
        };

        addSectorLabel(60, 'CAMERA 1', '#00e0e0');
        addSectorLabel(180, 'CAMERA 2', '#70d070');
        addSectorLabel(300, 'CAMERA 3', '#e070e0');

        return () => {
          map.removeLayer(overlayGroup);
        };
      }
    }, [map, center]);

    return null;
  };

  // 줌 및 홈 버튼 컨트롤
  const ZoomAndHomeControl = ({
    mapCenter: mc,
  }: {
    mapCenter: [number, number];
  }) => {
    const map = MapComponents?.useMap();

    useEffect(() => {
      if (map && L && MapComponents) {
        const zoomControl = L.control.zoom({
          position: 'topleft',
          zoomInTitle: '확대',
          zoomOutTitle: '축소',
        });

        const homeControl = L.Control.extend({
          options: { position: 'bottomleft' },
          onAdd: function () {
            const container = L.DomUtil.create(
              'div',
              'leaflet-bar leaflet-control'
            );
            const button = L.DomUtil.create(
              'a',
              'leaflet-control-home',
              container
            );

            button.innerHTML = '⌂';
            button.href = '#';
            button.title = '원위치로 돌아가기';
            button.style.fontWeight = 'bold';
            button.style.fontSize = '16px';
            button.style.lineHeight = '26px';
            button.style.textAlign = 'center';
            button.style.display = 'block';
            button.style.width = '30px';
            button.style.height = '30px';

            L.DomEvent.on(button, 'click', L.DomEvent.stopPropagation)
              .on(button, 'click', L.DomEvent.preventDefault)
              .on(button, 'click', function () {
                map.setView(mc, 17, { animate: true });
              });

            return container;
          },
        });

        zoomControl.addTo(map);
        const homeInstance = new homeControl();
        homeInstance.addTo(map);

        return () => {
          try {
            map.removeControl(zoomControl);
            map.removeControl(homeInstance);
          } catch (error) {
            console.warn('Error removing map controls:', error);
          }
        };
      }
    }, [map, mc]);

    return null;
  };

  // 카메라 데이터
  const cameras: CameraData[] = useMemo(
    () => [
      {
        id: '1',
        position: [35.192962, 126.221627],
        direction: 60,
        angle: 120,
        color: '#00e0e0',
        sector: 'CAMERA 1',
      },
      {
        id: '2',
        position: [35.192962, 126.221627],
        direction: 180,
        angle: 120,
        color: '#70d070',
        sector: 'CAMERA 2',
      },
      {
        id: '3',
        position: [35.192962, 126.221627],
        direction: 300,
        angle: 120,
        color: '#e070e0',
        sector: 'CAMERA 3',
      },
    ],
    []
  );

  // 카메라 중심점 계산
  const camerasCenter = useCallback((): [number, number] => {
    if (cameras.length === 0) return mapCenter;

    const sumLat = cameras.reduce((sum, camera) => sum + camera.position[0], 0);
    const sumLng = cameras.reduce((sum, camera) => sum + camera.position[1], 0);

    return [sumLat / cameras.length, sumLng / cameras.length];
  }, [cameras, mapCenter]);

  // 로딩 중이면 로딩 화면 표시
  if (isLoading || !MapComponents || !L) {
    return (
      <div className="flex h-full flex-col items-center justify-center overflow-hidden rounded-lg border border-slate-600 bg-slate-900">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-cyan-400"></div>
        <p className="mt-4 text-cyan-400">지도를 로딩 중...</p>
      </div>
    );
  }

  const { MapContainer, TileLayer, CircleMarker, Popup, Polygon } =
    MapComponents;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-slate-600 bg-slate-900">
      <div className="relative h-full w-full">
        <MapContainer
          center={mapCenter}
          zoom={17}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '5px',
            transition: 'all 0.3s ease-in-out',
          }}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
            subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
            attribution=""
            maxZoom={20}
          />

          <RadarCircleOverlay center={camerasCenter()} />
          <ZoomAndHomeControl mapCenter={mapCenter} />

          {cameras.map((camera) => (
            <React.Fragment key={camera.id}>
              <CircleMarker
                center={camera.position}
                radius={10}
                pathOptions={{
                  fillColor: camera.color,
                  fillOpacity: 0.8,
                  color: '#ffffff',
                  weight: 2,
                }}
              >
                <Popup>
                  {translate(
                    `카메라${camera.id}`,
                    `Camera ${camera.id}`,
                    language
                  )}
                </Popup>
              </CircleMarker>

              <Polygon
                positions={createViewField(
                  camera.position,
                  camera.direction,
                  camera.angle,
                  300
                )}
                pathOptions={{
                  color: camera.color,
                  fillColor: camera.color,
                  fillOpacity: 0.13,
                  weight: 1.8,
                  opacity: 0.7,
                  className: `sector-polygon-${camera.id}`,
                }}
              >
                <Popup>
                  <span
                    style={{
                      color: camera.color,
                      fontWeight: 'bold',
                      textShadow: `0 0 2px ${camera.color}`,
                    }}
                  >
                    {camera.sector} -{' '}
                    {translate('시야각', 'View Angle', language)}:{' '}
                    {camera.angle}°
                  </span>
                </Popup>
              </Polygon>
            </React.Fragment>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

// 메인 MapView 컴포넌트 (SSR 안전)
const MapView: React.FC<MapViewProps> = (props) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="flex h-full flex-col items-center justify-center overflow-hidden rounded-lg border border-slate-600 bg-slate-900">
        <div className="animate-pulse">
          <div className="h-16 w-16 rounded-full bg-slate-700"></div>
        </div>
        <p className="mt-4 text-slate-400">지도 준비 중...</p>
      </div>
    );
  }

  return <ClientOnlyMapComponent {...props} />;
};

export default MapView;

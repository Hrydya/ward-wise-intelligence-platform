import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { enrichWardGeoJSON, EnrichedWardGeoJSON, getAQICategory } from '../services/aqiMapService';

interface LeafletMapProps {
  onWardSelect?: (ward: EnrichedWardGeoJSON) => void;
  onBack?: () => void;
  geojsonData?: any;
  autoRefreshInterval?: number; // in ms, default 5 min
  showChrome?: boolean; // toggles search/legend overlays for embedded use
  center?: { lat: number; lng: number };
  zoom?: number;
}

interface HoverTooltip {
  visible: boolean;
  x: number;
  y: number;
  wardName: string;
  aqi: number;
  category: string;
  pm25?: number;
  source?: 'sensor' | 'estimated';
}

const DELHI_CENTER = { lat: 28.6139, lng: 77.209 };
const DEFAULT_ZOOM = 11;

const AQI_COLOR_MAP = {
  0: { min: 0, max: 50, color: '#00b050', label: 'Good' },
  1: { min: 51, max: 100, color: '#ffff00', label: 'Satisfactory' },
  2: { min: 101, max: 200, color: '#ff7f00', label: 'Moderate' },
  3: { min: 201, max: 300, color: '#ff0000', label: 'Poor' },
  4: { min: 301, max: Infinity, color: '#8b0000', label: 'Severe' },
};

function getColorFromAQI(aqi: number): string {
  if (aqi >= 0 && aqi <= 50) return '#00b050';
  if (aqi >= 51 && aqi <= 100) return '#ffff00';
  if (aqi >= 101 && aqi <= 200) return '#ff7f00';
  if (aqi >= 201 && aqi <= 300) return '#ff0000';
  return '#8b0000';
}

const LeafletAQIMap: React.FC<LeafletMapProps> = ({
  onWardSelect,
  onBack,
  geojsonData,
  autoRefreshInterval = 5 * 60 * 1000, // 5 minutes default
  showChrome = true,
  center = DELHI_CENTER,
  zoom = DEFAULT_ZOOM,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const geoJsonLayer = useRef<L.GeoJSON | null>(null);
  const [enrichedWards, setEnrichedWards] = useState<EnrichedWardGeoJSON[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoverTooltip, setHoverTooltip] = useState<HoverTooltip>({
    visible: false,
    x: 0,
    y: 0,
    wardName: '',
    aqi: 0,
    category: '',
    pm25: undefined,
    source: undefined,
  });
  const [highlightedWardId, setHighlightedWardId] = useState<string | null>(null);
  const [wardLayers, setWardLayers] = useState<Map<string, L.Layer>>(new Map());
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    const map = L.map(mapContainer.current).setView(
      [center.lat, center.lng],
      zoom
    );

    // Add tile layer (OpenStreetMap dark theme)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution:
        '© OpenStreetMap contributors © CartoDB',
      maxZoom: 19,
    }).addTo(map);

    mapInstance.current = map;

    return () => {
      map.remove();
    };
  }, []);

  // Recenter when center/zoom props change (for embeds reopening)
  useEffect(() => {
    if (mapInstance.current) {
      mapInstance.current.setView([center.lat, center.lng], zoom);
    }
  }, [center.lat, center.lng, zoom]);

  // Load and enrich GeoJSON data
  const loadGeoJSONData = async () => {
    setLoading(true);
    try {
      // If no geojsonData provided, attempt to load from file
      let data = geojsonData;
      if (!data) {
        const response = await fetch('/delhi_wards.geojson');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        data = await response.json();
      }

      const enriched = await enrichWardGeoJSON(data);
      setEnrichedWards(enriched);

      // Render GeoJSON on map
      if (mapInstance.current) {
        // Remove old layer if exists
        if (geoJsonLayer.current) {
          mapInstance.current.removeLayer(geoJsonLayer.current);
        }

        const geoJsonFeatures = {
          type: 'FeatureCollection' as const,
          features: enriched,
        };

        const layerMap = new Map<string, L.Layer>();

        geoJsonLayer.current = L.geoJSON(geoJsonFeatures, {
          style: (feature) => {
            const aqi = feature?.properties?.aqi || 0;
            const source = feature?.properties?.source;
            const wardId = feature?.properties?.ward_id;
            const isHighlighted = wardId === highlightedWardId;

            const fillColor = getColorFromAQI(aqi);

            return {
              fillColor,
              weight: isHighlighted ? 3 : 2,
              opacity: 1,
              color: '#fff',
              dashArray: source === 'estimated' ? '5, 5' : undefined,
              fillOpacity: isHighlighted ? 0.9 : 0.7,
            };
          },
          onEachFeature: (feature, layer) => {
            const wardId = feature.properties?.ward_id;
            if (wardId) {
              layerMap.set(wardId, layer);
            }

            layer.on('mouseover', (e) => {
              const { latlng } = e;
              const point = mapInstance.current?.latLngToContainerPoint(latlng);

              setHoverTooltip({
                visible: true,
                x: point?.x || 0,
                y: point?.y || 0,
                wardName: feature.properties?.ward_name || 'Unknown',
                pm25: feature.properties?.pm2_5,
                source: feature.properties?.source,
                aqi: feature.properties?.aqi || 0,
                category: feature.properties?.aqi_category || 'Unknown',
              });

              if ('setStyle' in layer && highlightedWardId !== wardId) {
                (layer as L.Path).setStyle({
                  weight: 3,
                  fillOpacity: 0.85,
                });
              }
            });

            layer.on('mousemove', (e) => {
              const { latlng } = e;
              const point = mapInstance.current?.latLngToContainerPoint(latlng);
              setHoverTooltip((prev) => ({
                ...prev,
                x: point?.x || prev.x,
                y: point?.y || prev.y,
              }));
            });

            layer.on('mouseout', () => {
              setHoverTooltip({ ...hoverTooltip, visible: false });

              if ('setStyle' in layer && highlightedWardId !== wardId) {
                const source = feature.properties?.source;
                const opacity = source === 'estimated' ? 0.5 : 0.7;
                (layer as L.Path).setStyle({
                  weight: 2,
                  fillOpacity: opacity,
                });
              }
            });

            layer.on('click', () => {
              const wardId = feature.properties?.ward_id;
              setHighlightedWardId(wardId);
              onWardSelect?.(feature as EnrichedWardGeoJSON);

              // Zoom to ward bounds
              if ('getBounds' in layer) {
                mapInstance.current?.fitBounds((layer as any).getBounds(), {
                  padding: [50, 50],
                });
              }
            });

            (layer as any).setStyle({
              cursor: 'pointer',
            });
          },
        }).addTo(mapInstance.current);

        setWardLayers(layerMap);
      }
    } catch (error) {
      console.error('Failed to load GeoJSON:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle ward search and selection
  const handleSearchSelect = (wardName: string) => {
    const ward = enrichedWards.find(
      (w) => w.properties.ward_name.toUpperCase() === wardName.toUpperCase()
    );

    if (ward) {
      setSearchQuery('');
      setHighlightedWardId(ward.properties.ward_id);
      onWardSelect?.(ward);

      // Find and zoom to the layer
      const layer = wardLayers.get(ward.properties.ward_id);
      if (layer && 'getBounds' in layer) {
        mapInstance.current?.fitBounds((layer as any).getBounds(), {
          padding: [50, 50],
        });
      }
    }
  };

  const filteredWards = enrichedWards.filter((ward) =>
    ward.properties.ward_name.toUpperCase().includes(searchQuery.toUpperCase())
  );

  // Update highlight styling when highlighted ward changes
  useEffect(() => {
    wardLayers.forEach((layer, wardId) => {
      if ('setStyle' in layer) {
        const isHighlighted = wardId === highlightedWardId;
        const ward = enrichedWards.find((w) => w.properties.ward_id === wardId);
        if (ward) {
          (layer as L.Path).setStyle({
            weight: isHighlighted ? 3 : 2,
            fillOpacity: isHighlighted ? 0.9 : ward.properties.source === 'estimated' ? 0.5 : 0.7,
          });
        }
      }
    });
  }, [highlightedWardId, wardLayers, enrichedWards]);

  // Recalculate highlight when highlighted ward changes

  // Load GeoJSON data on component mount
  useEffect(() => {
    if (mapInstance.current) {
      loadGeoJSONData();
    }
  }, []);

  // Setup auto-refresh
  useEffect(() => {
    if (autoRefreshInterval > 0) {
      refreshIntervalRef.current = setInterval(() => {
        loadGeoJSONData();
      }, autoRefreshInterval);
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefreshInterval]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }} ref={mapContainerRef}>
      <div
        ref={mapContainer}
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
        }}
      />

      {/* Back Button and Search Input */}
      {showChrome && (
        <>
          <button
            onClick={onBack}
            style={{
              position: 'absolute',
              top: '20px',
              left: '80px',
              zIndex: 1002,
              width: '50px',
              height: '56px',
              backgroundColor: 'white',
              color: 'black',
              border: '8px solid #000000',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '24px',
            }}
          >
            ←
          </button>
          <div
            style={{
              position: 'absolute',
              top: '20px',
              left: '140px',
              zIndex: 1001,
              backgroundColor: 'rgba(0,0,0,0.85)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px',
              minWidth: '280px',
            }}
          >
            <input
              type="text"
              placeholder="Search ward by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '4px',
                border: 'none',
                fontSize: '14px',
                fontFamily: 'inherit',
                backgroundColor: 'rgba(255,255,255,0.9)',
                color: '#000',
              }}
            />
            {searchQuery && filteredWards.length > 0 && (
              <div
                style={{
                  marginTop: '6px',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  borderRadius: '4px',
                }}
              >
                {filteredWards.slice(0, 8).map((ward) => (
                  <div
                    key={ward.properties.ward_id}
                    onClick={() => handleSearchSelect(ward.properties.ward_name)}
                    style={{
                      padding: '8px 12px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      color: '#000',
                      border: '2px solid #000000',
                      borderRadius: '8px',
                      backgroundColor:
                        highlightedWardId === ward.properties.ward_id
                          ? '#e0e0e0'
                          : 'white',
                      marginBottom: '4px',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.backgroundColor = '#f0f0f0';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.backgroundColor =
                        highlightedWardId === ward.properties.ward_id ? '#e0e0e0' : 'white';
                    }}
                  >
                    <div style={{ fontWeight: '600' }}>{ward.properties.ward_name}</div>
                    <div style={{ fontSize: '11px', color: '#666' }}>
                      AQI: {ward.properties.aqi} ({ward.properties.aqi_category})
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Hover Tooltip */}
      {hoverTooltip.visible && (
        <div
          style={{
            position: 'fixed',
            left: `${hoverTooltip.x + 15}px`,
            top: `${hoverTooltip.y - 10}px`,
            backgroundColor: 'rgba(0,0,0,0.95)',
            color: '#fff',
            padding: '10px 14px',
            borderRadius: '6px',
            fontSize: '12px',
            zIndex: 2000,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}
        >
          <div style={{ fontWeight: '600', marginBottom: '4px' }}>
            {hoverTooltip.wardName}
          </div>
          <div>AQI: <span style={{ fontWeight: '600', color: '#00d4ff' }}>{hoverTooltip.aqi}</span></div>
          {hoverTooltip.pm25 && (
            <div style={{ fontSize: '11px', color: '#aaa' }}>
              PM2.5: {hoverTooltip.pm25.toFixed(1)} µg/m³
            </div>
          )}
          <div style={{ fontSize: '11px', color: '#aaa', marginTop: '2px' }}>
            {hoverTooltip.category} • {hoverTooltip.source === 'sensor' ? '📡 Live' : '🔮 Est.'}
          </div>
        </div>
      )}

      {showChrome && loading && (
        <div
          style={{
            position: 'absolute',
            top: '80px',
            left: '60px',
            background: 'rgba(0,0,0,0.7)',
            color: '#fff',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            zIndex: 1000,
          }}
        >
          Updating AQI data...
        </div>
      )}

      {/* Legend */}
      {showChrome && (
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '60px',
            background: 'rgba(0,0,0,0.8)',
            color: '#fff',
            padding: '12px 16px',
            borderRadius: '6px',
            fontSize: '12px',
            zIndex: 1000,
            maxWidth: '250px',
          }}
        >
          <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>AQI Legend</div>
          <div style={{ lineHeight: '1.6' }}>
            <div>
              <span
                style={{
                  display: 'inline-block',
                  width: '12px',
                  height: '12px',
                  backgroundColor: '#00b050',
                  marginRight: '6px',
                  borderRadius: '2px',
                }}
              />{' '}
              0-50 (Good)
            </div>
            <div>
              <span
                style={{
                  display: 'inline-block',
                  width: '12px',
                  height: '12px',
                  backgroundColor: '#ffff00',
                  marginRight: '6px',
                  borderRadius: '2px',
                }}
              />{' '}
              51-100 (Satisfactory)
            </div>
            <div>
              <span
                style={{
                  display: 'inline-block',
                  width: '12px',
                  height: '12px',
                  backgroundColor: '#ff7f00',
                  marginRight: '6px',
                  borderRadius: '2px',
                }}
              />{' '}
              101-200 (Moderate)
            </div>
            <div>
              <span
                style={{
                  display: 'inline-block',
                  width: '12px',
                  height: '12px',
                  backgroundColor: '#ff0000',
                  marginRight: '6px',
                  borderRadius: '2px',
                }}
              />{' '}
              201-300 (Poor)
            </div>
            <div>
              <span
                style={{
                  display: 'inline-block',
                  width: '12px',
                  height: '12px',
                  backgroundColor: '#8b0000',
                  marginRight: '6px',
                  borderRadius: '2px',
                }}
              />{' '}
              300+ (Severe)
            </div>
          </div>
          <div
            style={{
              marginTop: '8px',
              fontSize: '11px',
              color: '#aaa',
              borderTop: '1px solid #555',
              paddingTop: '8px',
            }}
          >
            <div>—— Dashed = Estimated AQI</div>
            <div>Solid = Sensor data</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeafletAQIMap;

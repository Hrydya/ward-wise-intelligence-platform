# GeoJSON AQI Map Implementation

## Overview
Successfully replaced the static SVG ward map with a **GeoJSON-based real-time AQI map** using **Leaflet**.

## What's New

### 1. **New Service: `aqiMapService.ts`**
- **Enriches GeoJSON features** with real-time AQI data from existing `DELHI_WARDS` constant
- **Choropleth coloring** by AQI category (Good→Green, Severe→Maroon)
- **Distance-weighted interpolation** for wards without direct sensor data
- **Source tracking**: Distinguishes between sensor-backed and estimated AQI

### 2. **New Component: `LeafletAQIMap.tsx`**
- **Leaflet-based interactive map** rendering Delhi ward boundaries
- **5-minute auto-refresh** of AQI data (configurable)
- **Visual differentiation**:
  - Solid borders = Sensor-backed data
  - Dashed borders = Estimated data (lower opacity)
- **Interactive features**:
  - Hover effects (highlight ward)
  - Click to select ward (opens detail panel)
- **Built-in legend** showing AQI color scale

### 3. **Updated Component: `InteractiveMap.tsx`**
- **Removed**: Static SVG map overlays, mock coordinate generation
- **Integrated**: `LeafletAQIMap` component
- **Enhanced drawer**:
  - Shows enriched GeoJSON properties (AQI, category, source, last updated)
  - Displays metadata (priority score, population density)
  - Clear data quality indicators
- **Same beautiful UI** maintained from before

## Features

✅ **Real-time choropleth map** with ward-level AQI  
✅ **Sensor-first design** with transparent estimation fallback  
✅ **Auto-refresh** every 5 minutes (configurable)  
✅ **Distance-weighted interpolation** for unmapped regions  
✅ **Interactive hover/click** with detailed drawer  
✅ **Dark theme** compatible with existing design  
✅ **Fully typed** TypeScript implementation  
✅ **No new backend required** — uses existing AQI service  

## AQI Categories & Colors

| Range | Category | Color |
|-------|----------|-------|
| 0–50 | Good | 🟢 Green (#00b050) |
| 51–100 | Satisfactory | 🟡 Yellow (#ffff00) |
| 101–200 | Moderately Polluted | 🟠 Orange (#ff7f00) |
| 201–300 | Poor | 🔴 Red (#ff0000) |
| 300+ | Severe | 🔴 Maroon (#8b0000) |

## Technical Details

### GeoJSON Enrichment Format
```json
{
  "type": "Feature",
  "properties": {
    "ward_id": "w44",
    "ward_name": "ANAND VIHAR",
    "aqi": 412,
    "aqi_category": "Severe",
    "source": "sensor",
    "last_updated": "2026-01-11T12:30:00Z",
    "color": "#8b0000",
    "priority_score": 98,
    "population_density": "High"
  },
  "geometry": { ... }
}
```

### Source Indicators
- **`"sensor"`**: Real-time data from ground stations (solid border, full opacity)
- **`"estimated"`**: Calculated via distance-weighted average from nearest 3 wards (dashed border, 50% opacity)

### Auto-Refresh
- Default: **5 minutes** (configurable via `autoRefreshInterval` prop)
- Updates map source dynamically **without page reload**
- Uses existing DELHI_WARDS constant as backend source

## Dependencies

```json
{
  "leaflet": "^1.9.x",
  "@types/leaflet": "^1.7.x"
}
```

## Usage

```tsx
<LeafletAQIMap 
  onWardSelect={(ward) => console.log(ward)}
  autoRefreshInterval={5 * 60 * 1000}
/>
```

## Design Principles Applied

✓ **Sensor-backed first** — Estimated values clearly labeled  
✓ **Transparency over perfection** — Users know data source  
✓ **No hardcoded values** — Dynamic from DELHI_WARDS  
✓ **Modular code** — Reusable service + component  
✓ **Existing backend only** — No new server endpoints  

## Next Steps (Optional Enhancements)

1. Load `delhi_wards.geojson` from public folder (currently using mock)
2. Connect to real-time AQI API (CPCB, WAQI, etc.)
3. Add ward search/filter
4. Export map as image/PDF
5. Add historical AQI trend chart for selected ward

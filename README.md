# TERRA — 3D Planetary Explorer & Digital Twin

[![Next.js](https://img.shields.io/badge/Next.js-15.1-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb?style=flat&logo=react)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-r170-black?style=flat&logo=three.js)](https://threejs.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3.4-38bdf8?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> An Awwwards-caliber, real-time 3D Earth Atlas and planetary telemetry workstation built with Next.js 15, React Three Fiber / Three.js, three-globe, GLSL shaders, live open-source telemetry feeds, and a glassmorphic spatial HUD.

---

## 🌟 Key Features

### 🌍 3D Graphics Engine & Shaders
- **Dual-Layer Rayleigh & Mie Atmospheric Scattering**: Custom GLSL vertex and fragment shaders calculating normal matrix displacement and Fresnel limb falloff.
- **Dynamic UTC Day/Night Terminator**: Realistic sun direction calculated from real-time UTC solar ephemeris, smoothly blending NASA Blue Marble day albedo, city luminescence, and ocean specular mirror masks.
- **Cinematic Post-Processing**: ACESFilmic ToneMapping (1.15 exposure), UnrealBloomPass (intensity 1.35), and Space Telescope optical vignette shader.
- **Camera Choreography**: Spherical-to-Cartesian coordinates transformation with Quaternion slerp transitions and quintic ease-out curves ($1 - (1 - t)^5$).

### 📡 Real-Time Telemetry & Data Streams
- **USGS Seismic Activity Feed**: Live polling of M2.5+ earthquakes every 60s, rendering pulsating concentric shockwave rings color-coded by magnitude (Cyan < 4.0, Amber < 6.0, Crimson ≥ 6.0).
- **Live ISS Orbital Tracking**: High-precision 5-second polling of WhereTheISS.at with a 150-node orbital spline ribbon, 3D beacon octahedron, solar array wings, and velocity/altitude telemetry.
- **Natural Earth Vector Boundaries**: Interactive country polygon hover elevation (+0.006) and emissive border highlighting (`#38bdf8`).
- **Country Dossier Sheet**: Sliding glassmorphic drawer hydrating live demographics via REST Countries v3.1 and real-time meteorology via Open-Meteo.

### 🎛️ Spatial HUD & Procedural Audio
- **Top Navigation Bar**: Live UTC atomic clock, real-time raycast Lat/Lng tracker, camera orbital altitude (km), and FPS monitor.
- **Dynamic Telemetry Reticle**: Screen-space cursor crosshair with territorial inspection badges.
- **Cmd+K Omnibox Palette**: Fuse.js in-memory fuzzy index across 195+ sovereign nations, global megacities, and planetary landmarks with automated fly-to choreography.
- **Web Audio Synthesizer**: Zero-dependency procedural synthesizer generating tactical frequency blips, camera fly-to whooshes, selection chirps, and hazard pings.
- **Floating Layer Controls**: Toggle switches for atmosphere limb, seismic feeds, satellite tracks, vector borders, day/night shading, and planetary auto-orbit.

---

## 🏗️ System Architecture

```text
terra/
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # Root fonts, viewport metadata
│   │   ├── page.tsx                   # Main orchestration canvas mount
│   │   ├── globals.css                # Tailwind + glassmorphic & CRT scanline
│   │   └── api/
│   │       ├── geojson/route.ts       # Edge-cached world boundary provider
│   │       └── telemetry/route.ts     # Aggregated telemetry status route
│   ├── components/
│   │   ├── canvas/
│   │   │   ├── Scene.tsx              # Three.js Canvas mount with ACESFilmic ToneMapping
│   │   │   ├── GlobeCore.tsx          # three-globe instance wrapper with custom materials
│   │   │   ├── Atmosphere.tsx         # Rayleigh/Mie custom atmospheric glow mesh
│   │   │   ├── Satellites.tsx         # Real-time ISS orbital mesh & trajectory spline
│   │   │   ├── SeismicLayer.tsx       # Dynamic USGS pulsing concentric rings
│   │   │   └── PostProcessing.tsx     # UnrealBloom & space telescope optical vignette
│   │   ├── hud/
│   │   │   ├── NavigationBar.tsx      # Top bar (UTC clock, Lat/Lng readout, Alt)
│   │   │   ├── TelemetryReticle.tsx   # Dynamic screen-space cursor tracking reticle
│   │   │   ├── LayerControl.tsx       # Floating glass switch for visual layers
│   │   │   ├── CountrySheet.tsx       # Slide-over country dossier inspector
│   │   │   └── Omnibox.tsx            # Cmd+K fuzzy search palette via Fuse.js
│   ├── hooks/
│   │   ├── useGlobeControls.ts        # Smooth camera fly-to, slerp & lerp controllers
│   │   ├── useSeismicData.ts          # USGS GeoJSON ingestion hook (60s poll)
│   │   ├── useISSTracker.ts           # ISS live coordinate stream (5s poll)
│   │   └── useAudioSynth.ts           # Web Audio API procedural UI synthesizer
│   ├── shaders/
│   │   ├── atmosphere.vert.glsl       # Normal matrix displacement for limb scattering
│   │   ├── atmosphere.frag.glsl       # Fresnel intensity calculation
│   │   └── terminator.frag.glsl       # Day/night texture blending based on Sun light vector
│   ├── stores/
│   │   ├── useGlobeStore.ts           # Active coordinates, camera target, selection state
│   │   └── useLayerStore.ts           # Visible layers (Seismic, Satellites, Atmosphere, etc.)
│   └── types/
│       ├── geojson.d.ts               # TopoJSON and GeoJSON schemas
│       └── telemetry.ts               # Core telemetry models & API contracts
└── public/
    ├── textures/                      # Earth texture assets & generators
    └── data/
        └── world-110m.json            # Offline Natural Earth vector fallback
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (tested with Node 20 / 24)
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/Mohammed-Ashraf-Shaik/earth-visualization.git
cd earth-visualization

# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm run start
```

---

## ⌨️ Controls & Shortcuts

| Action | Control |
|---|---|
| Rotate Globe | Left-click + Drag |
| Zoom In/Out | Mouse Wheel / Pinch Gesture |
| Omnibox Search | `Cmd + K` or `Ctrl + K` |
| Inspect Country | Click on country territory |
| Audio Toggle | Sound button on Top Navigation Bar |

---

## 🚀 Deploying to Vercel & Render

### ⚡ Deploy to Vercel
1. Import repository on [Vercel](https://vercel.com/new).
2. Framework Preset: **Next.js** (automatically detected via `vercel.json`).
3. Build Command: `npm run build`
4. Output Directory: `.next`
5. Click **Deploy**.

### 🛠️ Deploy to Render
1. Connect your GitHub repository on [Render](https://dashboard.render.com).
2. Click **New +** -> **Blueprint**, and select this repository. Render will automatically read [`render.yaml`](./render.yaml).
3. Alternatively, create a **Web Service**:
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free / Starter
   - **Health Check Path**: `/`
4. Click **Create Web Service**.

### 🐳 Deploy via Docker
```bash
docker build -t terra-earth .
docker run -p 10000:10000 terra-earth
```

---

## 📜 License

MIT © Mohammed Ashraf Shaik

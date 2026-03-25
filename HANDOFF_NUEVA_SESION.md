# PlayaScout ClimaBot — Handoff para Nueva Sesión

> **Fecha**: 25 marzo 2026
> **Proyecto**: PlayaScout / ClimaBot v2
> **Empresa**: Roma Tecnología, Mérida, México
> **Ecosistema**: CancunBot (WhatsApp AI Agent)

---

## Ubicación del Proyecto

```
C:\Users\mguim\Desktop\THEVIBE\PLAYASCOUT climabot\
├── climabot-api/      ← Backend Node.js + Express + SQLite
├── climabot-pwa/      ← Frontend React 18 + Vite + Tailwind
├── climabot-n8n/      ← Workflows de automatización
└── CLIMABOT_CONTEXTO_COMPLETO.md  ← Documento de contexto original (v1 zonas)
```

**IMPORTANTE**: El proyecto se movió de Google Drive (`G:\My Drive\thevibe\climabot`) a disco local para evitar problemas con npm/node_modules. Google Drive corrompe archivos en node_modules por la sincronización.

---

## Estado Actual — QUÉ ESTÁ HECHO

### ✅ Fase 1: Backend API (100% completo)

**Stack**: Node.js + Express + SQLite (WAL mode) + node-cache dual

**Lo que se construyó en la sesión anterior:**

#### Evolución v1 → v2:
- **v1** tenía 10 zonas geográficas con recomendaciones por categoría
- **v2** añadió **32 playas individuales** con scoring numérico (0-100)
- Se agregó **Marine API** (Open-Meteo gratis) para datos de oleaje
- Se creó **beachScorer.js** — motor de scoring por playa

#### Archivos del API (18 archivos):
```
climabot-api/
├── package.json          # Express, better-sqlite3, node-cache, cors, dotenv
├── .env.example
├── ecosystem.config.js   # Config PM2 para producción
├── tests/
│   ├── api.test.js           # Tests de zonas + periodo + formatters
│   └── beachScorer.test.js   # 32 tests del scoring engine
└── src/
    ├── index.js              # Express server con TODOS los endpoints
    ├── cache/
    │   └── climaCache.js     # Cache dual: fresh (15min TTL) + stale (sin TTL, nunca 503)
    ├── config/
    │   ├── zonas.js          # 10 zonas geográficas con GPS + metadata turística
    │   └── playas.js         # ⭐ NUEVO: 32 playas con orientación, shelter, reef, amenidades
    ├── db/
    │   ├── init.js           # SQLite WAL mode, 5 tablas
    │   └── queries.js        # Prepared queries con rotación round-robin
    ├── services/
    │   ├── openMeteo.js      # Weather API (gratis, sin key)
    │   ├── openMeteoMarine.js # ⭐ NUEVO: Marine API (olas, periodo, dirección)
    │   ├── beachScorer.js    # ⭐ NUEVO: Motor scoring 0-100 → Perfect/Okay/Avoid
    │   ├── sargazo.js        # Mock data + endpoint admin
    │   ├── alertas.js        # Detector de nortes (>40 km/h, dir 337.5°-22.5°)
    │   ├── recomendador.js   # Motor Capa 1 (reglas) + lookup Capa 2 (Haiku)
    │   ├── generadorVariantes.js # Llama Claude Haiku para Capa 2
    │   └── fuentesSociales.js    # Clasifica alertas sociales por tipo/zona
    └── utils/
        ├── periodo.js        # mañana/tarde/noche en timezone Cancún
        └── formatters.js     # Direcciones, UV, mar, WMO codes → español + emoji
```

#### Motor de Scoring por Playa (beachScorer.js):
- **Score 0-100** basado en 4 dimensiones:
  - Viento (0-30 pts): Considera orientación de playa, dirección del viento, shelter level
  - Oleaje (0-25 pts): Altura de olas, periodo, protección por arrecife
  - Clima (0-25 pts): Lluvia, UV extremo, temperatura
  - Sargazo (0-20 pts): Escala 1-5, susceptibilidad por playa
- **Labels**: ≥75 = "Perfect" 🟢 | 50-74 = "Okay" 🟡 | <50 = "Avoid" 🔴
- **Ángulo de viento vs orientación**: offshore (agua plana) = máximo score, onshore fuerte = mínimo

#### 32 Playas configuradas (playas.js):
Cada playa tiene: `id`, `nombre {es, en}`, `zona_id`, `lat/lon`, `orientacion_grados`, `shelter` (exposed/moderate/sheltered), `has_reef`, `tipo`, `sargazo_susceptible`, `amenidades[]`

**Distribución por zona:**
- Cancún (10): Delfines, Forum, Tortugas, Chac Mool, Marlín, Langosta, Caracol, Norte, Playa Mujeres, Puerto Juárez
- Isla Mujeres (2): Playa Norte IM, Garrafón
- Puerto Morelos (2): Puerto Morelos Centro, Ojo de Agua
- Playa del Carmen (3): Mamitas, Fundadores, Playacar
- Cozumel (3): Palancar, Money Bar, Mr. Sanchos
- Tulum (4): Paraíso, Ruinas, Pescadores, Santa Fe
- Bacalar (2): Costera Bacalar, Cocalitos
- Mérida (2): Progreso, Chicxulub Puerto
- Valladolid (2): Ría Lagartos (pool), Cenote Suytun
- Holbox (2): Playa Holbox, Punta Mosquito

#### Endpoints del API:

**Públicos:**
- `GET /api/clima/:zona` — Clima + recomendación por zona (10 zonas)
- `GET /api/zonas` — Lista de zonas
- `GET /api/playa/:playaId` — ⭐ NUEVO: Clima + score + marine data por playa individual
- `GET /api/playas` — ⭐ NUEVO: Todas las playas con scores (para beach list/map)
- `GET /api/playas/:zonaId` — ⭐ NUEVO: Playas filtradas por zona

**Admin (header `x-admin-token`):**
- `POST /api/admin/sargazo/:zona` — Actualizar sargazo por zona
- `POST /api/admin/sargazo/playa/:playaId` — Actualizar sargazo por playa
- `GET /api/admin/stats` — Métricas

**Internos para n8n (header `x-internal-token`):**
- `POST /api/internal/cache-update`
- `POST /api/internal/generar-variantes`
- `POST /api/internal/variantes/:zona`
- `GET /api/internal/ultima-categoria/:zona`
- `POST /api/internal/alertas-sociales`
- `GET /api/internal/health`

#### Tests: 32 tests pasan ✅
- `api.test.js`: periodo, norte, recomendador, formatters
- `beachScorer.test.js`: scoring engine (viento, oleaje, clima, sargazo, labels)

### ✅ Fase 1.5: PWA Base (estructura creada, funcional para zonas)

**Stack**: React 18 + Vite + Zustand + Tailwind CSS

```
climabot-pwa/
├── package.json         # react 18, react-router-dom, zustand, vite, tailwind
├── index.html
├── vite.config.js       # Puerto 3000
├── tailwind.config.js
├── postcss.config.js
├── public/
│   ├── manifest.json    # PWA manifest
│   └── sw.js            # Service Worker: network-first API, cache-first static
└── src/
    ├── main.jsx
    ├── index.css
    ├── App.jsx              # Layout + tema dinámico por periodo
    ├── store/useClimaStore.js  # Zustand state
    ├── hooks/
    │   ├── useClima.js      # Auto-fetch + refresh 15min
    │   └── usePeriodo.js    # mañana/tarde/noche
    ├── themes/periodos.js   # 3 temas: mañana (ámbar), tarde (azul), noche (indigo)
    ├── utils/api.js         # Cliente HTTP con AbortSignal
    └── components/
        ├── HeroCard.jsx
        ├── WeatherStrip.jsx     # Pronóstico 12h scroll
        ├── SargazoIndicator.jsx
        ├── WindCard.jsx
        ├── UVGauge.jsx
        ├── AlertBanner.jsx
        ├── ForecastWeek.jsx
        ├── ZonaPicker.jsx
        └── CTAWhatsApp.jsx
```

**La PWA actualmente muestra datos por ZONA. Falta agregar las vistas por PLAYA.**

---

## ❌ QUÉ FALTA — Trabajo Pendiente

### Fase 2: PWA Beach Views (PRIORIDAD)
Evolucionar la PWA de "zona-based" a "beach-based":

1. **BeachList view** — Grid/lista de 32 playas con score badges (Perfect/Okay/Avoid)
2. **BeachDetail view** — Detalle de playa individual con score, viento, oleaje, sargazo
3. **Map view** — Mapa interactivo con pins coloreados por score (Leaflet/OSM, gratis)
4. **Beach Picker** — Filtrar por zona, por score, por tipo
5. **Bilingual** — El backend ya tiene `nombre.es` y `nombre.en`, falta toggle ES/EN en PWA
6. **Responsive** — Mobile-first, funcional como PWA instalable

### Fase 3: Workflows n8n (5 pendientes)

| # | Workflow | Frecuencia | Estado |
|---|---|---|---|
| 01 | Cache Warming | Cada 30 min | ✅ Creado |
| 02 | Alertas de Norte | Cada 15 min | ❌ FALTA |
| 03 | Buenos Días | Diario 7 AM | ❌ FALTA |
| 04 | Re-engagement | Diario 10 AM | ❌ FALTA |
| 05 | Generación Haiku | Cada 5 horas | ❌ FALTA |
| 06 | Monitoreo Social | Cada 30 min | ❌ FALTA |

### Fase 4: Deploy
- API → VPS con PM2
- PWA → Vercel (free tier)
- DNS: `clima.cancunbot.com` → Vercel, `api.cancunbot.com` → VPS
- TWA (Google Play) con Bubblewrap

---

## Variables de Entorno

### API (.env):
```
PORT=3500
CORS_ORIGIN=https://clima.cancunbot.com
CACHE_TTL=900
ADMIN_TOKEN=<tu-token-admin>
INTERNAL_TOKEN=<tu-token-n8n>
ANTHROPIC_API_KEY=<tu-api-key>
HAIKU_MODEL=claude-haiku-4-5-20251001
DB_PATH=./data/climabot.db
```

### PWA (.env):
```
VITE_API_URL=http://localhost:3500
```

---

## Primer Paso en la Nueva Sesión

```bash
# 1. Instalar dependencias del API
cd "C:\Users\mguim\Desktop\THEVIBE\PLAYASCOUT climabot\climabot-api"
npm install

# 2. Instalar dependencias del PWA
cd "C:\Users\mguim\Desktop\THEVIBE\PLAYASCOUT climabot\climabot-pwa"
npm install

# 3. Correr tests del API
cd ../climabot-api
npm test

# 4. Levantar ambos servers
# Terminal 1: npm run dev (API en :3500)
# Terminal 2: cd ../climabot-pwa && npm run dev (PWA en :3000)
```

---

## Arquitectura de 3 Capas de Recomendaciones

- **Capa 1 — Reglas determinísticas ($0, <1ms)**: 8 categorías evaluadas por reglas. Siempre funciona como fallback.
- **Capa 2 — Variantes Haiku pre-generadas (~$0.60/mes)**: n8n genera 5 variantes de texto por categoría/zona/periodo cada 5h. Round-robin en SQLite.
- **Capa 3 — Sonnet real-time para WhatsApp (~$120/mes)**: Vive en CancunBot, NO en este repo.

---

## Costos Estimados Mensuales

| Concepto | Costo |
|---|---|
| Open-Meteo Weather + Marine API | $0 |
| Haiku Capa 2 | ~$0.60 |
| Sonnet Capa 3 (WhatsApp) | ~$120 |
| VPS (API + n8n) | ~$10-20 |
| Vercel PWA | $0 |
| **Total** | **~$130-140/mes** |

---

## Decisiones Técnicas Clave

- **Open-Meteo** (no OpenWeatherMap): 100% gratis, sin key, sin límites
- **SQLite** (no Postgres): Suficiente para <1000 req/día, sin servicio extra en VPS
- **Cache dual** (fresh + stale): Si Open-Meteo se cae, nunca 503
- **Zustand** (no Redux): 1.2KB, zero boilerplate
- **Leaflet/OSM** para mapa (no Mapbox): Gratis, sin API key
- **Scoring numérico** (no solo categorías): Permite ranking y comparación entre playas

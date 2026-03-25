# PlayaScout ClimaBot — Bitacora de Trabajo

> **Proyecto**: PlayaScout / ClimaBot v2
> **Empresa**: Roma Tecnologia, Merida, Mexico
> **Ecosistema**: CancunBot (WhatsApp AI Agent)
> **Repositorio local**: `C:\Users\mguim\OneDrive\Desktop\THEVIBE\PLAYASCOUT climabot\`

---

## Estado Actual

| Campo | Valor |
|-------|-------|
| **Fase completada** | 1 (Backend API) + 2 (PWA Beach Views) |
| **Fase en progreso** | Pruebas end-to-end, deploy |
| **Tests API** | 32 pasan |
| **Stack API** | Node.js + Express + SQLite + node-cache |
| **Stack PWA** | React 18 + Vite + Zustand + Tailwind |
| **Playas configuradas** | 32 (5 zonas) |
| **Ultima sesion** | 2026-03-25 |

---

## 2026-03-25 — Sesion 2: Setup + Inicio Fase 2

### Objetivo del dia
- Instalar dependencias en ambos proyectos
- Validar tests del API
- Iniciar Fase 2: PWA Beach Views (routing, BeachList, BeachDetail, Map, i18n)

### Plan de Fase 2
14 archivos nuevos + 3 modificados:
- **Routing**: React Router con 4 rutas (/, /playas, /playa/:id, /mapa)
- **BeachListView**: Grid de 32 playas con score badges y filtros
- **BeachDetailView**: Detalle con gauge de score, breakdown, amenidades
- **MapView**: Mapa Leaflet/OSM con pins coloreados por score
- **BottomNav**: Navegacion mobile-first
- **i18n**: Toggle ES/EN (backend ya tiene nombre.es/en)
- **Dependencia nueva**: leaflet + react-leaflet

### Lo que se hizo
- [x] Leido HANDOFF completo del proyecto
- [x] Explorado API (18 archivos, 32 playas, scoring engine)
- [x] Explorado PWA (9 componentes, sin routing, solo vista por zona)
- [x] Plan completo escrito y aprobado
- [x] Creada esta bitacora
- [x] npm install en climabot-api (actualizado better-sqlite3 ^9.4.3 → ^12.8.0 por Node 24)
- [x] npm install en climabot-pwa
- [x] Tests API corridos — 32/32 pasan
- [x] .env creados (api: port 3500, pwa: localhost:3500)
- [x] Paso 1: Routing (React Router 4 rutas) + API client (getPlayas, getPlaya) + Store (playas, idioma)
- [x] Paso 2: BeachListView + BeachCard + BeachFilter (zona/label filters)
- [x] Paso 3: BeachDetailView + ScoreGauge + ScoreBreakdown + AmenityList + NearbyBeaches
- [x] Paso 4: MapView con Leaflet/OSM (react-leaflet@4 por React 18)
- [x] Paso 5: BottomNav + LangToggle + App.jsx refactored a layout shell
- [x] Paso 6: i18n.js con t() y getNombre() — ~50 strings ES/EN
- [x] Build verificado — 0 errores, 118 modulos, 356KB JS gzip 110KB

### Decisiones tomadas
- **Bitacora en un solo archivo** (BITACORA.md): Facil de buscar, compartir, dar contexto a alguien nuevo
- **React Router** para navegacion (ya estaba en package.json como dep)
- **Leaflet/OSM** para mapa interactivo (gratis, sin API key)
- **i18n ligero** (objeto JS, sin libreria): Solo labels de UI, el backend ya da datos bilingues
- **Scoring labels**: >=70 Perfect, 40-69 Okay, <40 Avoid (del beachScorer.js)
- **Scoring pesos reales** (del codigo, no del handoff): viento(30) + olas(20) + lluvia(20) + UV(15) + sargazo(15) = 100

### Errores / Problemas encontrados
- El HANDOFF dice scoring: viento(30) + oleaje(25) + clima(25) + sargazo(20) = 100
- El CODIGO real dice: viento(30) + olas(20) + lluvia(20) + UV(15) + sargazo(15) = 100
- **El codigo es la fuente de verdad**, actualizar handoff despues
- El HANDOFF dice labels >=75 Perfect, el codigo dice >=70 Perfect — **usar codigo**
- **npm en bash**: `npm` no estaba en PATH, solucion: `export PATH="/c/Program Files/nodejs:$PATH"`
- **better-sqlite3 v9 falla en Node 24**: No hay prebuilds, necesita Python/node-gyp. Solucion: actualizar a v12.8.0
- **react-leaflet v5 requiere React 19**: Solucion: instalar react-leaflet@4 que soporta React 18
- **api.js default port era 4000**: Corregido a 3500 para match con .env del API

### Arquitectura descubierta (del codigo, no del handoff)
- **5 zonas** (no 10 como dice el handoff): cancun, riviera-maya, cozumel, costa-maya, yucatan
- **32 playas** distribuidas en esas 5 zonas
- La PWA actual no tiene React Router configurado (es single-page)
- El API client solo tiene 2 funciones (fetchClima, fetchZonas), falta agregar playas

### Archivos creados en esta sesion (14 nuevos + 3 modificados)
**Nuevos:**
- `src/views/ZoneView.jsx` — Vista de zona extraida de App.jsx
- `src/views/BeachListView.jsx` — Grid de 32 playas con filtros zona/label
- `src/views/BeachDetailView.jsx` — Detalle completo de playa con score gauge
- `src/views/MapView.jsx` — Mapa Leaflet con pins coloreados por score
- `src/components/BeachCard.jsx` — Tarjeta de playa con score badge
- `src/components/BeachFilter.jsx` — Filtros por zona y por label
- `src/components/ScoreGauge.jsx` — Gauge SVG circular animado 0-100
- `src/components/ScoreBreakdown.jsx` — 5 barras horizontales con desglose
- `src/components/AmenityList.jsx` — Grid de amenidades con emojis
- `src/components/NearbyBeaches.jsx` — Scroll horizontal de playas cercanas
- `src/components/BottomNav.jsx` — Nav inferior mobile (Playas/Mapa/Zonas)
- `src/components/LangToggle.jsx` — Boton ES/EN en header
- `src/hooks/usePlayas.js` — Hook para fetch playas + auto-refresh
- `src/utils/i18n.js` — ~50 strings bilingues + funciones t() y getNombre()

**Modificados:**
- `src/App.jsx` — Ahora es layout shell con BrowserRouter + Routes + BottomNav
- `src/utils/api.js` — Agregados getPlayas() y getPlaya(), default port corregido
- `src/store/useClimaStore.js` — Agregados estado playas, idioma, y acciones

**Deps actualizadas:**
- `better-sqlite3`: ^9.4.3 → ^12.8.0 (compat Node 24)
- `leaflet` + `react-leaflet@4`: nuevas (mapa)

### Estado al cerrar sesion
- Fase 2 (PWA Beach Views) **COMPLETA** — build exitoso, 0 errores
- Falta: prueba end-to-end levantando ambos servers
- Siguiente: levantar API + PWA, navegar las 4 vistas, verificar datos reales

---

## 2026-03-24 — Sesion 1: Backend API completo (resumen retroactivo)

### Lo que se hizo
- Backend API completo con 18 archivos
- 32 playas configuradas con lat/lon, orientacion, shelter, reef
- Motor de scoring beachScorer.js (0-100 pts, 5 dimensiones)
- Marine API (Open-Meteo) para datos de oleaje
- Cache dual (fresh 15min + stale sin TTL, nunca 503)
- 6 endpoints publicos, 3 admin, 6 internos
- 32 tests escritos y pasando
- SQLite WAL mode con 5 tablas
- Sistema de recomendaciones 3 capas (reglas, Haiku, Sonnet)

### Decisiones clave de la sesion 1
- Open-Meteo en vez de OpenWeatherMap (gratis, sin key)
- SQLite en vez de Postgres (suficiente para <1000 req/dia)
- Score numerico 0-100 (no solo categorias) para ranking
- Zustand en vez de Redux (1.2KB, zero boilerplate)
- Proyecto movido de Google Drive a disco local (Drive corrompe node_modules)

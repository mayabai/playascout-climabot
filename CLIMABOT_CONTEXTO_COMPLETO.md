# ClimaBot Riviera Maya — Contexto Completo para Continuar Build

> **Proyecto**: ClimaBot v2 (3 Capas) — Clima hiperlocal para turistas
> **Empresa**: Roma Tecnología, Mérida, México
> **Ecosistema**: CancunBot (WhatsApp AI Agent)
> **Stack**: Node.js + Express + SQLite | React 18 + Vite + Tailwind | n8n
> **Infra**: PWA → Vercel | API → VPS con PM2 | n8n → VPS con OpenClaw

---

## Estado Actual del Build

| Componente | Archivos | Estado |
|---|---|---|
| **climabot-api** (Backend) | 17 archivos | ✅ 100% completo |
| **climabot-pwa** (Frontend) | 19 archivos | ✅ 100% completo |
| **climabot-n8n** (Workflows) | 1 de 6 | ❌ Faltan 5 workflows |
| **Verificación** | — | ❌ Pendiente |

---

## Arquitectura de 3 Capas de Recomendaciones

El corazón del sistema es el motor de recomendaciones turísticas:

- **Capa 1 — Reglas determinísticas ($0, ~0ms)**: 8 reglas evaluadas en orden. Categorías: `norte_activo`, `sol_extremo_seco`, `sol_extremo_lluvia_probable`, `dia_lluvioso`, `lluvia_intermitente`, `viento_moderado`, `fresco_inusual`, `dia_perfecto`. Siempre funciona como fallback.
- **Capa 2 — Variantes Haiku pre-generadas (~$0.60/mes)**: Cada 5 horas, n8n llama a Claude Haiku para generar 5 variantes de texto por categoría/zona/periodo. Se guardan en SQLite y se sirven con rotación round-robin (campo `usado_count`).
- **Capa 3 — Sonnet real-time para WhatsApp (~$120/mes)**: Claude Sonnet en conversación directa dentro de CancunBot. NO está en este repo — vive en el agente WhatsApp.

**Flujo**: Usuario pide clima → API evalúa condiciones con Capa 1 → Busca variante Capa 2 en SQLite → Si no hay, usa fallback Capa 1 → Responde en <50ms.

---

## Componente 1: climabot-api (Backend)

### Estructura de archivos

```
climabot-api/
├── .env.example          # Variables de entorno
├── ecosystem.config.js   # Config PM2
├── package.json          # Express, better-sqlite3, node-cache, cors, dotenv
├── README.md
├── tests/
│   └── api.test.js       # Tests: periodo, norte, recomendador, formatters
└── src/
    ├── index.js           # Express server con TODOS los endpoints
    ├── cache/
    │   └── climaCache.js  # node-cache dual: primary (15min TTL) + stale (sin TTL)
    ├── config/
    │   └── zonas.js       # 10 zonas con GPS + metadata turística
    ├── db/
    │   ├── init.js        # SQLite WAL mode, 5 tablas
    │   └── queries.js     # Prepared queries con rotación round-robin
    ├── services/
    │   ├── openMeteo.js   # Fetch Open-Meteo (gratis, sin API key)
    │   ├── sargazo.js     # Mock data + endpoint admin para actualizar
    │   ├── alertas.js     # Detector de nortes (>40 km/h, dirección 337.5°-22.5°)
    │   ├── recomendador.js     # Motor Capa 1 + lookup Capa 2
    │   ├── generadorVariantes.js # Llama Claude Haiku API para Capa 2
    │   └── fuentesSociales.js   # Clasifica alertas sociales por tipo/zona
    └── utils/
        ├── periodo.js     # mañana (6-12), tarde (12-19), noche (19-6) timezone Cancún
        └── formatters.js  # Direcciones, UV, mar, WMO codes → español + emoji
```

### Endpoints

**Públicos:**
- `GET /api/clima/:zona` — Endpoint principal. Devuelve: clima actual, viento, UV, precipitación, sargazo, alerta norte, recomendación del día, alertas sociales, pronóstico 12h, pronóstico 7 días.
- `GET /api/zonas` — Lista de las 10 zonas disponibles.

**Admin (header `x-admin-token`):**
- `POST /api/admin/sargazo/:zona` — Actualizar nivel de sargazo manualmente.
- `GET /api/admin/stats` — Métricas de uso por zona + stats de cache.

**Internos para n8n (header `x-internal-token`):**
- `POST /api/internal/cache-update` — Precalienta cache de TODAS las zonas (Workflow 1).
- `POST /api/internal/generar-variantes` — Regenera variantes Haiku para todas las zonas (Workflow 5).
- `POST /api/internal/variantes/:zona` — Guardar variantes específicas para una zona.
- `GET /api/internal/ultima-categoria/:zona` — Última categoría generada.
- `POST /api/internal/alertas-sociales` — Ingerir alertas de redes sociales (Workflow 6).
- `GET /api/internal/health` — Health check.

### Base de datos SQLite (5 tablas)

```sql
recomendaciones_cache    -- Capa 2: variantes Haiku por zona/categoria/periodo, con used_count rotación
alertas_sociales         -- Alertas de Twitter/CONAGUA con tipo, zona, relevancia, dedup 6h
log_generacion           -- Log de cuántas variantes se regeneraron y errores
metricas                 -- Estadísticas diarias: requests, cache_hits, cache_misses por zona
alertas_nortes_log       -- Deduplicación de alertas de norte
```

### 10 Zonas configuradas

cancun-hz, cancun-centro, playa-del-carmen, tulum, cozumel, puerto-morelos, bacalar, merida, valladolid, isla-mujeres

Cada zona tiene: lat/lon, nombre, descripción, playas[], cenotes_cercanos[], arqueologia[].

### Variables de entorno (.env)

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

### Cómo levantar

```bash
cd climabot-api
npm install
cp .env.example .env  # Editar con tus valores
mkdir -p data
npm run dev   # Development con nodemon
npm start     # Production
npm test      # Jest tests
```

**Producción con PM2:**
```bash
pm2 start ecosystem.config.js
```

---

## Componente 2: climabot-pwa (Frontend)

### Estructura de archivos

```
climabot-pwa/
├── index.html              # Shell HTML con manifest link
├── package.json            # React 18, Zustand, Vite, Tailwind
├── vite.config.js          # Puerto 3000, plugin React
├── tailwind.config.js      # Colores custom + animaciones (fade-in, slide-up)
├── postcss.config.js
├── public/
│   ├── manifest.json       # PWA manifest para install + TWA
│   └── sw.js               # Service Worker: network-first API, cache-first static
└── src/
    ├── main.jsx            # Entry point + SW registration
    ├── index.css            # Tailwind imports + scrollbar-hide
    ├── App.jsx             # Layout principal con theme dinámico por periodo
    ├── store/
    │   └── useClimaStore.js # Zustand: zona, clima, loading, error, fetch actions
    ├── hooks/
    │   ├── useClima.js      # Hook: auto-fetch al montar + refresh cada 15 min
    │   └── usePeriodo.js    # Hook: calcula periodo (mañana/tarde/noche) timezone Cancún
    ├── themes/
    │   └── periodos.js      # 3 temas visuales con gradients, colores, emojis
    ├── utils/
    │   └── api.js           # Cliente HTTP con AbortSignal timeout 10s
    └── components/
        ├── HeroCard.jsx        # Card principal: temperatura, sensación, icono, descripción
        ├── WeatherStrip.jsx    # Scroll horizontal próximas 12 horas
        ├── SargazoIndicator.jsx # Barra de nivel + playas limpias
        ├── WindCard.jsx        # Velocidad, dirección, oleaje, alerta norte
        ├── UVGauge.jsx         # Gauge circular + nivel + horas seguras
        ├── AlertBanner.jsx     # Alertas norte/sociales + recomendación + qué llevar
        ├── ForecastWeek.jsx    # Pronóstico 7 días compacto
        ├── ZonaPicker.jsx      # Dropdown para cambiar zona (persiste en localStorage)
        └── CTAWhatsApp.jsx     # Botón verde "Chatea con CancunBot"
```

### Temas dinámicos por periodo

La PWA cambia TODA su paleta visual según la hora en Cancún:
- **Mañana (6-12h)**: Ámbar/naranja, gradients cálidos, emoji 🌅
- **Tarde (12-19h)**: Azul/cyan, gradients frescos, emoji ☀️
- **Noche (19-6h)**: Indigo/slate oscuro, cards con backdrop-blur, emoji 🌙

### Variable de entorno PWA

```
VITE_API_URL=https://api.cancunbot.com   # URL del backend
```

### Cómo levantar

```bash
cd climabot-pwa
npm install
npm run dev      # Vite dev server en :3000
npm run build    # Build para Vercel
```

**Deploy a Vercel:**
```bash
cd climabot-pwa
vercel --prod
```

### TWA (Google Play)

La PWA está preparada para empaquetarse como TWA (Trusted Web Activity) usando Bubblewrap para publicar en Google Play Store. El manifest.json ya tiene los íconos y configuración necesaria. Solo falta generar los íconos reales (192x192 y 512x512) en `/public/icons/`.

---

## Componente 3: climabot-n8n (Workflows) — ⚠️ INCOMPLETO

### Estado

| # | Workflow | Frecuencia | Estado |
|---|---|---|---|
| 01 | Cache Warming | Cada 30 min | ✅ Creado |
| 02 | Alertas de Norte | Cada 15 min | ❌ **FALTA** |
| 03 | Buenos Días | Diario 7 AM | ❌ **FALTA** |
| 04 | Re-engagement | Diario 10 AM | ❌ **FALTA** |
| 05 | Generación Haiku | Cada 5 horas | ❌ **FALTA** |
| 06 | Monitoreo Social | Cada 30 min | ❌ **FALTA** |

### Descripción de cada workflow pendiente

**02 — Alertas de Norte (cada 15 min)**
- Llama `GET /api/clima/cancun-hz` para obtener datos de viento
- Si `alerta_norte.activo === true`, envía alerta por webhook a CancunBot
- Usa `alertas_nortes_log` para no duplicar alertas en las últimas 3 horas
- Endpoint API ya existe: la lógica de evaluarNorte() está en `alertas.js`

**03 — Buenos Días (diario 7 AM Cancún)**
- Llama `/api/clima/{zona}` para las zonas principales (cancun-hz, playa-del-carmen, tulum)
- Formatea un mensaje "buenos días" con el clima + recomendación del día
- Envía por webhook a CancunBot para broadcast a usuarios suscritos
- Template: "🌅 Buenos días desde {zona}! {temp}°C, {descripcion}. {recomendacion}"

**04 — Re-engagement (diario 10 AM Cancún)**
- Consulta `/api/admin/stats` para ver zonas con bajo engagement
- Si una zona tiene <10 requests en las últimas 24h, genera contenido especial
- Envía notificación push (via webhook) para re-enganchar usuarios inactivos

**05 — Generación de Variantes Haiku (cada 5 horas)**
- Llama `POST /api/internal/generar-variantes` con token interno
- Este endpoint ya tiene TODA la lógica: itera zonas, evalúa si necesita regenerar, llama Haiku, guarda
- El workflow solo necesita: Schedule Trigger → HTTP POST → Log resultado
- **IMPORTANTE**: Este es el que alimenta la Capa 2 del motor de recomendaciones

**06 — Monitoreo Social (cada 30 min)**
- Fuentes RSS via Inoreader (GRATIS):
  - @conagua_clima (Twitter/X)
  - @ConaguaQRoo (Twitter/X)
  - @ProtCivil_QRoo (Twitter/X)
- Scraping: sargassummonitoring.com
- Clasifica cada alerta por tipo (norte, sargazo, bandera_roja, ciclon, lluvia) y zona
- Envía a `POST /api/internal/alertas-sociales` para persistir en SQLite
- La lógica de clasificación ya existe en `fuentesSociales.js`

### Variables de entorno n8n

Configurar en n8n como credenciales o environment variables:
```
CLIMABOT_API_URL=http://localhost:3500    # o URL del VPS
CLIMABOT_INTERNAL_TOKEN=<mismo-que-en-.env>
CLIMABOT_ADMIN_TOKEN=<mismo-que-en-.env>
CANCUNBOT_WEBHOOK_URL=<webhook-de-cancunbot>
```

---

## Decisiones de Arquitectura

### ¿Por qué Open-Meteo y no OpenWeatherMap?
Open-Meteo es 100% gratis, sin API key, sin límite de requests razonables. OpenWeatherMap cobra a partir de 1000 calls/día. Con 10 zonas × cada 30 min = 480 calls/día, Open-Meteo es la opción correcta.

### ¿Por qué SQLite y no Postgres?
Para este volumen (10 zonas, <1000 req/día), SQLite con WAL mode maneja todo sin problemas. Ahorra un servicio extra en el VPS. Si escala a >50 zonas, migrar a Postgres.

### ¿Por qué node-cache dual (fresh + stale)?
Si Open-Meteo se cae, el API NUNCA devuelve 503 (siempre que haya tenido al menos un fetch exitoso). El cache stale no tiene TTL — siempre mantiene el último dato bueno.

### ¿Por qué Inoreader RSS y no la API de Twitter/X?
La API de X cuesta $200/mes (plan Basic). Inoreader convierte cualquier cuenta de Twitter a feed RSS gratis. n8n tiene nodo RSS nativo.

### ¿Por qué Zustand y no Redux/Context?
Zustand es 1.2KB, zero boilerplate, y suficiente para el state de esta PWA (zona seleccionada, datos clima, loading/error).

---

## Qué falta para producción

### Inmediato (para terminar el build)
1. **Crear workflows n8n 02-06** (5 JSONs)
2. **Generar íconos PWA** (icon-192.png, icon-512.png) en `/public/icons/`
3. **Correr tests** (`npm test` en climabot-api)
4. **Verificar que el build de Vite funciona** (`npm run build` en climabot-pwa)

### Antes de deploy
5. Configurar `.env` real con tokens y API key de Anthropic
6. Crear la base de datos: `mkdir -p data` (se autocrea al primer `initDB()`)
7. Configurar CORS_ORIGIN al dominio real de la PWA
8. Configurar DNS: `clima.cancunbot.com` → Vercel, `api.cancunbot.com` → VPS
9. Importar workflows en n8n y configurar credenciales

### Post-deploy
10. Configurar monitoreo (el endpoint `/api/internal/health` ya existe)
11. Generar primer lote de variantes Haiku (correr workflow 05 manualmente)
12. Alimentar datos reales de sargazo via `/api/admin/sargazo/:zona`
13. Empaquetar PWA como TWA con Bubblewrap para Google Play

---

## Costos estimados mensuales

| Concepto | Costo |
|---|---|
| Open-Meteo API | $0 |
| Haiku Capa 2 (variantes cada 5h) | ~$0.60 |
| Sonnet Capa 3 (WhatsApp, ~4000 msgs) | ~$120 |
| VPS (API + n8n) | ~$10-20 |
| Vercel (PWA hosting) | $0 (free tier) |
| Inoreader (RSS social) | $0 |
| **Total** | **~$130-140/mes** |
| Revenue estimado (marketplace) | ~$1,500-3,000/mes |
| **Ratio Revenue/AI Cost** | **~12:1** |

---

## Comando rápido para continuar en Claude Code

```
Continúa el build de ClimaBot Riviera Maya. Lee CLIMABOT_CONTEXTO_COMPLETO.md para contexto.

Pendiente:
1. Crear 5 workflows n8n (02-06) como JSONs importables
2. Correr npm test en climabot-api
3. Correr npm run build en climabot-pwa
4. Verificar estructura completa

Los 3 folders ya existen: climabot-api/, climabot-pwa/, climabot-n8n/
```

# ClimaBot API v2.0

API de clima hiperlocal para turistas en la Riviera Maya — ecosistema CancunBot.

## Quick Start

```bash
# Instalar dependencias
npm install

# Copiar y configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# Desarrollo
npm run dev

# Producción con PM2
pm2 start ecosystem.config.js
```

## Endpoints

### Públicos
- `GET /api/clima/:zona` — Clima completo + recomendaciones + alertas sociales
- `GET /api/zonas` — Lista de zonas disponibles

### Admin (requiere `x-admin-token` header)
- `POST /api/admin/sargazo/:zona` — Actualizar datos de sargazo
- `GET /api/admin/stats` — Estadísticas de uso

### Internos (requiere `x-internal-token` header, usados por n8n)
- `POST /api/internal/cache-update` — Precargar cache (Workflow 1)
- `POST /api/internal/alertas-sociales` — Ingestar alertas de Twitter/CONAGUA (Workflow 6)
- `GET /api/internal/ultima-categoria/:zona` — Última categoría generada (Workflow 5)
- `POST /api/internal/variantes/:zona` — Guardar variantes de Haiku (Workflow 5)
- `POST /api/internal/generar-variantes` — Trigger generación completa (Workflow 5)
- `GET /api/internal/health` — Health check

## Zonas
cancun-hz, cancun-centro, playa-del-carmen, tulum, cozumel, puerto-morelos, bacalar, merida, valladolid, isla-mujeres

## Sistema de recomendaciones — 3 Capas
1. **Capa 1:** Reglas determinísticas ($0, ~0ms)
2. **Capa 2:** Variantes pre-generadas por Haiku cada 5h (~$0.60/mes)
3. **Capa 3:** LLM en tiempo real para conversación WhatsApp (~$120/mes)

## Tests
```bash
npm test
```

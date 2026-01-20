# QR Generator - Estado de Desarrollo

## Última actualización: Enero 2026

---

## Resumen del Proyecto

Generador de códigos QR con funcionalidades premium, diseñado para competir con herramientas comerciales como QRCode Monkey, Beaconstac, etc.

### Stack Tecnológico
- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS 4
- **Backend**: Next.js API Routes, Prisma ORM
- **Base de datos**: PostgreSQL (Supabase)
- **Autenticación**: NextAuth.js v4
- **QR Generation**: `qr-code-styling` (migrado desde `qrcode` básico)
- **PDF Generation**: `jspdf`
- **CSV Parsing**: `papaparse`
- **ZIP Generation**: `jszip`

---

## Funcionalidades Implementadas

### 1. Generación de QR (Público)
- [x] 7 tipos de QR: URL, Texto, Email, Teléfono, SMS, WiFi, vCard
- [x] Preview en tiempo real mientras se escribe
- [x] Descarga en PNG, SVG y PDF
- [x] Logo/imagen en el centro del QR

### 2. Estilos Avanzados de QR
- [x] **6 estilos de puntos**: Square, Dots, Rounded, Extra-rounded, Classy, Classy-rounded
- [x] **3 estilos de esquinas**: Square, Dot, Rounded
- [x] **Color de esquinas independiente** (deshabilitado cuando hay gradiente)
- [x] **Gradientes**: Linear y Radial con rotación configurable (0-360°)
- [x] UI con tabs (Colors & Logo / Style) para mejor organización
- [x] Selector de tipo de QR compacto (pills horizontales)

### 3. Dashboard (Usuarios Autenticados)
- [x] Lista de QR codes con contador de scans
- [x] Edición de URL destino (QR dinámicos)
- [x] Borrado individual y masivo
- [x] Historial de scans por QR
- [x] **Export batch** (ZIP o PDF) de QRs seleccionados

### 4. Campañas
- [x] Crear/editar/eliminar campañas
- [x] Asignar QR codes a campañas
- [x] Vista de campaña con sus QR codes

### 5. Analytics
- [x] Scans por día (gráfico temporal)
- [x] Dispositivos (mobile/tablet/desktop)
- [x] Navegadores y sistemas operativos
- [x] Ubicación geográfica (país, ciudad)
- [x] Filtros por rango de fechas (7/30/90/365 días)

### 6. Autenticación
- [x] Registro con email/password
- [x] Login con credenciales
- [x] Google OAuth (configurado)
- [x] Roles (USER/ADMIN)

### 7. Bulk Creation ✨ **NUEVO**
- [x] UI para upload de archivo CSV (drag & drop)
- [x] Parser de CSV con validación por fila
- [x] Preview de datos antes de crear
- [x] Generación en batch con progress bar
- [x] Descarga de ZIP con todos los QRs
- [x] Plantilla CSV descargable

### 8. Exportación Profesional
- [x] PDF individual desde página principal
- [x] PDF de etiquetas con 4 layouts (2x2, 2x4, 3x5, 4x6)
- [x] Export modal con opciones (Labels PDF, Multi-page PDF, ZIP)
- [x] Batch export desde dashboard (selección múltiple)

### 9. Página de Precios
- [x] Página `/pricing` con diseño consistente
- [x] 3 planes definidos: Free, Starter ($5/mes), Pro ($12/mes)
- [x] Tabla comparativa de features
- [x] Sección de FAQ
- [x] Link en Navbar (desktop y móvil)

### 10. Sistema de Planes y Límites
- [x] Modelo `Subscription` en Prisma (plan, status, fechas, campos Lemon Squeezy)
- [x] Modelo `UsageRecord` para contadores mensuales
- [x] Configuración de planes en `lib/plans.ts` (Free, Starter, Pro)
- [x] Funciones de verificación de límites en `lib/subscription.ts`
- [x] `checkCanCreateDynamicQR()` - verificar antes de crear QR dinámico
- [x] `checkCanTrackScan()` - verificar límites de scans
- [x] `userHasFeature()` - verificar features por plan
- [x] `getSubscriptionStatus()` - status completo con uso actual
- [x] Contadores: `incrementDynamicQRCount()`, `incrementScanCount()`

### 11. Páginas Legales y Landing ✨ **NUEVO**
- [x] Términos de Servicio (`/legal/terms`) con cláusulas de protección
- [x] Política de Privacidad (`/legal/privacy`) con GDPR/CCPA
- [x] Página de éxito post-pago (`/checkout/success`) con confetti
- [x] Landing page mejorada con secciones:
  - How It Works (3 pasos)
  - Features (6 características)
  - Static vs Dynamic comparison
  - Use Cases (3 industrias)
  - CTA final
- [x] Footer reutilizable con links legales
- [x] Componente `Footer.tsx` con variantes (light/dark/transparent)

---

## Arquitectura de Archivos Clave

```
├── app/
│   ├── page.tsx                    # Landing page con generador QR
│   ├── pricing/page.tsx            # Página de precios
│   ├── legal/
│   │   ├── terms/page.tsx          # Términos de servicio
│   │   └── privacy/page.tsx        # Política de privacidad
│   ├── checkout/
│   │   └── success/page.tsx        # Página de éxito post-pago
│   ├── api/
│   │   ├── qr/
│   │   │   ├── route.ts            # GET lista QRs
│   │   │   ├── create/route.ts     # POST crear QR (con estilos)
│   │   │   ├── [id]/route.ts       # GET/PATCH/DELETE QR individual
│   │   │   ├── bulk-create/route.ts # POST creación masiva
│   │   │   └── bulk-delete/route.ts
│   │   ├── campaigns/              # CRUD campañas
│   │   ├── analytics/route.ts      # Analytics globales
│   │   ├── checkout/route.ts       # Crear sesión de checkout Lemon Squeezy
│   │   ├── subscription/
│   │   │   ├── route.ts            # GET estado de suscripción
│   │   │   └── portal/route.ts     # POST obtener URL del portal
│   │   └── webhooks/
│   │       └── lemonsqueezy/route.ts # Webhook para eventos de pago
│   ├── dashboard/
│   │   ├── page.tsx                # Overview
│   │   ├── qr-codes/               # Lista y detalle de QRs
│   │   ├── bulk-create/            # Creación masiva desde CSV
│   │   ├── labels/                 # Generador de etiquetas PDF
│   │   ├── campaigns/              # Gestión de campañas
│   │   ├── analytics/              # Analytics globales
│   │   └── subscription/           # Gestión de suscripción y upgrades
│   └── r/[shortId]/route.ts        # Redirect + tracking
│
├── components/
│   ├── ui/
│   │   ├── Navbar.tsx              # Navegación principal
│   │   └── Footer.tsx              # Footer con links legales (3 variantes)
│   ├── dashboard/
│   │   └── UsageLimitsCard.tsx     # Card de uso y límites del plan
│   └── qr/
│       ├── QRForm.tsx              # Formulario con tabs y estilos
│       ├── QRPreview.tsx           # Preview + descarga (PNG/SVG/PDF)
│       ├── QRCodesList.tsx         # Lista en dashboard + export
│       ├── ColorPicker.tsx         # Selector de color
│       ├── BulkUploader.tsx        # Upload de CSV
│       ├── BulkPreviewTable.tsx    # Preview de datos CSV
│       ├── BulkProgressBar.tsx     # Progreso de creación
│       ├── BulkResultsSummary.tsx  # Resumen de resultados
│       └── ExportModal.tsx         # Modal de exportación batch
│
├── lib/
│   ├── qr-generator.ts             # Generación con qr-code-styling
│   ├── qr-content-generator.ts     # Formateo de contenido por tipo
│   ├── pdf-generator.ts            # Generación de PDFs (single, labels, multi-page)
│   ├── csv-parser.ts               # Parser y validador de CSV
│   ├── csv-template.ts             # Generador de plantilla CSV
│   ├── plans.ts                    # Configuración de planes (límites, features, precios)
│   ├── subscription.ts             # Lógica de suscripciones y verificación de límites
│   ├── lemonsqueezy.ts             # SDK y helpers de Lemon Squeezy
│   ├── auth.ts                     # Configuración NextAuth
│   └── prisma.ts                   # Cliente Prisma singleton
│
├── types/
│   ├── qr.ts                       # Tipos y constantes de estilos QR
│   ├── bulk.ts                     # Tipos para bulk creation
│   └── export.ts                   # Tipos para exportación (PDF, labels)
│
└── prisma/
    └── schema.prisma               # Modelos con campos de estilo
```

---

## Schema de Base de Datos

```prisma
model QRCode {
  // ... campos básicos ...

  // Estilos avanzados
  dotStyle         String?   @default("square")
  cornerStyle      String?   @default("square")
  cornerDotStyle   String?   @default("square")
  cornerColor      String?
  gradientEnabled  Boolean   @default(false)
  gradientType     String?   @default("linear")
  gradientStart    String?
  gradientEnd      String?
  gradientRotation Int?      @default(0)
}

model Subscription {
  id                    String             @id
  userId                String             @unique
  planId                String             @default("free") // 'free', 'starter', 'pro'
  status                SubscriptionStatus @default(ACTIVE)
  billingCycle          BillingCycle?      // MONTHLY o YEARLY

  // Campos Lemon Squeezy (preparados para integración)
  lemonSqueezyId        String?            @unique
  lemonSqueezyCustomerId String?
  // ... más campos para billing
}

model UsageRecord {
  id              String   @id
  userId          String
  period          String   // "YYYY-MM" para tracking mensual
  dynamicQRsCreated Int    @default(0)
  scansTracked      Int    @default(0)

  @@unique([userId, period])
}
```

---

## Próximos Pasos (Roadmap)

### ~~Prioridad 1: Sistema de Planes y Límites~~ ✅ COMPLETADO
~~Implementar la lógica de planes para monetización.~~
- [x] Modelo `Subscription` en Prisma (plan, status, fechas)
- [x] Contadores por usuario (QRs dinámicos creados, scans del mes)
- [x] Funciones para verificar límites antes de crear/escanear
- [x] UI para mostrar uso actual vs límites del plan (`UsageLimitsCard`)
- [x] Bloquear features según plan en APIs (analytics, bulk, campaigns)
- [x] Integrar verificación de límites en endpoints existentes

### ~~Prioridad 1: Integración de Pagos (Lemon Squeezy)~~ ✅ COMPLETADO
- [x] Crear cuenta en Lemon Squeezy (Store ID: 276281)
- [x] Configurar productos (4 variantes: Starter/Pro × mensual/anual)
- [x] Integrar SDK oficial `@lemonsqueezy/lemonsqueezy.js`
- [x] Endpoint `/api/checkout` para crear sesiones de pago
- [x] Webhook `/api/webhooks/lemonsqueezy` para procesar eventos
- [x] Botones de pricing conectados al checkout
- [x] Webhook URL configurado en Lemon Squeezy dashboard
- [x] Flujo completo de pago probado y funcionando
- [x] Página de gestión de suscripción (`/dashboard/subscription`)
- [x] Integración con Customer Portal de Lemon Squeezy

### Prioridad 2: Templates Prediseñados
- [ ] Galería de templates por industria
- [ ] Templates con frames/bordes decorativos
- [ ] Guardar estilos como "mis templates"

### ~~Descartado: API Pública~~
~~No es prioridad para el público objetivo (pequeños negocios, artistas, freelancers). Se puede considerar en el futuro si hay demanda.~~

### ~~Descartado: Landing Pages Integradas~~
~~Compite con Linktree y similares ya establecidos. Es un proyecto muy grande para el valor que agrega. Mejor enfocarse en el core: QR codes.~~

---

## Decisiones Técnicas Tomadas

### ¿Por qué `qr-code-styling` en vez de `qrcode`?
- `qrcode` solo soporta colores básicos (dark/light)
- `qr-code-styling` soporta nativamente:
  - 6+ estilos de dots
  - Estilos de corners independientes
  - Gradientes (linear/radial)
  - Logo con opciones avanzadas
- Bien mantenida, usada en producción
- Compatible con Next.js/React

### ¿Por qué `jspdf` para PDFs?
- Ligero (~280KB), client-side
- No requiere servidor para generar PDFs
- Suficiente para etiquetas y documentos simples
- Buena documentación y comunidad

### Gradiente vs Corner Color
- Son mutuamente excluyentes en la UI
- Cuando se activa gradiente, se deshabilita corner color
- El gradiente se aplica a todo (dots + corners)

### UI con Tabs
- Evita scroll excesivo que oculta el preview
- "Colors & Logo" para lo básico
- "Style" para opciones avanzadas
- Selector de tipo QR compacto (pills)

---

## Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Prisma
npx prisma generate      # Regenerar cliente
npx prisma db push       # Push schema a DB
npx prisma studio        # UI para ver datos

# Migraciones
npx prisma migrate dev --name descripcion
```

---

## Variables de Entorno Requeridas

```env
# Base de datos
DATABASE_URL=            # PostgreSQL connection string

# Autenticación
NEXTAUTH_SECRET=         # Secret para NextAuth
NEXTAUTH_URL=            # URL base (http://localhost:3000 en dev)
GOOGLE_CLIENT_ID=        # Para OAuth (opcional)
GOOGLE_CLIENT_SECRET=    # Para OAuth (opcional)

# Pagos (Lemon Squeezy) ✅ CONFIGURADO
LEMON_SQUEEZY_API_KEY=                       # API key
LEMON_SQUEEZY_STORE_ID=                      # Store ID (276281)
LEMON_SQUEEZY_WEBHOOK_SECRET=                # Webhook secret
LEMON_SQUEEZY_STARTER_MONTHLY_VARIANT_ID=    # 1233898
LEMON_SQUEEZY_STARTER_YEARLY_VARIANT_ID=     # 1233949
LEMON_SQUEEZY_PRO_MONTHLY_VARIANT_ID=        # 1233960
LEMON_SQUEEZY_PRO_YEARLY_VARIANT_ID=         # 1233961
```

---

## Modelo de Negocio Definido

### Planes (según `lib/plans.ts`)

| Plan | Precio | QRs Dinámicos | Scans/mes | Resolución | Features |
|------|--------|---------------|-----------|------------|----------|
| **Free** | $0 | 0 | 0 | 500px | Estilos básicos |
| **Starter** | $5/mes ($49/año) | 15 | 5,000 | 1024px | + Logo, SVG, Analytics básico |
| **Pro** | $12/mes ($119/año) | Ilimitados | Ilimitados | 2048px | + PDF, Analytics avanzado, Campañas, Bulk |

### Diferenciadores vs Competencia
- **Precio competitivo**: $5/mes vs $5-7/mes de competidores
- **Bulk creation accesible**: desde $12/mes vs $16+ en otros
- **Sin marca de agua** en ningún plan
- **Estilos avanzados** en todos los planes

### Público Objetivo
- Artistas y galerías
- Pequeños comercios (cafeterías, tiendas)
- Freelancers (tarjetas de presentación)
- Eventos pequeños (bodas, conferencias)
- Profesores y educadores

---

## Notas para Próxima Sesión

### Estado Actual: LISTO PARA LANZAMIENTO
1. **Lemon Squeezy 100% funcional** - pagos, webhooks, y portal de cliente integrados
2. **URL de producción**: `https://qr-code-generator-bxjy.vercel.app`
3. **Páginas legales listas** - `/legal/terms` y `/legal/privacy`
4. **Landing page mejorada** - con secciones de features, how it works, comparación, casos de uso
5. **Página de éxito post-pago** - `/checkout/success` con confetti y guía

### IMPORTANTE: Cambiar email de contacto
En `/legal/terms` y `/legal/privacy` cambiar `support@qrgenerator.app` por tu email real.

### Flujo de Pagos Implementado
1. Usuario va a `/pricing` o `/dashboard/subscription`
2. Click en plan → `/api/checkout` crea sesión → redirige a Lemon Squeezy
3. Usuario completa pago en Lemon Squeezy
4. Webhook recibe evento → actualiza `Subscription` en DB
5. Usuario regresa a `/checkout/success` con confetti
6. "Manage Billing" abre portal de Lemon Squeezy para facturas/cancelar

### Páginas Públicas
| Ruta | Descripción |
|------|-------------|
| `/` | Landing page con generador QR |
| `/pricing` | Planes y precios |
| `/legal/terms` | Términos de servicio |
| `/legal/privacy` | Política de privacidad |
| `/checkout/success` | Éxito post-pago |

### Próximos pasos opcionales
- [ ] Comprar dominio personalizado
- [ ] Configurar dominio en Vercel y Lemon Squeezy
- [ ] Agregar Google Analytics o Plausible
- [ ] Templates prediseñados (Prioridad 2)

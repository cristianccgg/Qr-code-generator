# QR Generator - Estado de Desarrollo

## Última actualización: Enero 2025

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

### 8. Exportación Profesional ✨ **NUEVO**
- [x] PDF individual desde página principal
- [x] PDF de etiquetas con 4 layouts (2x2, 2x4, 3x5, 4x6)
- [x] Export modal con opciones (Labels PDF, Multi-page PDF, ZIP)
- [x] Batch export desde dashboard (selección múltiple)

---

## Arquitectura de Archivos Clave

```
├── app/
│   ├── page.tsx                    # Página principal (generador público)
│   ├── api/
│   │   ├── qr/
│   │   │   ├── route.ts            # GET lista QRs
│   │   │   ├── create/route.ts     # POST crear QR (con estilos)
│   │   │   ├── [id]/route.ts       # GET/PATCH/DELETE QR individual
│   │   │   ├── bulk-create/route.ts # POST creación masiva
│   │   │   └── bulk-delete/route.ts
│   │   ├── campaigns/              # CRUD campañas
│   │   └── analytics/route.ts      # Analytics globales
│   ├── dashboard/
│   │   ├── page.tsx                # Overview
│   │   ├── qr-codes/               # Lista y detalle de QRs
│   │   ├── bulk-create/            # Creación masiva desde CSV
│   │   ├── labels/                 # Generador de etiquetas PDF
│   │   ├── campaigns/              # Gestión de campañas
│   │   └── analytics/              # Analytics globales
│   └── r/[shortId]/route.ts        # Redirect + tracking
│
├── components/qr/
│   ├── QRForm.tsx                  # Formulario con tabs y estilos
│   ├── QRPreview.tsx               # Preview + descarga (PNG/SVG/PDF)
│   ├── QRCodesList.tsx             # Lista en dashboard + export
│   ├── ColorPicker.tsx             # Selector de color
│   ├── BulkUploader.tsx            # Upload de CSV
│   ├── BulkPreviewTable.tsx        # Preview de datos CSV
│   ├── BulkProgressBar.tsx         # Progreso de creación
│   ├── BulkResultsSummary.tsx      # Resumen de resultados
│   └── ExportModal.tsx             # Modal de exportación batch
│
├── lib/
│   ├── qr-generator.ts             # Generación con qr-code-styling
│   ├── qr-content-generator.ts     # Formateo de contenido por tipo
│   ├── pdf-generator.ts            # Generación de PDFs (single, labels, multi-page)
│   ├── csv-parser.ts               # Parser y validador de CSV
│   ├── csv-template.ts             # Generador de plantilla CSV
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

## Schema de Base de Datos (Campos de Estilo)

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
```

---

## Próximos Pasos (Roadmap)

### Prioridad 1: Landing Pages Integradas
Micro-páginas cuando se escanea el QR (estilo Linktree).
- [ ] Modelo `LandingPage` en Prisma
- [ ] Editor de landing page (drag & drop o bloques)
- [ ] Opción de redirigir a landing en vez de URL
- [ ] Templates prediseñados
- [ ] Analytics específicos de landing

### Prioridad 2: API Pública
- [ ] Documentación de API
- [ ] API keys por usuario
- [ ] Rate limiting
- [ ] Webhooks para eventos

### Prioridad 3: Templates Prediseñados
- [ ] Galería de templates por industria
- [ ] Templates con frames/bordes decorativos
- [ ] Guardar estilos como "mis templates"

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
DATABASE_URL=            # PostgreSQL connection string
NEXTAUTH_SECRET=         # Secret para NextAuth
NEXTAUTH_URL=            # URL base (http://localhost:3000 en dev)
GOOGLE_CLIENT_ID=        # Para OAuth (opcional)
GOOGLE_CLIENT_SECRET=    # Para OAuth (opcional)
```

---

## Notas para Próxima Sesión

1. **Landing Pages** es la siguiente prioridad - diferenciador clave vs competencia
2. Los estilos ya se guardan en DB, listos para edición futura
3. El generador (`lib/qr-generator.ts`) ya está preparado para recibir todas las opciones
4. La UI del formulario usa tabs, fácil de extender con más opciones
5. El sistema de exportación soporta múltiples formatos y layouts

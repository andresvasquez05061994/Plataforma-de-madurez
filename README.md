# MaturityOS — Plataforma de Diagnóstico de Madurez Digital

Aplicación web de diagnóstico de madurez digital construida con **Next.js 14**, **TypeScript** y **Tailwind CSS**. Evalúa organizaciones en tres pilares: **BIM**, **IA/RPA** y **PLM**.

## 🚀 Inicio Rápido

### Prerequisitos
- Node.js 18+ y npm

### Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar variables de entorno
cp .env.local.example .env.local

# 3. Configurar variables de entorno en .env.local
# (ver sección de configuración abajo)

# 4. Ejecutar en modo desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

## ⚙️ Configuración

### Variables de Entorno

Edita `.env.local` con tus credenciales:

| Variable | Descripción | Requerida |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de tu proyecto Supabase | Para persistencia |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anon de Supabase | Para persistencia |
| `ANTHROPIC_API_KEY` | API key de Anthropic (Claude) | Para análisis IA |
| `NEXT_PUBLIC_SITE_URL` | URL del sitio (default: localhost:3000) | Opcional |

> **Nota:** La app funciona sin Supabase ni Claude API. Sin ellas, el análisis usa un texto pre-generado y los datos no se persisten.

### Base de Datos (Supabase)

Crea la tabla `assessments` en tu proyecto Supabase:

```sql
CREATE TABLE assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company TEXT NOT NULL,
  industry TEXT,
  employees TEXT,
  answers JSONB,
  scores JSONB,
  global_score NUMERIC,
  global_level TEXT,
  ai_analysis TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_role TEXT,
  objective TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

-- Política para insertar (pública)
CREATE POLICY "Allow public inserts" ON assessments
  FOR INSERT WITH CHECK (true);

-- Política para leer (solo autenticados, para admin)
CREATE POLICY "Allow authenticated reads" ON assessments
  FOR SELECT USING (auth.role() = 'authenticated');
```

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── layout.tsx            # Root layout con fonts
│   ├── globals.css           # Estilos globales
│   ├── diagnostico/
│   │   └── page.tsx          # Flujo de diagnóstico
│   ├── resultados/
│   │   └── page.tsx          # Dashboard de resultados
│   ├── admin/
│   │   └── page.tsx          # Panel de administración
│   └── api/
│       ├── analyze/route.ts  # Endpoint Claude API
│       └── assessment/route.ts # CRUD Supabase
├── components/
│   ├── diagnostic/           # Componentes del diagnóstico
│   └── results/              # Componentes del dashboard
├── data/
│   ├── questions-bim.ts      # Preguntas BIM
│   ├── questions-ia.ts       # Preguntas IA/RPA
│   ├── questions-plm.ts      # Preguntas PLM
│   └── sections.ts           # Metadatos de secciones
├── lib/
│   ├── scoring.ts            # Cálculo de scores
│   ├── supabase.ts           # Cliente Supabase
│   └── pdf-generator.ts      # Generación de PDF
├── store/
│   └── assessment-store.ts   # Estado global (Zustand)
├── types/
│   └── assessment.ts         # Interfaces TypeScript
└── middleware.ts              # Protección de rutas admin
```

## 🎨 Flujo de la Aplicación

1. **Landing** (`/`) — Seleccionar industria → Iniciar diagnóstico
2. **Diagnóstico** (`/diagnostico`) — 6 secciones, una pregunta por pantalla
3. **Resultados** (`/resultados`) — Dashboard con scores, radar chart, análisis IA
4. **Admin** (`/admin`) — Listado de todos los diagnósticos (requiere Supabase)

## 🛠️ Personalización

### Preguntas
Edita los archivos en `src/data/questions-*.ts` para personalizar las preguntas de cada servicio. Cada pregunta sigue la interfaz `Question` definida en `src/types/assessment.ts`.

### Colores
Modifica `tailwind.config.ts` para cambiar la paleta de colores.

### Análisis IA
El prompt del sistema se configura en `src/app/api/analyze/route.ts`.

## 📦 Build de Producción

```bash
npm run build
npm start
```

## 📄 Licencia

Proyecto privado — Ingeniería Asistida por Computador (IAC).

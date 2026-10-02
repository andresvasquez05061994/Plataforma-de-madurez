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

Edita `.env.local` con tus credenciales. La plantilla está en `.env.local.example`.

| Variable | Descripción | Requerida |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase | Para persistencia y login de admin |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anon (pública). No uses aquí la service role | Para guardar diagnósticos y login |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave `service_role` o Secret key. **Solo servidor**, nunca `NEXT_PUBLIC_` | Para que el admin lea diagnósticos |
| `ADMIN_EMAILS` | Correos con acceso a `/admin`, separados por coma. Vacío = nadie entra | Para el panel admin |
| `OPENAI_API_KEY` | API key de OpenAI (`gpt-4o-mini`) | Para análisis IA |
| `NEXT_PUBLIC_SITE_URL` | URL del sitio (default: localhost:3000) | Opcional |
| `RESEND_API_KEY` | API key de Resend | Para enviar el reporte por correo |
| `RESEND_FROM_EMAIL` | Remitente del correo | Opcional |
| `GOOGLE_SHEET_*` | Hojas publicadas con las preguntas | Opcional (hay preguntas estáticas) |

> **Nota:** Sin `OPENAI_API_KEY` el análisis usa un texto pregenerado. Sin Supabase los datos no se persisten. El panel `/admin` queda cerrado si faltan `ADMIN_EMAILS` o `SUPABASE_SERVICE_ROLE_KEY`.

### Panel de administración

`/admin` y `GET /api/assessment` exigen una sesión de Supabase Auth cuyo correo esté en `ADMIN_EMAILS`. El ingreso puede ser con Google o con correo y contraseña; las dos vías usan la misma allowlist. Quien responde un diagnóstico no inicia sesión: `/`, `/diagnostico`, `/resultados`, `POST /api/analyze`, `POST /api/report`, `POST /api/send-email` y `GET /api/questions/[service]` siguen siendo públicos.

La clave anon no puede leer la tabla. La lectura del listado usa la service role **después** de comprobar la allowlist. La autorización no usa `user_metadata` (el usuario puede editarlo).

#### Después de mergear (Vercel y Supabase)

Esto no se aplica solo. Hay que hacerlo a mano.

1. **Supabase → Authentication → Users → Add user.** Correo y contraseña del administrador. Marca **Auto Confirm User**.
2. **Supabase → Authentication → Sign In / Providers → Email.** Déjalo activo y desactiva **Allow new users to sign up**, para que nadie se registre con la clave anon.
3. **Supabase → SQL Editor.** Pega y ejecuta `supabase/migrations/20261002170000_lock_down_assessments_rls.sql`. Reemplaza cualquier política que deje leer `assessments` a `anon` o a todo `authenticated`.
4. Comprueba el cierre de la tabla (debe fallar con permiso denegado) y vuelve al rol normal:

```sql
BEGIN;
SET LOCAL ROLE anon;
SELECT count(*) FROM public.assessments;
ROLLBACK;
```

5. **Vercel → Project → Settings → Environment Variables** (Production y, si aplica, Preview):
   - `ADMIN_EMAILS` = el mismo correo del paso 1. Varios correos separados por coma.
   - `SUPABASE_SERVICE_ROLE_KEY` = Supabase → Project Settings → API Keys → `service_role` (secret) o la Secret key `sb_secret_...`. No la marques como pública y no le pongas prefijo `NEXT_PUBLIC_`.
   - Confirma que `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` ya existen.
6. **Redeploy** para que Vercel tome las variables nuevas.
7. Sin cookie, `GET /api/assessment` debe responder **401**. `/admin` debe redirigir a `/admin/login`. Un diagnóstico nuevo (sin login) debe seguir guardándose.

#### Ingreso con Google

El botón **Continuar con Google** usa Supabase Auth (`signInWithOAuth`, proveedor `google`) y el intercambio PKCE en `/auth/callback`. El correo de la cuenta de Google tiene que estar en `ADMIN_EMAILS`. Si no lo está, el callback cierra la sesión y muestra «Esta cuenta no tiene acceso de administrador». Esa cuenta no llega a `/admin` ni a `GET /api/assessment`. El correo y la contraseña siguen funcionando.

No hace falta una variable nueva en Vercel: el Client ID y el Client Secret viven solo en Supabase. Hay que redesplegar para publicar la ruta `/auth/callback`.

1. **Google Cloud Console → Google Auth Platform → Branding (pantalla de consentimiento).**
   - Tipo de usuario: **Internal** si el administrador usa Google Workspace de la empresa. Si no, **External**.
   - Si queda en estado **Testing**, agrega el correo del administrador en **Test users**. Sin eso Google rechaza el ingreso.
   - En **Data Access (Scopes)** deja `openid`, `.../auth/userinfo.email` y `.../auth/userinfo.profile`. No agregues scopes sensibles.
2. **Google Auth Platform → Clients → Create client → Web application.**
   - **Authorized JavaScript origins:** `https://plataforma-de-madurez.vercel.app` y, para desarrollo, `http://localhost:3000`.
   - **Authorized redirect URIs:** exactamente `https://<project-ref>.supabase.co/auth/v1/callback`. `<project-ref>` es el subdominio de `NEXT_PUBLIC_SUPABASE_URL` (también sale en Supabase → Authentication → Providers → Google). No pongas aquí la URL de Vercel.
   - Guarda el **Client ID** y el **Client Secret**.
3. **Supabase → Authentication → Providers → Google.** Actívalo y pega el Client ID y el Client Secret. No actives *Skip nonce check* (eso es para apps nativas).
4. **Supabase → Authentication → URL Configuration.**
   - **Site URL:** `https://plataforma-de-madurez.vercel.app`
   - **Redirect URLs:** `https://plataforma-de-madurez.vercel.app/auth/callback` y `http://localhost:3000/auth/callback`
5. **Sigue con el registro público desactivado** (Authentication → Providers → Email → **Allow new users to sign up** en off). Crea antes el usuario en **Authentication → Users → Add user** con el mismo correo de Google y **Auto Confirm User**. Ese correo va en `ADMIN_EMAILS`. Si Google responde que el registro está deshabilitado, falta ese usuario: no actives el registro público.
6. **Vercel:** no agregues el secreto de Google. Confirma `ADMIN_EMAILS`, `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`, y **Redeploy**.
7. Prueba: una cuenta de Google que no esté en la lista vuelve al login con el aviso y `GET /api/assessment` sigue en 401 o 403. La cuenta de la lista entra al panel. El formulario de correo y contraseña sigue en la misma pantalla.

### Base de Datos (Supabase)

La tabla `assessments` guarda cada diagnóstico, incluido nombre, correo y cargo de quien responde. El esquema en producción incluye además `selected_services`.

No des `SELECT` a `anon` ni a cualquier usuario autenticado: cualquiera con la clave anon (pública) podría saltarse `/api/assessment`. La política vigente está en la migración de arriba: inserción pública, sin lectura ni edición por la Data API. El panel lee con la service role.

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
│   ├── api/
│   │   ├── analyze/route.ts  # Análisis OpenAI + guardado del diagnóstico
│   │   ├── assessment/route.ts # Listado admin (requiere sesión)
│   │   └── auth/             # Login, logout y arranque de Google
│   └── auth/
│       └── callback/route.ts # Intercambio PKCE de Google + allowlist
├── components/
│   ├── diagnostic/           # Componentes del diagnóstico
│   └── results/              # Componentes del dashboard
├── data/
│   ├── questions-bim.ts      # Preguntas BIM
│   ├── questions-ia.ts       # Preguntas IA/RPA
│   ├── questions-plm.ts      # Preguntas PLM
│   └── sections.ts           # Metadatos de secciones
├── lib/
│   ├── admin-auth.ts         # Allowlist de admin y decisión de acceso
│   ├── scoring.ts            # Cálculo de scores
│   └── supabase/             # Sesión, cliente de cookies y service role
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
4. **Admin** (`/admin`) — Listado de diagnósticos. Requiere sesión de Supabase y correo en `ADMIN_EMAILS`

## 🛠️ Personalización

### Preguntas
Edita los archivos en `src/data/questions-*.ts` para personalizar las preguntas de cada servicio. Cada pregunta sigue la interfaz `Question` definida en `src/types/assessment.ts`.

### Colores
Modifica `tailwind.config.ts` para cambiar la paleta de colores.

### Análisis IA
El prompt del sistema se configura en `src/app/api/analyze/route.ts` y llama a OpenAI (`gpt-4o-mini`) con `OPENAI_API_KEY`.

## 📦 Build de Producción

```bash
npm run build
npm start
```

## 📄 Licencia

Proyecto privado — Ingeniería Asistida por Computador (IAC).

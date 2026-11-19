# DR DSLR

Photography portfolio + private CMS for **Himal Shrestha** -- *"Capturing Moments Beyond Vision"*.

A unified, code-free content management system and cinematic portfolio: upload high-resolution photos and video reels, curate albums and visual stories, manage inquiries and client reviews, and publish changes instantly to [himalstha.info.np](https://himalstha.info.np).

---

## 1. System Overview & Completed Features

- **Public Cinematic Showcase**:
  - Full-screen responsive hero slider with Cloudinary preloaded image presets and custom motion animations.
  - Interactive DSLR shutter control simulation with aperture, shutter speed, and ISO controls.
  - Curated masonry gallery with category filters, keyboard navigation, and full-screen accessible modal lightbox.
  - Dedicated dynamic detail pages for Albums (`/albums/[slug]`) and Visual Stories (`/stories/[slug]`).
  - Responsive client experience timeline with dual-mode desktop and mobile progress indicators and step nodes.
  - Synchronized navbar, footer, and contact components reflecting real-time administrative studio brand and WhatsApp routing settings.
  - Branded, accessible 404 Not Found error page with quick navigation back to the portfolio.
  - Contextual service iconography with intelligent category mapping and offline fallbacks.
  - Client inquiries and dynamic WhatsApp direct routing with international phone formatting.

- **Admin CMS (`/admin`)**:
  - Role-protected administrative dashboard backed by Supabase Auth with Row Level Security (RLS).
  - Responsive layout with desktop persistent sidebar and mobile slide-down drawer navigation.
  - Media Library with drag-and-drop batch upload, real-time progress indicators, slug generation, metadata editing, and safe deletion.
  - Direct Cloudinary upload with server-side HMAC-SHA1 signing and two-step verification (`/api/cloudinary/sign` & `/api/cloudinary/confirm`).
  - Full management of Albums, Visual Stories, Films, Categories, Client Inquiries, and Testimonials.
  - Real-time system health checks and database status diagnostics.

---

## 2. Technology Stack

- **Framework**: Next.js 16 (React 19 App Router)
- **Styling**: Tailwind CSS v4, Lucide Icons, Framer Motion
- **Database & Auth**: Supabase (PostgreSQL with Row Level Security & Auth)
- **Media Asset Storage**: Cloudinary (Direct unsigned/signed uploads, dynamic transformations, responsive srcset)
- **Validation**: Zod schema validation
- **Testing**: Node.js native test runner (`node --test`), TypeScript (`tsc --noEmit`), ESLint
- **Deployment**: Vercel (Edge & Serverless safe)

---

## 3. Getting Started

### Local Development Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Run the local development server
npm run dev
```

Visit `http://localhost:3000` to view the public site or `http://localhost:3000/admin` to access the CMS.

---

## 4. Environment Configuration

Ensure the following environment variables are configured in `.env.local` (and in Vercel project settings):

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Admin & Cron Security
CRON_SECRET="your-secure-cron-secret"
```

> **Security Note**: `SUPABASE_SERVICE_ROLE_KEY` and `CLOUDINARY_API_SECRET` are strictly server-only credentials guarded with the `server-only` package. They are never exposed to browser bundles.

---

## 5. Testing & Quality Assurance

The project includes an automated test suite executed via the native Node.js test runner:

```bash
# Run unit and integration tests (47 test cases)
npm test

# Run TypeScript type verification
npx tsc --noEmit

# Run ESLint checks
npm run lint

# Build production bundle
npm run build
```

### Test Suite Structure

- `tests/unit/admin-navigation.test.ts`: Category schema validation, UUID format verification, and fallback dataset integrity.
- `tests/unit/cloudinary-url.test.ts`: URL building, transformations, and responsive `srcset` generation.
- `tests/unit/contact-navbar.test.ts`: WhatsApp international routing, contact override null fallbacks, and navbar brand normalization.
- `tests/unit/footer-theme.test.ts`: Dynamic contact override merging, process step sequence validation, and social URL parsing.
- `tests/unit/media-validation.test.ts`: File type safety, size constraints, and payload schema validations.
- `tests/unit/services-social.test.ts`: WhatsApp URL resolution, international phone normalization, and service dataset integrity.
- `tests/unit/site-config.test.ts`: Site branding, navigation, social links, and Tailwind class merging utilities.
- `tests/unit/slug.test.ts`: Human-readable slug generation and character sanitization.
- `tests/integration/keep-alive.test.ts`: Automated Cloudinary connectivity and resource listing.
- `tests/integration/upload-flow.test.ts`: Direct upload signing verification and database media mapping.

---

## 6. Supabase Keep-Alive & Cloudinary Architecture

To ensure the free-tier Supabase database remains active without pausing due to inactivity:
- An automated keep-alive route is configured at `/api/cron/keep-alive`.
- The route executes a lightweight ping against the database and Cloudinary storage.
- If the database ever pauses during prolonged downtime, visit [supabase.com/dashboard](https://supabase.com/dashboard) and click **Resume project** to restore real-time syncing.

---

## 7. License & Credits

Created by **Himal Shrestha**. All photographs, media, and design assets are copyright © DR DSLR. All rights reserved.

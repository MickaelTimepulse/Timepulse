# CMS Timepulse - Wireframes Backoffice & CI/CD

## Backoffice Wireframes (Textual)

### 1. Dashboard Principal

```
┌──────────────────────────────────────────────────────────────────────┐
│ TIMEPULSE CMS                                    [user@timepulse.fr]│
├──────────────────────────────────────────────────────────────────────┤
│ [Dashboard] [Pages] [Médias] [Forms] [A/B Tests] [Audit] [Settings] │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  TABLEAU DE BORD                                                     │
│                                                                       │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐       │
│  │ Pages      │ │ En Review  │ │ Planifiées │ │ Publiées   │       │
│  │    24      │ │     3      │ │     2      │ │    19      │       │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘       │
│                                                                       │
│  ACTIVITÉ RÉCENTE                                                    │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ 🟢 Page "Chronométrage" publiée          il y a 2h  par Jean │  │
│  │ 🟡 Page "À propos" en review             il y a 3h  par Marie│  │
│  │ 🔵 Page "Services" créée                 il y a 5h  par Paul │  │
│  │ ⚪ A/B Test "Hero CTA" démarré           il y a 1j  par Jean │  │
│  │ 🟢 Page "Contact" mise à jour            il y a 2j  par Marie│  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  PAGES À VALIDER (3)                                                 │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ "Nos références" - soumis il y a 1h par Paul                  │  │
│  │ [Voir] [Approuver] [Rejeter]                                  │  │
│  ├───────────────────────────────────────────────────────────────┤  │
│  │ "Tarifs 2025" - soumis il y a 3h par Marie                    │  │
│  │ [Voir] [Approuver] [Rejeter]                                  │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  TESTS A/B EN COURS (1)                                              │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ "Hero CTA Wording" - 523 vues - CTR: 4.2% vs 5.1% ⬆          │  │
│  │ [Voir détails] [Arrêter]                                      │  │
│  └───────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

### 2. Liste des Pages

```
┌──────────────────────────────────────────────────────────────────────┐
│ PAGES                                                    [+ Nouvelle] │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Filtres: [Toutes ▾] [fr ▾] [Tous types ▾]     🔍 [Rechercher...]   │
│                                                                       │
│  ┌─────┬──────────────┬─────────┬────────┬───────────┬──────────┐   │
│  │Statut│ Titre       │  Type   │ Locale │ Modifié   │ Actions  │   │
│  ├─────┼──────────────┼─────────┼────────┼───────────┼──────────┤   │
│  │ 🟢  │Chronométrage │ PRODUCT │   fr   │ il y a 2h │ [✏][👁]│   │
│  │     │professionnel │         │        │ par Jean  │ [📋][🗑]│   │
│  ├─────┼──────────────┼─────────┼────────┼───────────┼──────────┤   │
│  │ 🟡  │À propos      │ ABOUT   │   fr   │ il y a 3h │ [✏][👁]│   │
│  │     │              │         │        │ par Marie │ [📋][🗑]│   │
│  ├─────┼──────────────┼─────────┼────────┼───────────┼──────────┤   │
│  │ 🔵  │Services      │ LANDING │   fr   │ il y a 5h │ [✏][👁]│   │
│  │     │              │         │        │ par Paul  │ [📋][🗑]│   │
│  ├─────┼──────────────┼─────────┼────────┼───────────┼──────────┤   │
│  │ ⏰  │Tarifs 2025   │ PRODUCT │   fr   │Planifié   │ [✏][👁]│   │
│  │     │              │         │        │15/10 08h  │ [📋][🗑]│   │
│  └─────┴──────────────┴─────────┴────────┴───────────┴──────────┘   │
│                                                                       │
│  Légende: 🟢 Publié | 🟡 Review | 🔵 Brouillon | ⏰ Planifié         │
│                                                                       │
│  Page 1 sur 3                                    [< Précédent] [>]   │
└──────────────────────────────────────────────────────────────────────┘
```

### 3. Éditeur de Blocs (Drag & Drop)

```
┌──────────────────────────────────────────────────────────────────────┐
│ ÉDITER: Chronométrage professionnel                    [Prévisualiser]│
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  [Contenu] [SEO] [Planification] [A/B Test]                         │
│                                                                       │
│  ┌──────────────────────┬──────────────────────────────────────────┐ │
│  │  BLOCS DISPONIBLES   │  CANVAS (Drag blocs ici)                │ │
│  ├──────────────────────┼──────────────────────────────────────────┤ │
│  │                      │                                          │ │
│  │  [+] Hero            │  ┌────────────────────────────────────┐ │ │
│  │  [+] Features        │  │ HERO BLOCK                      [⋮]│ │ │
│  │  [+] Pricing         │  │ Title: "Chronométrage..."          │ │ │
│  │  [+] Steps           │  │ CTA: "Demander un devis"           │ │ │
│  │  [+] Stats           │  │                               [✏️][🗑]│ │ │
│  │  [+] Logos           │  └────────────────────────────────────┘ │ │
│  │  [+] Media           │                                          │ │
│  │  [+] Case Teaser     │  ┌────────────────────────────────────┐ │ │
│  │  [+] CTA             │  │ FEATURES BLOCK                  [⋮]│ │ │
│  │  [+] FAQ             │  │ 3 colonnes • 6 features            │ │ │
│  │  [+] Rich Text       │  │                               [✏️][🗑]│ │ │
│  │  [+] Form            │  └────────────────────────────────────┘ │ │
│  │  [+] Map             │                                          │ │
│  │                      │  ┌────────────────────────────────────┐ │ │
│  │                      │  │ CTA BLOCK                       [⋮]│ │ │
│  │                      │  │ "Prêt à organiser?"                │ │ │
│  │                      │  │                               [✏️][🗑]│ │ │
│  │                      │  └────────────────────────────────────┘ │ │
│  │                      │                                          │ │
│  │                      │  [+ Ajouter un bloc]                    │ │
│  └──────────────────────┴──────────────────────────────────────────┘ │
│                                                                       │
│  [Enregistrer brouillon] [Soumettre à review] [Publier]             │
└──────────────────────────────────────────────────────────────────────┘
```

### 4. Panneau Props d'un Bloc (Hero)

```
┌──────────────────────────────────────────────────────────────────────┐
│ ÉDITER BLOC: HERO                                             [Fermer]│
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  VARIANT                                                             │
│  [x] Default  [ ] Split  [ ] Centered  [ ] Video                     │
│                                                                       │
│  EYEBROW (optionnel)                                                 │
│  [Chronométrage professionnel                                     ]  │
│                                                                       │
│  TITRE *                                                             │
│  [La précision au service de vos événements sportifs              ]  │
│  45/120 caractères                                                   │
│                                                                       │
│  SOUS-TITRE (optionnel)                                              │
│  [Depuis 2009, Timepulse accompagne les organisateurs...          ]  │
│  68/300 caractères                                                   │
│                                                                       │
│  IMAGE                                                               │
│  ┌──────────────────────┐                                            │
│  │  [Image preview]     │  [Choisir image]  [Supprimer]             │
│  │  runner-start.jpg    │                                            │
│  └──────────────────────┘                                            │
│  ALT: [Athlètes au départ d'une course                            ]  │
│                                                                       │
│  BOUTONS                                                             │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ Bouton 1: [Demander un devis        ] → [/contact          ] │   │
│  │ Variant: [Primary ▾]  Size: [MD ▾]                           │   │
│  │                                                      [Supprimer]│   │
│  └──────────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ Bouton 2: [Nos services             ] → [/services         ] │   │
│  │ Variant: [Outline ▾]  Size: [MD ▾]                           │   │
│  │                                                      [Supprimer]│   │
│  └──────────────────────────────────────────────────────────────┘   │
│  [+ Ajouter bouton] (max 3)                                          │
│                                                                       │
│  ANIMATION                                                           │
│  [Fade ▾]                                                            │
│                                                                       │
│  [Annuler]                                    [Enregistrer]          │
└──────────────────────────────────────────────────────────────────────┘
```

### 5. Panneau SEO

```
┌──────────────────────────────────────────────────────────────────────┐
│ ÉDITER: Chronométrage professionnel                                  │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  [Contenu] [SEO] [Planification] [A/B Test]                         │
│                                                                       │
│  META TITLE *                                                        │
│  [Chronométrage Professionnel - Précision & Fiabilité | Timepulse]  │
│  68/60 caractères ⚠️ Légèrement long                                 │
│                                                                       │
│  META DESCRIPTION *                                                  │
│  [Solutions de chronométrage électronique pour événements sportifs. │
│   Résultats en temps réel, précision garantie. +15 ans d'expérience]│
│  148/160 caractères ✅                                               │
│                                                                       │
│  CANONICAL URL                                                       │
│  [https://timepulse.fr/fr/chronometrage                           ]  │
│                                                                       │
│  IMAGE OPEN GRAPH                                                    │
│  ┌──────────────────────┐                                            │
│  │  [OG Image preview]  │  [Choisir]  [Supprimer]                   │
│  │  1200x630px          │                                            │
│  └──────────────────────┘                                            │
│                                                                       │
│  INDEXATION                                                          │
│  [ ] Bloquer l'indexation (noindex)                                 │
│                                                                       │
│  HREFLANG                                                            │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ fr: https://timepulse.fr/fr/chronometrage                     │   │
│  │ en: https://timepulse.fr/en/timing                            │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  JSON-LD (optionnel)                                                 │
│  [Éditer JSON-LD structuré]                                          │
│                                                                       │
│  APERÇU GOOGLE                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ Chronométrage Professionnel - Précision & Fiabilité | ...     │   │
│  │ https://timepulse.fr › chronometrage                          │   │
│  │ Solutions de chronométrage électronique pour événements...    │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  VALIDATION SEO: 1 avertissement                                     │
│  ⚠️ Titre dépasse 60 caractères (recommandé)                         │
│                                                                       │
│  [Enregistrer]                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

### 6. Panneau A/B Test

```
┌──────────────────────────────────────────────────────────────────────┐
│ TEST A/B: Hero CTA Wording                                  [Arrêter] │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  STATUT: 🟢 En cours depuis 24h                                      │
│                                                                       │
│  VARIANTES                                                           │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ Control (50%)                          Variant A (50%)        │   │
│  │ "Demander un devis"                    "Obtenir un devis..."  │   │
│  │                                                                │   │
│  │ 📊 Vues: 261                           📊 Vues: 262          │   │
│  │ 👆 Clics: 11                           👆 Clics: 13          │   │
│  │ ✉️ Conversions: 2                       ✉️ Conversions: 4    │   │
│  │                                                                │   │
│  │ 📈 CTR: 4.2%                           📈 CTR: 5.0% ⬆ +19%   │   │
│  │ 🎯 Conv Rate: 0.77%                    🎯 Conv Rate: 1.53% ⬆│   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  OBJECTIFS                                                           │
│  ✅ Clic sur CTA                                                     │
│  ✅ Soumission formulaire contact                                    │
│                                                                       │
│  RÈGLES D'ARRÊT                                                      │
│  Échantillon min: 500 vues (523/500 ✅)                              │
│  Seuil p-value: 0.05                                                 │
│  P-value actuel: 0.12 (non significatif)                             │
│                                                                       │
│  DURÉE                                                               │
│  Démarré: 13/10/2025 14:00                                           │
│  Estimé: ~2 jours restants pour atteindre significativité            │
│                                                                       │
│  ACTIONS                                                             │
│  [Arrêter le test]  [Déclarer Variant A gagnant]                    │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

### 7. Agenda de Publication (Europe/Paris TZ)

```
┌──────────────────────────────────────────────────────────────────────┐
│ PLANIFICATION                                         Fuseau: CET/CEST│
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  [Contenu] [SEO] [Planification] [A/B Test]                         │
│                                                                       │
│  STATUT ACTUEL: Brouillon                                            │
│                                                                       │
│  PLANIFIER LA PUBLICATION                                            │
│  [ ] Publier maintenant                                              │
│  [x] Planifier pour une date future                                  │
│                                                                       │
│  Date: [15/10/2025]   Heure: [08:00] CET                            │
│                                                                       │
│  DÉPUBLICATION AUTOMATIQUE (optionnel)                               │
│  [ ] Dépublier automatiquement                                       │
│  Date: [_________]   Heure: [____]                                   │
│                                                                       │
│  PROCHAINES PUBLICATIONS                                             │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ 15/10/2025 08:00  "Tarifs 2025"                              │   │
│  │ 16/10/2025 10:00  "Nouveaux services"                        │   │
│  │ 18/10/2025 14:00  "Case Study Marathon"                      │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ⚠️ La publication se déclenchera automatiquement via cron job.      │
│     Vous recevrez une notification par email.                        │
│                                                                       │
│  [Annuler]                              [Enregistrer planification]  │
└──────────────────────────────────────────────────────────────────────┘
```

### 8. Prévisualisation

```
┌──────────────────────────────────────────────────────────────────────┐
│ PRÉVISUALISATION: Chronométrage professionnel             [Quitter]  │
├──────────────────────────────────────────────────────────────────────┤
│ ⚠️ MODE PRÉVISUALISATION - Cette page n'est pas encore publiée       │
│                                                          [Partager lien]│
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  [🖥 Desktop] [💻 Tablet] [📱 Mobile]                                │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                                                                 │ │
│  │  ┌──────────────────────────────────────────────────────────┐ │ │
│  │  │ HERO SECTION                                              │ │ │
│  │  │                                                            │ │ │
│  │  │  Chronométrage professionnel                              │ │ │
│  │  │  La précision au service de vos événements sportifs       │ │ │
│  │  │                                                            │ │ │
│  │  │  [Demander un devis]  [Nos services]                      │ │ │
│  │  └──────────────────────────────────────────────────────────┘ │ │
│  │                                                                 │ │
│  │  ┌──────────────────────────────────────────────────────────┐ │ │
│  │  │ FEATURES SECTION                                          │ │ │
│  │  │                                                            │ │ │
│  │  │  [Icon] Chronométrage      [Icon] Inscriptions ...        │ │ │
│  │  └──────────────────────────────────────────────────────────┘ │ │
│  │                                                                 │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│  [< Retour à l'éditeur]                                              │
└──────────────────────────────────────────────────────────────────────┘
```

---

## CI/CD & Observabilité

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20.x'
  DATABASE_URL: ${{ secrets.DATABASE_URL }}

jobs:
  lint:
    name: Lint & Format
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Check formatting
        run: npm run format:check

  typecheck:
    name: TypeScript Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Generate Prisma Client
        run: npx prisma generate

      - name: Run TypeScript
        run: npm run typecheck

  test:
    name: Unit & Integration Tests
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: cms_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Generate Prisma Client
        run: npx prisma generate

      - name: Run migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/cms_test

      - name: Run tests
        run: npm test -- --coverage
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/cms_test

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          file: ./coverage/coverage-final.json

  build:
    name: Build Application
    runs-on: ubuntu-latest
    needs: [lint, typecheck, test]
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Generate Prisma Client
        run: npx prisma generate

      - name: Build Next.js
        run: npm run build

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build
          path: .next

  migrate:
    name: Database Migration
    runs-on: ubuntu-latest
    needs: [build]
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Generate Prisma Client
        run: npx prisma generate

      - name: Run migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.PRODUCTION_DATABASE_URL }}

  deploy:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: [migrate]
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Environment Variables

```bash
# .env.example
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/cms"

# Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# S3 Storage
S3_ENDPOINT="https://s3.amazonaws.com"
S3_BUCKET="timepulse-cms-media"
S3_ACCESS_KEY="your-access-key"
S3_SECRET_KEY="your-secret-key"

# Email
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="noreply@timepulse.fr"
SMTP_PASSWORD="your-smtp-password"

# CDN
CDN_URL="https://cdn.timepulse.fr"

# Cron
CRON_SECRET="your-cron-secret"

# Frontend
NEXT_PUBLIC_SITE_URL="https://timepulse.fr"

# Monitoring
OTEL_EXPORTER_OTLP_ENDPOINT="https://otel-collector.example.com"
SENTRY_DSN="https://xxx@sentry.io/xxx"
```

### Health Checks

```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const checks = {
    database: false,
    timestamp: new Date().toISOString(),
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch (error) {
    console.error('Database health check failed:', error);
  }

  const status = Object.values(checks).every(Boolean) ? 200 : 503;

  return NextResponse.json(
    {
      status: status === 200 ? 'healthy' : 'unhealthy',
      checks,
    },
    { status }
  );
}
```

### OpenTelemetry Setup

```typescript
// instrumentation.ts
import { registerOTel } from '@vercel/otel';

export function register() {
  registerOTel({
    serviceName: 'timepulse-cms',
    traceExporter: {
      url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
    },
  });
}
```

### Monitoring Dashboard (Pseudo)

```typescript
// lib/monitoring/metrics.ts
import { Counter, Histogram } from 'prom-client';

export const pagePublishCounter = new Counter({
  name: 'cms_page_publish_total',
  help: 'Total number of pages published',
  labelNames: ['locale', 'type'],
});

export const pagePublishDuration = new Histogram({
  name: 'cms_page_publish_duration_seconds',
  help: 'Duration of page publish operations',
  buckets: [0.1, 0.5, 1, 2, 5],
});

export const abTestEventCounter = new Counter({
  name: 'cms_abtest_event_total',
  help: 'Total A/B test events',
  labelNames: ['test_id', 'variant_id', 'event_type'],
});

export const apiRequestDuration = new Histogram({
  name: 'cms_api_request_duration_seconds',
  help: 'API request duration',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2],
});
```

### Log Format (JSON)

```json
{
  "timestamp": "2025-10-14T10:15:30.123Z",
  "level": "info",
  "service": "timepulse-cms",
  "trace_id": "abc123...",
  "span_id": "def456...",
  "user_id": "user_123",
  "action": "page.publish",
  "entity": "page:page_001",
  "duration_ms": 234,
  "message": "Page published successfully",
  "metadata": {
    "locale": "fr",
    "slug": "chronometrage",
    "invalidated_paths": ["/fr/chronometrage"]
  }
}
```

### Docker Compose (Local Dev)

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: cms
      POSTGRES_PASSWORD: cms
      POSTGRES_DB: cms_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  mailhog:
    image: mailhog/mailhog
    ports:
      - "1025:1025"
      - "8025:8025"

volumes:
  postgres_data:
```

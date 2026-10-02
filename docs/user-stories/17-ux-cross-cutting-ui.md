# Epic 17 — UX & Cross-Cutting UI

Product-wide UI concerns that apply to every page: theming, responsiveness, and
internationalization. All of it is **v1.0**: theme exists in the POC, responsiveness is expected of a rebuild, and
multi-language (i18n/Arabic) was pulled forward into v1.0 — it's cross-cutting and far cheaper
to design in from the start than to retrofit later. POC ref:
`frontend/hooks/useTheme.ts`, `frontend/app/settings`, `components/layout/Header.tsx`,
`app/layout.tsx`, `tailwind.config.ts`.

### NEX-17-01 — Light/dark theme switcher
**As a** user, **I want** to switch between light and dark themes, **so that** I can use the app
comfortably in different environments.
- **Type:** Replicate · **Priority:** P1 · **Version:** v1.0 · **POC ref:** `useTheme.ts` (zustand, toggles `.dark` on `<html>`), Header/Settings toggle · **Layer:** frontend
- **Acceptance criteria:**
  - Given the app, when I toggle the theme, then the whole UI switches between light and dark (Tailwind `dark:` variants) with no unstyled/broken elements in either mode.
  - Given both modes, when reviewed, then contrast meets a basic accessibility bar (WCAG AA text contrast).

### NEX-17-02 — Theme persists per user/device
**As a** user, **I want** my theme choice remembered, **so that** I don't reset it every visit.
- **Type:** Finish-work · **Priority:** P2 · **Version:** v1.0 · **POC ref:** `useTheme.ts` (currently in-memory only — resets on reload) · **Layer:** frontend
- **Acceptance criteria:**
  - Given I set a theme, when I reload or return later, then it is restored (persisted to localStorage and/or the user profile).
  - Given no prior choice, when I first load, then the default (or OS `prefers-color-scheme`) applies without a flash of the wrong theme.

### NEX-17-03 — Responsive layout
**As a** user on any device, **I want** the app to adapt to my screen, **so that** it's usable on
desktop, tablet, and phone.
- **Type:** New (baseline) · **Priority:** P1 · **Version:** v1.0 · **POC ref:** Tailwind breakpoints (partial, ~14 files) · **Layer:** frontend
- **Acceptance criteria:**
  - Given a phone, tablet, and desktop width, when I use every page, then layout reflows without horizontal scroll, overlap, or clipped content; tables/charts degrade gracefully (scroll/stack).
  - Given the nav/sidebar, when on a small screen, then it collapses to a mobile-appropriate pattern (drawer/hamburger).
  - **Note:** responsiveness is inconsistent in the POC — treat as a standard to apply across all pages, not a per-page afterthought.

### NEX-17-04 — Internationalization framework
**As a** developer, **I want** all UI text externalized behind an i18n layer, **so that** the app
can be translated without touching components.
- **Type:** New · **Priority:** P1 · **Version:** v1.0 · **POC ref:** none — `<html lang="en">` hardcoded, strings inline, `toLocaleString('en')` baked in · **Layer:** frontend
- **Acceptance criteria:**
  - Given the UI, when built, then user-facing strings come from message catalogs (an i18n library, e.g. next-intl), not hardcoded literals.
  - Given numbers, dates, and currency, when rendered, then they use the active locale (not a hardcoded `'en'`/`'en-SA'`).

### NEX-17-05 — Arabic language & RTL
**As an** Arabic-speaking ministry user, **I want** the interface in Arabic with correct
right-to-left layout, **so that** the product fits its primary audience.
- **Type:** New · **Priority:** P1 · **Version:** v1.0 · **POC ref:** none (copilot can already answer in Arabic — NEX-10-03) · **Layer:** frontend
- **Acceptance criteria:**
  - Given Arabic is selected, when any page renders, then all UI text is Arabic and the layout is RTL (`dir="rtl"`), including nav, tables, charts, and forms.
  - Given RTL, when reviewed, then icons/directional elements mirror correctly and nothing overlaps.

### NEX-17-06 — Language switcher
**As a** user, **I want** to switch between English and Arabic, **so that** I can work in my
preferred language.
- **Type:** New · **Priority:** P2 · **Version:** v1.0 · **POC ref:** none · **Layer:** frontend
- **Acceptance criteria:**
  - Given the switcher, when I change language, then the UI updates immediately (including direction) and the choice persists per user across sessions/devices.

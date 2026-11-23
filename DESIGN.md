# Prich Design System

## Direction

- **Personality:** premium, calm, credible, and creator-led.
- **Principle:** use editorial minimalism, strong type hierarchy, neutral surfaces, generous spacing, and restrained motion.
- **Distinctness:** keep Prich recognisable through its own typography, violet identity, mint highlights, marketplace components, and content patterns.
- **Product goal:** make pricing, reputation, campaign status, and the next required action immediately understandable.

## Visual Language

- Prefer warm, quiet surfaces over pure-white pages.
- Use typography and whitespace for hierarchy before adding colour or decoration.
- Keep one clear primary action per screen.
- Use thin borders and very light shadows; avoid glassmorphism, heavy gradients, and oversized shadows.
- Use authentic creator work and profile imagery. Avoid generic AI art as interface decoration.
- Use Lucide outline icons at a consistent `1.5px` stroke; never use emoji as interface icons.

## Typography

Prich uses **Manrope** as its primary family for a clean, modern, and approachable marketplace identity.

```css
--font-sans: "Manrope", "Segoe UI", Arial, sans-serif;
--font-mono: "JetBrains Mono", "SFMono-Regular", Consolas, monospace;
```

- Load only weights `400`, `500`, `600`, and `700`; use `font-display: swap`.
- Use `400` for body copy, `500` for controls, `600` for headings, and `700` only for compact emphasis.
- Use sentence case. Avoid all-caps except very short metadata labels.
- Keep long text between 60 and 75 characters per line.
- Use tabular figures for prices, analytics, dates, and counts.

| Token | Desktop | Mobile | Weight | Use |
|---|---:|---:|---:|---|
| `display` | 64/68px | 44/48px | 600 | Marketing hero only |
| `heading-1` | 48/52px | 36/40px | 600 | Page title |
| `heading-2` | 36/42px | 30/36px | 600 | Major section |
| `heading-3` | 28/34px | 24/30px | 600 | Card group or panel |
| `title` | 22/28px | 20/26px | 600 | Card and dialog title |
| `body-lg` | 18/28px | 18/28px | 400 | Introductory copy |
| `body` | 16/24px | 16/24px | 400 | Default text and inputs |
| `small` | 14/20px | 14/20px | 400/500 | Supporting text and controls |
| `caption` | 12/16px | 12/16px | 500 | Metadata only |

## Colour Tokens

Prich uses a restrained black, cream, and grey foundation with a recognisable violet identity and mint highlight.

```css
:root {
  --color-canvas: #F8F7F3;
  --color-surface: #FFFFFF;
  --color-surface-subtle: #F1EFE9;
  --color-ink: #17161C;
  --color-text: #34323A;
  --color-text-muted: #706D76;
  --color-border: #E2DFD8;
  --color-border-strong: #C9C5BC;

  --color-brand: #635BFF;
  --color-brand-hover: #5148E5;
  --color-brand-soft: #ECEAFF;
  --color-accent: #B9F4D0;

  --color-success: #167A4A;
  --color-success-soft: #E5F6ED;
  --color-warning: #9A5A08;
  --color-warning-soft: #FFF1D6;
  --color-danger: #B42318;
  --color-danger-soft: #FDE8E6;
  --color-info: #175CD3;
  --color-info-soft: #E8F1FF;
  --color-focus: #635BFF;
  --color-scrim: rgb(23 22 28 / 55%);
}
```

- The primary CTA uses `brand` with white text.
- Default text uses `ink` or `text`; never use muted text for essential information.
- Use mint only for highlights, creator-positive moments, or selected decorative areas—not primary buttons.
- Status colour must always be paired with text or an icon.
- Maintain WCAG AA contrast: `4.5:1` for normal text and `3:1` for large text and UI boundaries.

## Spacing and Layout

- Use a `4px` base grid: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96`.
- Page gutters: `20px` mobile, `32px` tablet, `48px` desktop, `64px` wide desktop.
- Maximum application content width: `1280px`; maximum reading width: `720px`.
- Breakpoints: `640px`, `768px`, `1024px`, `1280px`, and `1536px`.
- Section spacing: `48px` mobile and `80px` desktop.
- Cards normally use `20–24px` internal padding; compact rows use `12–16px`.
- Prefer a 12-column desktop grid and a single-column mobile layout.
- Never introduce horizontal page scrolling.

## Shape, Border, and Elevation

```css
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-pill: 999px;

--shadow-sm: 0 1px 2px rgb(23 22 28 / 6%);
--shadow-md: 0 10px 30px rgb(23 22 28 / 9%);
```

- Inputs and buttons: `10–12px` radius.
- Standard cards: `12px` radius; featured cards and dialogs: `16px`.
- Chips, filters, and avatars may be pill-shaped.
- Default cards use a `1px` border and no shadow. Add `shadow-sm` only when elevation communicates interaction.
- Modals use `shadow-md` over the scrim.

## Core Components

- **Primary button:** 44px minimum height, violet background, white label, 12px radius, 16px horizontal padding.
- **Secondary button:** white or transparent surface, ink label, 1px strong border.
- **Tertiary button:** text-only; use for low-priority actions.
- **Danger button:** reserved for destructive confirmation, never for ordinary cancellation.
- **Inputs:** visible label, 44px minimum height, surface background, border default, violet 2px focus ring, inline error and recovery text.
- **Creator cards:** image/avatar, creator name, verified state, niche, platform metrics, starting price, availability, and one clear action.
- **Campaign cards:** status, next action, deadline, parties, deliverable, and amount. Status must not rely on colour alone.
- **Chips:** use for niche, platform, and status; keep labels short and avoid dense chip clouds.
- **Tables:** use tabular numbers, quiet dividers, sticky headers when long, and a stacked-card alternative on mobile.
- **Empty states:** explain what is missing and provide one useful next action.
- **Skeletons:** match the final layout and appear when loading is expected to exceed 300ms.

## Interaction and Motion

- Fast feedback: `120ms`; standard transition: `180ms`; dialog or panel: `240ms`.
- Use `ease-out` for entrances and `ease-in` for exits.
- Animate only `opacity` and `transform`; do not animate layout dimensions.
- Hover may alter border, surface, or shadow but must not move surrounding content.
- Every interactive element needs visible hover, active, focus, disabled, loading, success, and error states where relevant.
- Respect `prefers-reduced-motion` and remove non-essential movement.
- Preserve scroll position, filters, and drafted form values when users navigate back.

## Accessibility and Responsive Rules

- Use semantic HTML before ARIA.
- All controls must work with keyboard and screen readers.
- Show a `2px` focus ring with at least `2px` offset; never remove focus without a replacement.
- Interactive targets must be at least `44x44px` with at least `8px` between adjacent targets.
- Inputs use persistent labels, not placeholder-only labels.
- Errors identify the cause and how to fix it, and focus moves to the first invalid field after submission.
- Images require meaningful alt text; decorative graphics use empty alt text.
- At `375px`, primary content must remain complete and operable without horizontal scrolling.
- Desktop sidebars collapse into a labelled mobile navigation pattern; do not mix sidebar and bottom navigation at the same hierarchy.

## Voice and Content

- Write directly and specifically: “Invite creator,” not “Get started.”
- Use “Brand” and “Creator” consistently.
- Prefer short labels and calm language; avoid hype, slang, and unexplained marketplace jargon.
- Show exact prices, fees, dates, approval states, and payout conditions.
- Confirmation messages describe what happened and the next step.
- Destructive confirmations name the affected object and whether recovery is possible.

## Guardrails

- Do not reproduce another product's logo, custom fonts, signature graphics, brand colours, or page compositions.
- Do not use arbitrary hex values inside components; consume semantic tokens.
- Do not use gradients on routine application surfaces.
- Do not place more than one visually dominant CTA in a view.
- Do not hide essential actions behind hover-only interactions.
- Do not use font sizes below `12px`.
- Do not sacrifice clarity for decorative minimalism.

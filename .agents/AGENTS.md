# LOGIQUE Warehouse Management System - Project Guidelines & Rules

## Design System & Corporate Theme Standard
All frontend pages, components, and UI elements in this repository MUST strictly follow the official LOGIQUE Digital corporate brand identity:

### 🎨 Color Palette & Design Tokens
- **LOGIQUE Primary Yellow (`#FFD100`)**:
  - Tailwind class / token: `logique-yellow` (`#FFD100`)
  - Usage: Primary CTA Buttons (`+ Tambah Item`, `Submit`), brand logo accent, active tab indicators, primary focus rings.
  - Hover state: `logique-hover` (`#E6BC00`)

- **LOGIQUE Deep Navy (`#0B132B`)**:
  - Tailwind class / token: `logique-navy` (`#0B132B`)
  - Usage: Main application page background, top navigation header bar.

- **LOGIQUE Card Dark (`#162238`)**:
  - Tailwind class / token: `logique-card` (`#162238`)
  - Usage: Data tables, form containers, modal popups, floating cards. Border style: `border-slate-700/60`.

### 🟢 Stock Indicator Badges
- **Safe Stock (> 20 units)**: Emerald Green (`bg-emerald-500/10 text-emerald-400 border-emerald-500/30`)
- **Low Stock (1 - 20 units)**: LOGIQUE Yellow (`bg-yellow-500/10 text-yellow-400 border-yellow-500/30`)
- **Out of Stock (0 units)**: Rose Red (`bg-rose-500/10 text-rose-400 border-rose-500/30`)

### General Rules
- Always maintain clean, modular TypeScript code with strict interfaces.
- Always implement loading skeletons and toast feedback.

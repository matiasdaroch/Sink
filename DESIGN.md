---
version: alpha
name: Sink
description: Semantic design tokens and component guidance for the Sink interface, branded for MIK Architecture.
colors:
  card: "#f7f5f1"
  card-foreground: "#221f1f"
  popover: "#f7f5f1"
  popover-foreground: "#221f1f"
  primary: "#46736e"
  primary-foreground: "#ffffff"
  secondary: "#eeebe5"
  secondary-foreground: "#221f1f"
  muted: "#eeebe5"
  muted-foreground: "#3f413e"
  accent: "#e1efec"
  accent-foreground: "#221f1f"
  success: "#46736e"
  success-foreground: "#ffffff"
  destructive: "#d92d20"
  border: "#e0dcd4"
  input: "#e0dcd4"
  ring: "#46736e"
  chart-1: "#46736e"
  chart-2: "#038c7f"
  chart-3: "#a9d9d0"
  chart-4: "#3f413e"
  chart-5: "#9c9a94"
  sidebar: "#eeebe5"
  sidebar-foreground: "#221f1f"
  sidebar-primary: "#46736e"
  sidebar-primary-foreground: "#ffffff"
  sidebar-accent: "#e1efec"
  sidebar-accent-foreground: "#221f1f"
  sidebar-border: "#e0dcd4"
  sidebar-ring: "#46736e"
  background: "#f7f5f1"
  foreground: "#221f1f"
  dark-background: "#221f1f"
  dark-foreground: "#ffffff"
  dark-card: "#2c2929"
  dark-card-foreground: "#ffffff"
  dark-popover: "#2c2929"
  dark-popover-foreground: "#ffffff"
  dark-primary: "#46736e"
  dark-primary-foreground: "#ffffff"
  dark-secondary: "#2c2929"
  dark-secondary-foreground: "#ffffff"
  dark-muted: "#2c2929"
  dark-muted-foreground: "#ddeeea"
  dark-accent: "#2f4744"
  dark-accent-foreground: "#ffffff"
  dark-success: "#a9d9d0"
  dark-success-foreground: "#221f1f"
  dark-destructive: "#ff6b5b"
  dark-border: "#3f413e"
  dark-input: "#4a4c49"
  dark-ring: "#a9d9d0"
  dark-chart-1: "#a9d9d0"
  dark-chart-2: "#038c7f"
  dark-chart-3: "#46736e"
  dark-chart-4: "#ddeeea"
  dark-chart-5: "#7c8a87"
  dark-sidebar: "#1a1818"
  dark-sidebar-foreground: "#ffffff"
  dark-sidebar-primary: "#a9d9d0"
  dark-sidebar-primary-foreground: "#221f1f"
  dark-sidebar-accent: "#2f4744"
  dark-sidebar-accent-foreground: "#ffffff"
  dark-sidebar-border: "#3f413e"
  dark-sidebar-ring: "#a9d9d0"
typography:
  sans:
    fontFamily: "Mulish, sans-serif"
  heading:
    fontFamily: "Catamaran, sans-serif"
    fontWeight: 600
rounded:
  base: 2px
  lg: 2px
components:
  button-default:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.secondary-foreground}"
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.card-foreground}"
  popover:
    backgroundColor: "{colors.popover}"
    textColor: "{colors.popover-foreground}"
  sidebar:
    backgroundColor: "{colors.sidebar}"
    textColor: "{colors.sidebar-foreground}"
---

## Overview

This file is a derived summary for design-aware agents. If it conflicts with `app/assets/css/tailwind.css` or a component under `app/components/ui/**`, the CSS and UI component implementation are authoritative.

## Colors

The unprefixed tokens reproduce the semantic roles in `:root`; `dark-*` tokens flatten the corresponding `.dark` values. Always use roles as intended and keep each background paired with its foreground. The palette follows the MIK Architecture design system: `paper` (#f7f5f1) grounds, `mik-black` (#221f1f) ink, `mik-gray` (#3f413e) secondary text, `mik-green-dark` (#46736e) for primary actions and focus, and `green-mist` (#e1efec) for hover and selection. The same mapping is used by meet.mikarch.com. `chart-1` through `chart-5` draw from the MIK palette and are for charts only. Use `success` for positive status and completion indicators, `ring` for focus emphasis, and `destructive` for destructive or invalid states, including their dark-mode counterparts.

## Typography

Use Mulish for interface text and Catamaran Semibold (600) for headings, titles and table headers, as the MIK Architecture design system sets them. The sidebar and public header carry the text-only MIK ARCHITECTURE lockup from `app/components/MikLockup.vue`. Components choose font size, weight, and line height with local utilities; this file does not define a global type scale.

## Layout

The repository does not define a global grid, container, breakpoint, or spacing scale. Follow adjacent implementations when composing screens. Sidebar widths and responsive behavior belong to the sidebar component and are not global layout tokens.

## Elevation & Depth

Base surfaces establish depth with semantic backgrounds, borders, and rings. Shadows are switched off: every `--shadow-*` step resolves to none, so dialogs and floating content rely on their overlays, borders and rings.

## Shapes

The base radius is `2px`, and every step of the radius scale (`xs` through `4xl`) resolves to it, so corners are square everywhere. `rounded-full` stays round for avatars, switches and status dots.

## Components

- Buttons provide default, outline, secondary, ghost, destructive, and link variants, multiple text and icon sizes, focus/invalid rings, active movement, and disabled treatment.
- Inputs and select triggers use input surfaces and borders with placeholder, hover where implemented, focus, invalid, and disabled states; select content uses popover colors and floating-content treatment.
- Cards pair card background and foreground colors, use a subtle ring, and provide default and small density variants. Use small density for repeated dashboard collections and default density for standalone sections, forms, and empty states.
- Standard dialogs use popover colors, an overlay, open/closed motion, and a subtle ring. The scrollable dialog variant instead uses the background role, a border, and a local shadow; other floating content follows its own implementation.
- Tabs provide default filled and line variants with active, hover, focus, disabled, horizontal, and vertical states. When a horizontal list does not fit, scrolling belongs to an outer wrapper, focus-ring clearance is preserved, and the active trigger remains visible.
- The sidebar uses its dedicated background, foreground, accent, border, and ring roles across responsive, collapsible, floating, and inset variants. Primary navigation uses the default square shape in every state. Secondary utilities are compact icon-only controls and rely on native collapsed behavior. Sidebar primary roles are defined but are not currently consumed by these components.

Components expose stable `data-slot` attributes for composition and styling. Reuse the existing UI components and their variants; do not hand-edit generated components under `app/components/ui/**`.

## Interaction

- Mobile keeps registry control sizes by default and uses larger official variants only when context needs a larger touch target.
- Use menus for compact contextual action lists and popovers for richer anchored content.
- When an overlay opens another, focus moves directly into the new surface and returns to the initiating control when the flow ends.

## Do's and Don'ts

**Do** use semantic colors, preserve background/foreground pairings in both themes, reuse existing components, and keep hover, focus, active, invalid, expanded, and disabled states consistent with nearby implementations.

**Don't** invent tokens, promote generated utility choices to global tokens, or hand-edit `app/components/ui/**`.

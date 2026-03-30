# Design System Specification: The Architectural Service

## 1. Overview & Creative North Star: "The Digital Maître D’"
This design system moves away from the "grid of boxes" common in SaaS and toward a high-end, editorial experience. We are building **The Digital Maître D’**: a system that is authoritative yet invisible, efficient but deeply sophisticated. 

The aesthetic strategy breaks the template-look by utilizing **Intentional Asymmetry** and **Tonal Depth**. We replace rigid, 1px-bordered containers with a layered "paper-on-glass" philosophy. By overlapping elements and utilizing extreme shifts in typography scale, we create a sense of architectural space that feels premium, modern, and trustworthy.

## 2. Colors & Surface Philosophy
We do not use color merely for decoration; we use it to define the physics of our interface.

### The Palette
- **Primary Focus:** `primary` (#003fb1) for high-impact actions and `primary_container` (#1a56db) for brand-heavy anchors.
- **The Neutrals:** We utilize a sophisticated range of `surface` tokens (from `lowest` to `highest`) to create hierarchy without visual clutter.
- **Accents:** `tertiary` (#852b00) is used sparingly for "Chef’s Specials" or high-priority alerts to contrast the deep blues.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to define sections. Layout boundaries must be established via:
1.  **Background Color Shifts:** A `surface_container_low` (#f3f4f6) section sitting atop a `surface` (#f8f9fb) base.
2.  **Structural Negative Space:** Using the `12` (3rem) or `16` (4rem) spacing tokens to create mental groupings.

### The "Glass & Gradient" Rule
To elevate the platform above "standard" SaaS, floating elements (Modals, Popovers, Flyouts) should utilize **Glassmorphism**.
*   **Formula:** `surface_container_lowest` (#ffffff) at 80% opacity + `backdrop-blur` (12px).
*   **Signature Textures:** For Hero sections or primary Dashboards, use a subtle linear gradient from `primary` to `primary_container` (135° angle). This adds "soul" and depth that flat hex codes lack.

## 3. Typography: Editorial Authority
We pair the utilitarian **Inter** with the structural elegance of **Manrope** to create a high-contrast hierarchy.

| Level | Font | Size | Weight/Usage |
| :--- | :--- | :--- | :--- |
| **Display-LG** | Manrope | 3.5rem | Bold; reserved for hero analytics or "Big Numbers." |
| **Headline-MD** | Manrope | 1.75rem | Medium; used for section headers. |
| **Title-LG** | Inter | 1.375rem | Semi-bold; for card titles and prominent labels. |
| **Body-MD** | Inter | 0.875rem | Regular; the workhorse for all management data. |
| **Label-SM** | Inter | 0.6875rem | Medium; Uppercase with 0.05em tracking for metadata. |

**Editorial Strategy:** Use `display-lg` and `body-sm` in close proximity. This high-contrast pairing mimics high-end menus and architectural journals, conveying "Efficiency through Sophistication."

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are too "heavy" for a modern restaurant platform. We achieve lift through the **Layering Principle**.

*   **Surface Nesting:** Instead of shadows, place a `surface_container_highest` (#e1e2e4) element inside a `surface_container_low` (#f3f4f6) wrapper to create a "recessed" effect.
*   **Ambient Shadows:** If an element must float (e.g., a "New Order" toast), use an extra-diffused shadow: `box-shadow: 0 20px 40px rgba(25, 28, 30, 0.06);`. The shadow color is a tint of `on_surface`, not pure black.
*   **The "Ghost Border":** For accessibility in input fields, use `outline_variant` (#c3c5d7) at **20% opacity**. It should be felt, not seen.

## 5. Components: Refined Primitives

### Buttons & Interaction
*   **Primary:** `primary` background with `on_primary` text. Use `md` (0.375rem) corners. Add a subtle 1px inner-glow (top-down) for a tactile, "pressed" feel.
*   **Secondary:** `surface_container_high` background. No border. This creates a "soft button" that feels integrated into the UI.

### Cards & Menu Items
*   **Constraint:** Absolute prohibition of divider lines (`<hr>`).
*   **Implementation:** Separate items in a list using the `4` (1rem) spacing token. Group related items within a `surface_container_low` wrapper.
*   **QR Code Holders:** Should use the "Glassmorphism" rule. Semi-transparent backgrounds allow the restaurant's brand photography to bleed through subtly.

### Input Fields
*   **State Management:** Active states should move from `outline` to `primary` without changing the stroke width. 
*   **Error States:** Use `error` (#ba1a1a) text only. The container should use a `error_container` (#ffdad6) background at 30% opacity to highlight the field without "shouting."

### Industry-Specific Components
*   **Live Status Chips:** Use `secondary_container` with `on_secondary_container` for "In Progress" orders. Use the "Ghost Border" to define the edge.
*   **Table Occupancy Grid:** Use a non-linear grid. Vary the size of table cards slightly to mimic a real floor plan, avoiding the "Excel Spreadsheet" look.

## 6. Do’s and Don’ts

### Do
*   **Do** use asymmetrical margins. If the left margin is `16`, try a right margin of `12` for editorial dashboards.
*   **Do** prioritize "Breathing Room." If you think a section needs more space, use the next size up in the spacing scale.
*   **Do** use `surface_tint` for subtle hover states on interactive surfaces.

### Don't
*   **Don't** use 100% black text. Always use `on_surface` (#191c1e) for better readability and a premium feel.
*   **Don't** use standard "drop shadows" on cards. Use Tonal Layering (Surface shifts) instead.
*   **Don't** use sharp 0px corners. Every element must adhere to the `md` (0.375rem) or `lg` (0.5rem) roundedness scale to maintain the "Soft Modern" personality.
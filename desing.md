# Terviora — current design direction

Status: implemented. This revision supersedes the first proposal and follows the user's request to match the supplied reference screenshots closely and replace traditional-looking architecture with distinctly modern buildings.

## Design Direction

- Concept: the reference website's restrained architectural presentation, adapted to Terviora and contemporary Kerala.
- The supplied logo artwork sets the palette. Navy `#001743` anchors the navigation, trust section and footer. Blue `#0355C1` marks primary actions, cyan `#47DEFD` highlights navigation and secondary accents, and silver `#F7F7F9` provides contrast on navy. Pale blue surfaces frame the architectural photography.
- The transparent SVG lockup traces the supplied architectural mark and both lines of the Terviora Estates name. Manrope continues across page text and controls, with regular headings and tight tracking.
- The navigation, hero copy and search share a centered grid capped at 1280 px. On desktop and tablet, the hero video spans the full initial screen under a black overlay, with search layered over the lower foreground. Phones use a shorter hero followed by a separate search panel.
- Interaction: custom styled comboboxes throughout the page, functional search and filters, local shortlist, detail dialogs, process selector with restrained image transition, and native FAQ disclosures. Respect reduced motion.
- Authorization: the user explicitly requested this rework. No new approval is needed to carry out the stated reference match.

## Reference mapping

1. **151502 — hero:** compact navigation, two-line headline left, small supporting copy right, a solid high-contrast Explore properties button, and a full-width video with a black overlay behind the headline.
2. **151539 — search and inventory:** quiet underlined tabs, visible field labels, and four fields separated by fine dividers in one pale surface. The white panel overlaps the hero and leads into equal white listing cards. The hero action scrolls to the search tabs.
3. **151607 — process:** narrow white text panel at left, much larger modern house image at right, short selector labels at the bottom of the panel, and a small illustrative floor-plan card over the image. The floor plan is labeled as a concept, not a listing's actual plan.
4. **151644 — owner/footer:** white owner CTA with left-aligned headline and compact actions; two overlapping images on the right. Follow with restrained footer typography and plain navigation. Do not copy unsupported review scores or contact details.
5. **154448 — atmosphere:** tropical setting is retained, but the new user instruction explicitly excludes traditional architectural styling.

The screenshots guide composition and proportions. Text length, Terviora branding, responsive behavior, functioning search, and sample-content labels remain specific to this project. The additional originally requested sections retain the same quieter visual language.

## Architecture and photography

Use the current `assets/images/modern-*.webp` set for listing imagery. The hero uses the supplied `assets/videos/hero-section-video.mp4` with a poster frame from the clip. Prompts and provenance are in `assets/images/HERO-FULLSCREEN-PROMPTS.md`. The built-in image-generation tool produced these concepts:

- `modern-hero`: charcoal cantilevered villa, panoramic glazing, slim bronze fascia, and clean sky for the headline.
- `hero-landscape-v2` and `hero-portrait-v2`: coordinated modern villa compositions with pale sky for copy and continuous foreground behind search. The older panorama remains archived and is no longer used in the page.
- `modern-villa`: white cubist villa, a dramatic cantilever, black glazing, and a clean stair.
- `modern-house`: grey stone and glass residence with a flat roof and reflective courtyard.
- `modern-apartment`: white horizontal balcony slabs and frameless glass balustrades.
- `modern-office`: pale concrete and dark glazing with restrained planting.
- `modern-land`: clean residential plot, white boundary wall, palms, and contemporary neighbours.
- `modern-interior`: double-height minimalist living room, pale stone, glass walls, and a floating stair.

Kerala is conveyed through plausible tropical surroundings and site context. Avoid tiled/sloping roofs, traditional verandas, rustic laterite, cane furniture, heritage styling, and yellow/golden grading. Keep soft neutral daylight, clean materials, and consistent image quality.

The images are generated concepts, not photographs of real available properties. Each listing is marked as sample content. Original prompts and provenance are in `assets/images/MODERN-PROMPTS.md`. Older concept files are retained but are not used by the website.

## Content and behavior

Retained sections: navigation, hero, search, featured/new listings, property categories, latest listings with Buy/Rent toggle, locations, trust information, process, owner CTA, alert preview, FAQ, and footer. Social proof, projects, partners, and guides remain conditional on genuine source content.

The future data contract continues to separate `listing_type` (`sale` or `rent`) from `property_type`. Commercial is a browsing category with a sale/rent selector; land is sale-only in this preview.

Search supports location, property type, minimum/maximum budget, area, bedrooms, furnishing, and owner/agent. The compact area dropdown and advanced area field stay synchronized. Query parameters restore results. Shortlists persist locally when storage is available. Latest-listing toggles remain independent from the main search.

Login, posting, visits, and alerts are not connected to a backend. Their actions explain the current boundary without reporting fake success. No invented verification badges, platform totals, testimonials, or partner endorsements are used.

## Implementation

- Plain HTML, CSS, and JavaScript; no runtime framework or build dependency.
- `styles/tokens.css`: fonts and raw design tokens, including reference-specific dimensions.
- `styles/main.css`: base components, interactions, responsive foundations, and accessibility.
- `styles/reference.css`: the current reference-led composition and responsive adaptations.
- `scripts/data.js`: illustrative property data.
- `scripts/main.js`: interactions and state.
- `scripts/choices.js`: native-select-free choice controls with keyboard navigation, typeahead, viewport-aware option panels, selected states, reset, and required-choice validation.
- `assets/brand/`: vector logos and illustrative plan.
- `assets/images/`: optimized local WebP images at 640, 1280, and 1536 px.

## Responsive and review requirements

At widths of 768 px and above, the hero section and its photograph each occupy exactly 100svh. Search shares the same grid cell, aligned to the bottom with a 24 px desktop or 16 px phone inset. The complete panel overlays the image; no separate background strip is reserved beneath the photo. Photo framing responds to aspect ratio so the villa is prominent and unused sky is reduced. Below 768 px, the hero uses its content height plus a 200–300 px full-width landscape photo. Search sits outside the hero with a 16 px gap and expands in normal flow. Mobile uses two-column fields and a full-width search action. The supporting paragraph remains visible at every phone height. On phones the order is eyebrow, headline, supporting copy, solid action, then photograph. Opening advanced filters or displaying a validation error allows the section to expand naturally. Desktop and tablet keep the default view within one screen. Mobile search follows the compact hero in normal flow.

At desktop widths, align the navigation, copy, search, and listings to the shared grid. At mobile widths, use stacked copy, two-column search fields, larger touch targets, single-column featured cards, and a stacked process section.

Review at 1440 × 1000, 962 × 718 (reference comparison), 768 × 1024, 390 × 844, and 320 × 812. Capture the hero, search/listings, process, and owner compositions. Test overflow, search, budget validation, quick area, URL restoration, shortlist, dialogs, keyboard tabs, FAQ, and reduced motion. Record observed limitations rather than claiming pixel-perfect equivalence.

Run `npm start` for the local preview and `npm run check` for static checks. Browser checks and screenshots are in `qa/`.

## Current reference typography refinement

The hero uses the reference-inspired sans-serif scale, a small tracked eyebrow, and a solid blue action with a clear arrow. The coordinated Kerala imagery sits against cool, light surfaces. Selected filters and dropdown options use pale blue and cyan tints. Palette, sizing, and motion values live in the token layer.

All nine dropdowns use the same custom choice control, including advanced filters and property alerts. Options open above or below the trigger according to available space. Arrow keys, Home/End, Enter/Space, typeahead, Escape, Tab, and outside dismissal are supported. No HTML select elements remain.

## Hero sky clearance

Desktop and landscape tablets now use `hero-sky-v3-*`, a modestly zoomed-out view with additional sky and a lower roofline. The landscape focal position is centered at 35% vertically to preserve room behind text on wide screens. Phones retain their separate text/image layout; portrait tablets retain the portrait asset. Prompt and provenance are in `assets/images/HERO-FULLSCREEN-PROMPTS.md`.

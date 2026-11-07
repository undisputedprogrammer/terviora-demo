# Reference-led redesign review

## Full-bleed panorama and search

Reviewed the desktop and mobile hero captures. The full-width image and sky mask remove the inset photo frame. The charcoal villa, foliage, and driveway stay in view, and the search panel meets the foreground. The wordmark and headline share Space Grotesk. The smaller subtext and neutral palette keep the focus on the architecture. The layout uses shared tokens and adds no animation.

At 1900 px, the hero image spans 0 to 1900 px, and the navigation, headline and search panel all start at 310 px. The search panel overlaps the image by 56 px. The hero link scrolls to the search tabs. Static checks and the existing desktop and mobile browser suite passed, including search filters and reduced motion.

## Full hero image

Reviewed the updated desktop and phone captures. The full source frame is visible at its original aspect ratio, including the villa's ground floor and driveway. Centered side margins preserve the compact desktop height, and the phone layout follows the height of the copy and photo. The reference typography and restrained palette still read clearly over the sky. The layout uses shared tokens and introduces no motion. Browser captures showed no horizontal overflow at widths of 320, 390, 768, 962, and 1440 px. Static checks passed.

## Latest refinement: compact hero

Reduced the hero from 960 to approximately 691 px at desktop width 1440, and from 820 to 620 px on phones. Reduced headline size, top padding, and CTA spacing, and adjusted the image crop. Captured `compact-desktop.png`, `compact-mobile.png`, `compact-reference.png`, `compact-tablet.png`, and `compact-narrow.png` at 1440, 390, 962, 768, and 320 px widths. Inspected desktop, mobile, and tablet screenshots: headline and supporting copy stay clear, the modern architecture remains legible, and the search section enters view sooner. No horizontal overflow at any captured width. Typography, flat palette, token usage, and reduced-motion behavior are preserved. Static checks passed; interaction tests were not repeated for this CSS-only adjustment. Earlier full-page captures predate this height refinement.

This review supersedes the first implementation review. The user requested the actual reference compositions and strictly modern architecture.

## What changed

- Full-width hero photograph with open sky behind a black two-line headline, small supporting copy, and a compact black CTA. The hero no longer contains the search panel.
- Desktop content follows the reference's roughly 72% width. Search sits below the hero with grey tabs, a white panel, four outlined fields, and bottom-row actions.
- Equal three-column listing cards replace the asymmetric collection. White card bodies place names and prices together, followed by locality and facts.
- Process section uses a narrow white panel, selector labels near its bottom, a large modern villa photograph, and a labeled illustrative plan overlay.
- White owner CTA with overlapping exterior/interior images replaces the navy banner.
- Removed blue headline emphasis, numbered section eyebrows, and other invented decorative patterns.
- Replaced every visible property image with the new modern set. No traditional roofs, verandas, rustic laterite, or cane details remain in active imagery or descriptions.

## Screenshot comparison

Inspected `reference-hero.png`, `reference-search.png`, `reference-process.png`, and `reference-owner.png` at 962 × 718, near the supplied screenshots' dimensions. Compared headline position, content alignment, search density, card geometry, process column proportions, and overlapping owner photographs.

The hero's roofline and headline are substantially closer to the reference. The supporting copy clears the building. Search and listings use the compact reference rhythm. The process panel and architectural image reproduce the reference's narrow/wide relationship. The owner section follows its white split-panel composition.

The page retains Terviora's logo, sample labels, functioning controls, and the additional requested discovery sections. It is not represented as a pixel-identical copy of the source page.

## AGENTS.md critique

- **Typography:** locally loaded Space Grotesk and Manrope; no prohibited font stack. Large black headings follow the reference's scale.
- **Palette and patterns:** flat white/pale grey/black UI, with blue retained in the logo and focus/selected accents. No gradients. Real-estate listing cards follow the reference's equal columns rather than a generic SaaS feature grid.
- **Direction:** the user's explicit instruction to rework the design supplied authorization; the revised Design Direction was stated before edits.
- **Tokens:** both component stylesheets are included in static token checks. Raw palette and layout values reside in the central token file.
- **Motion:** subtle hover and process-image transitions retain defined easing and reduced-motion support. No autoplay or ornamental scrolling effects.
- **Composition:** intentional asymmetry remains in the hero and process sections; listing columns are deliberately equal to honor the latest reference-matching request.
- **Imagery:** seven coordinated modern concepts, with flat roofs, cantilevers, concrete, glazing, neutral daylight, and Kerala tropical planting. Images remain clearly illustrative.
- **Responsive review:** desktop, tablet, 390 px phone, and 320 px phone screenshots captured. No horizontal overflow. Mobile keeps larger controls, stacked featured cards, and a large architectural hero image.

## Verification

- `npm run check`: passed JavaScript syntax, local asset/anchor references, unique static IDs, and color/spacing token checks in both `main.css` and `reference.css`.
- `scripts/browser-check.cjs`: passed at 1440 × 1000, 768 × 1024, 390 × 844, and 320 × 812, including filters, validation, no-results states, shortlist persistence, property dialogs, latest toggle, process keyboard navigation, FAQ, alert/posting boundaries, and reduced motion. No browser errors or failed HTTP responses.
- `scripts/capture-reference.cjs`: captured reference-width hero, search, process, and owner sections; tested the new quick-area dropdown successfully.
- Active HTML/JS/data contain no references to the superseded image set or traditional material/roof descriptions.

Remaining limitations are unchanged: sample inventory and generated concept imagery, with no live backend, account, posting, visit, or email service. The design requires genuine inventory and policies before launch. Full screen-reader and physical-device testing are not claimed.

## One-screen hero refinement — 2026-11-07

The hero, navigation, and complete search now share one 100svh opening composition. The closer villa image replaces the distant view on phones and taller desktops. Wide screens use a 170% framing of the panorama, retaining both storeys while bringing the house forward. The image remains full-bleed, with a masked top edge. Foreground is intentionally covered by the overlapping search panel.

Search uses visible uppercase labels, quiet underlined tabs, fine dividers, a subtly rounded white panel, and a clear black search action. Phones have two columns of fields and a full-width action. The shared container aligns copy, navigation, and search. Space Grotesk and Manrope, monochrome palette, design tokens, restrained transitions, and reduced-motion handling remain intact. No new image assets or dependencies were added.

Inspected desktop, wide desktop, laptop, tablet, phone, and short-phone screenshots. The house is substantially larger than in the previous panorama treatment. The narrow mobile framing trims the photo sides; the search intentionally covers foreground. The wide panorama is enlarged and softer than the closer source, a remaining asset-quality limitation for future final photography.

The dedicated hero check verifies the exact initial viewport height, full-width photo, search overlap, complete visible search controls, and lack of horizontal scrolling at 1440×1000, 1900×960, 1366×768, 768×1024, 390×844, 375×667, and 320×812. The existing interaction suite passed search, validation, URL restore, shortlist, dialogs, menu, and reduced-motion checks. Advanced filters and validation errors can extend beyond the opening screen to keep their contents usable.

## Full-height photo and restored branding — 2026-11-07

This revision supersedes the preceding one-screen arrangement. Both `.hero` and its photo are now exactly 100svh. Search occupies the same grid cell and overlays the lower image, with every primary field and action visible on first load. The background no longer stops above the bottom of the search panel. The supplied blue Terviora Estates SVG is restored in the header, footer, and favicon.

New landscape and portrait concepts replace the enlarged panorama. They retain the charcoal contemporary Kerala villa, glazing, bronze roof edge, tropical planting, and neutral light. The photo continues behind the search and to all viewport edges. Desktop, wide, laptop, phone, short phone, narrow phone, and tablet screenshots were captured. Portrait tablets use the portrait composition to avoid severe side cropping. On short phones the supplementary hero paragraph is hidden so the headline, villa, and search remain legible.

Design critique: Space Grotesk and Manrope remain in the page, while the restored logo preserves the supplied brand lettering. Restrained monochrome controls, a blue brand mark, consistent alignment, deliberate scale, and subtle token-based transitions satisfy the revised direction. No ornamental motion was added, and reduced-motion handling remains. The search deliberately covers foreground and may cover the lowest part of the building on short screens. Generated concepts remain illustrative; physical-device and screen-reader testing are not claimed.

Verification: static checks passed. The seven-size hero check now additionally asserts that the hero itself and photograph fill the viewport, the complete search overlays the photo, the search clears the headline, and the restored logo loads. It also checks the CTA, tab announcements, and expanded filters. Existing browser interaction checks passed, including filters, budget validation, shortlist, URL restoration, dialogs, navigation, and reduced motion.

## Compact mobile hero and separate search — 2026-11-07

Below 768 px the hero now has natural content height and a 220–360 px full-width landscape image. Search follows outside the hero with a 16 px gap; advanced filters expand in normal flow. Desktop and tablet retain their full-screen image and search overlay. The blue logo, type pairing, monochrome controls, token-based dimensions, and reduced-motion behavior are preserved.

Reviewed desktop, 390 px mobile, and short-phone screenshots. The house remains fully legible in the shorter image and the search has clear separation. Short phones may scroll to reach the final search action, consistent with placing search below the hero. Static checks and the seven-size hero checks passed, including responsive positioning, no horizontal overflow, the hero link, tab updates, and opening/closing advanced filters without covering listings.

## Luxury typography, hero visibility, and custom choices — 2026-11-07

Replaced the active Space Grotesk/Manrope pairing with locally hosted Cormorant Garamond and Jost, including their OFL licenses. Display headings use the serif; compact property metadata and controls stay in Jost. The hero adds a restrained tracked eyebrow, a 44–48 px solid dark Explore properties action, and darker, larger supporting copy. The paragraph is no longer hidden on short phones and appears before the button on mobile. The compact mobile hero/separate search and full-screen desktop composition are retained.

All nine native selects were replaced with custom comboboxes. Warm neutral option panels show selected and active states, fit within the viewport, and use a top-layer popover. Keyboard support includes arrows, Home/End, Enter/Space, typeahead, Escape cancellation, and Tab dismissal. Pointer/outside dismissal, required alert-choice validation, form reset, dynamic property types, and URL restoration are supported. The visible checkmark is decorative to preserve option names for assistive technology.

Visual critique: the new serif establishes a clearer editorial hierarchy; the solid hero action and supporting text remain legible. Logo, modern Kerala imagery, alignment, purposeful whitespace, design tokens, and reduced-motion behavior are preserved. On narrow/short phones, the separate search may require scrolling. Dropdowns open above their fields near the viewport bottom and remain readable without clipping. Desktop, mobile, short-phone, and open-dropdown screenshots were inspected. No new architectural imagery was needed.

Verification: static checks reject any HTML select and validate the new script; the browser workflow passes filters, URL restore, shortlist, dialogs, navigation, font loading, and reduced motion. Focused custom-choice checks pass keyboard/typeahead, pointer interaction, outside dismissal, viewport placement, reset, dynamic options, synchronized area, required validation, unique runtime IDs, and absence of browser errors. Full screen-reader and physical-device certification is not claimed.

## Reference screenshot typography — 2026-11-07

The latest request supersedes the serif direction. Manrope now supplies all active page typography, including headings, body, navigation, buttons, inputs, and styled dropdowns. Only one font is declared and preloaded. The original logo is retained as brand artwork. The screenshot alone does not establish the exact font identity, so this is a visual match rather than a claimed definitive identification.

Regular headings, tighter tracking, and a responsive sans-serif scale follow the supplied reference. Inspected desktop and mobile screenshots. The headline remains on two lines, supporting copy and the solid action remain visible, mobile search remains separate, and the full-screen desktop composition stays intact. Tokens, restrained palette, Kerala images, custom choices, and reduced motion are preserved.

Static checks passed. Hero checks passed at seven sizes, with no horizontal overflow and visible hero copy/actions. Custom-choice keyboard, reset, validation, placement, and interaction checks passed after the font switch.

## Sky clearance for hero copy — 2026-11-07

Updated the desktop/landscape hero to `hero-sky-v3-*`, an image-tool edit with a slightly wider camera view and more sky above a lower roofline. Wide-screen object positioning preserves that sky instead of cropping it away. The full-bleed composition and desktop search overlay remain; mobile keeps its compact image below the copy and its separate search panel.

Inspected 1440×1000 desktop, 1366×768 laptop, 1900×960 wide desktop, and mobile captures. The headline, supporting copy, and action now sit over clear sky instead of architecture or foliage. The house remains prominent, with its lower portion intentionally covered by the desktop search. The neutral palette, Manrope type, blue logo, grid, design tokens, and reduced-motion behavior remain intact. Static checks and the seven-size hero/interaction checks passed. This remains illustrative generated architecture.

## Text readability — 2026-11-07

Body text, supporting information, navigation, and custom choices now use weight 500. Small form labels, prices, FAQ prompts, and selected states use 600; large headings retain 400. Shared weight tokens and a darker muted text token (#565656) keep the hierarchy consistent.

Reviewed desktop and mobile captures: compact text has stronger strokes while the spacious composition and understated headings remain intact. Existing imagery, neutral palette, responsive search placement, and reduced-motion behavior are preserved. Static checks and the browser workflow passed across desktop, mobile, narrow mobile, and tablet, with no horizontal overflow or browser errors.

## Architectural glass

Desktop and mobile captures show the existing Manrope hierarchy and grid with neutral glass surfaces, sharp corners, and readable controls. The desktop search softens the photo underneath while the active white tab and black submit button remain distinct. Mobile uses lighter blur and retains the separate search. The scrolled desktop capture shows restrained photo chips and a visible View details control. Dark chips use a denser tint for white text, and the hero stat reports the current sample inventory.

The entrance uses locally bundled Motion for JavaScript. Reduced motion disables the entrance, float, image zoom, and pointer sheen. Static checks, the full browser workflow, and seven hero viewports passed. Targeted browser checks also passed for the sticky navbar, glass blur, pointer sheen, listing hover, dialog, and reduced-motion behavior.

### Floating navigation and clearer search glass

The scrolled navbar is inset on all sides and uses a more compact header. The search uses lighter frost, transparent filters, and an outlined translucent active tab. Desktop and mobile captures show separation around the floating navbar and readable controls. Mobile search stays below the hero with a faint photographic wash behind its upper edge.

Category captions and listing controls extend the treatment across the grids without adding live blur to each card. The process and owner panels catch part of the adjacent photograph through the glass, and the alerts form uses a neutral photographic backing. The existing monochrome palette, type scale, and editorial grid remain intact. Static checks, browser workflows, the detached navbar and menu checks, and the seven-size hero checks passed.

### Rounded glass and smoother motion

Reviewed desktop and mobile captures after removing the two hero labels. The rounded navbar floats into place with a separate glass layer that fades in as the bar moves. Its links keep their spacing during the transition. The search panel is slightly more transparent and its active tab highlight slides between choices. The monochrome surfaces keep the existing typography and layout legible. Reduced motion skips the movement.

Static checks, the full browser workflow, and seven hero sizes passed. Focused checks confirmed that the navbar stays the same size as it floats, the tab highlight tracks keyboard selection, the mobile menu clears the floating bar, and the removed wording does not appear in the rendered page.

### Listing prices, glass controls, and contact

Reviewed desktop and mobile captures. Prices now lead the card body in large Manrope numerals. The search and form controls use rounded, inset glass surfaces with distinct focus states. Above the footer, a Kerala villa exterior on desktop and a tropical interior on mobile provide depth behind the enquiry form. The dark overlay maintains contrast for the heading, and the form switches to a single column on phones.

Static, browser, hero, and custom-choice checks passed. The enquiry form was checked for required topic validation, copying, and the selectable text fallback. It prepares enquiries locally because no delivery service is configured.

### Compact price alignment

Desktop and mobile captures show the smaller price aligned with the property name at the right edge. The name and location stay together on the left, with the rental period beneath the price. The plain Manrope treatment keeps the cards editorial. Sale and rental rows passed alignment and overflow checks at four widths.

### Dedicated listings and property pages

Desktop and mobile captures show compact openings, the existing floating navigation, restrained glass, and the same Manrope hierarchy. The browse page starts with filters and a sortable grid with prices opposite property names. The detail page places the summary first and the photo alongside it on desktop or below it on phones. Inventory supplies one photo per listing, so the viewer enlarges the available photo.

Static, browser, landing hero, and custom-choice checks passed. The browser flow covered entry from the landing search, filtering and sorting, returning to the same filters, shortlist persistence, and the enlarged photo. Both new pages were also checked for overflow and an unavailable property state at four widths.

### Responsive listing filters

Desktop and phone captures show the same Manrope typography and restrained glass surfaces. On desktop the left sidebar keeps search controls beside the cards. On phones the compact Filters and Sort row lets the first card appear in the initial viewport. The filter count reflects applied criteria, and opening the panel preserves those choices.

The browser workflow passed. Five viewport sizes confirmed the sidebar placement or collapsed controls, visible first results, and no horizontal overflow. Keyboard dismissal and successful search both collapse the panel on smaller screens.

### Property gallery and related properties

The detail page keeps the existing summary beside the photos on desktop and above them on phones. The thumbnail strip and outlined navigation stay legible at narrow widths. The original image and the alternate view preserve the same architectural direction. Related cards keep compact, right-aligned prices and favor the same property family and transaction.

Reviewed desktop and mobile screenshots. Browser checks covered the 12 gallery image sets, selected thumbnails, photo viewer and keyboard controls, related links, and layout down to 320 px.

### Location dropdown search

Desktop and mobile captures show an inset search field within the existing glass menu. The input stays visible while the list scrolls. Anywhere remains the unfiltered choice, and the search reports when no cities match.

### Compact dropdowns and softer input states

Desktop and phone captures show tighter rows, lighter shadows, and a shaded selected row. Touch rows remain slightly taller. Inputs brighten on hover without changing the border, and a muted gray focus ring remains visible for keyboard use. Dropdown interaction, viewport placement, and input state checks passed.

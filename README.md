# Terviora Estates

A Kerala property-discovery site in plain HTML, CSS, and JavaScript with native browser animations and no build step.

## Run locally

Requires Node.js 20 or newer. From this folder:

```sh
npm start
```

Open http://127.0.0.1:4173. `PORT` may override the default. The preview server binds to loopback only. Stop with Ctrl+C.

The site also works on ordinary static hosting. Deploy `index.html`, `listings.html`, `property.html`, `sell.html`, `contact.html`, `styles/`, `assets/`, and the browser scripts `data.js`, `choices.js`, `main.js`, `glass.js`, and `motion.js` from `scripts/`. Developer utilities and QA files need not be deployed.

## Included

- Responsive navigation, search, five visual categories, six featured properties, and latest listings.
- Separate transaction intent and property types, including commercial sale/rent.
- Dedicated listings page with a desktop filter sidebar and a compact Filters button on phones and smaller tablets. The location filter offers Anywhere and searchable city choices. Show all returns to the full collection. Location, budget, bedroom, area, furnishing, owner/agent, and sort settings are shareable in the URL.
- Property detail pages with key facts, a thumbnail gallery and enlarged photo viewer, related properties, and a link back to the filtered collection. The browser-local shortlist is shared across all pages.
- Dedicated Sell and Contact pages with validated, copyable enquiry drafts. Enquiries opened from a property detail page include the listing name and reference.
- Independently toggled latest listings, footer city shortcuts, process tabs, FAQs, and validated alert preview.
- Twelve explicitly illustrative listings. Images are coordinated, AI-generated Kerala architectural concepts, not actual listing photographs.
- Self-hosted Manrope across page text and controls, its OFL license, scalable brand artwork, and responsive WebP images. No external assets are requested during normal use.
- The supplied Terviora Estates mark and name are traced in `assets/brand/terviora-estates-lockup.svg`. The website palette comes from the same artwork.
- Design tokens, keyboard focus, accessible native dialogs, reduced-motion handling, and responsive layouts down to 320 px.
- Shared motion for page entrances, scroll reveals, listings updates, disclosures, and decoded gallery images. Same-origin page crossfades run where browser support is available. Reduced-motion preferences skip the animations.
- A branded opening sequence plays once per tab when visitors enter the site. The hero reveals its title and video in stages. On devices with a mouse, the pointer and light follow movement, and the video shifts gently beneath them.

## Honest frontend boundaries

There is no live inventory, account system, owner submission service, enquiry service, or email delivery. The Sell and Contact forms prepare drafts for copying and show selectable text if clipboard access fails. Enquiry and alert details are never sent or stored by the site. Only shortlist IDs are saved locally. No invented reviews, verified badges, partner logos, or platform statistics appear.

Replace sample inventory and imagery with approved real data before launch. Confirm launch locations, posting fees, verification policy, privacy/legal text, company contact information, and real integration destinations. The owner CTA uses “List your property” until a free-posting policy is confirmed.

## Files

- `desing.md`: approved design direction and implementation refinements (filename retained as requested).
- `AGENTS.md`: project and design instructions.
- `styles/tokens.css`: fonts and all raw visual tokens.
- `styles/main.css`: base component styles; `styles/reference.css`: current reference-matched layout and responsive adaptations.
- `styles/listings.css`: compact listings and property detail layouts.
- `scripts/data.js`: clearly marked sample inventory with separate `listing_type` and `property_type` fields.
- `scripts/main.js`: application interactions.
- `styles/motion.css` and `scripts/motion.js`: the opening sequence, hero and pointer effects, scroll progress, and one-time reveals for section content and listing cards.
- `scripts/choices.js`: styled custom choice controls; keyboard navigation, typeahead, reset, and validation without HTML selects.
- `assets/images/MODERN-PROMPTS.md`: current image prompts and provenance; `PROVENANCE.md` records the superseded first image set.
- `assets/images/GALLERY-PROMPTS.md`: references and generation prompts for the alternate gallery views.
- `qa/`: responsive screenshots, browser-check output, and visual review.

## Verification

```sh
npm run check
```

Checks JavaScript syntax, duplicate IDs, local file and anchor references, and component color/spacing token usage.

Optional interaction and screenshot checks use Playwright, kept separate from the website. With a local preview running and Playwright available:

```sh
node scripts/browser-check.cjs
```

If Playwright is provided by an external tooling bundle, set `PLAYWRIGHT_MODULE` to its module path. Set `BROWSER_PATH` to a Chromium-family executable when using an installed browser. The script creates a separate headless session, exercises the UI, writes `qa/browser-check.json`, and captures desktop, mobile, narrow-phone, and tablet screenshots. It does not use a personal browser profile or contact external services.

## Fonts and image assets

The chosen fonts are already included. `node scripts/download-fonts.mjs` refreshes them and their OFL licenses from Google Fonts and its official repository; this optional maintenance command requires network access. Preserve the license files.

Seven modern concepts were generated with the built-in image tool, then optimized into 640, 1280, and 1536 px WebP versions. Prompts explicitly require believable Kerala architecture, coconut palms, tropical gardens, flat roofs, cantilevers, concrete, glazing, and coordinated neutral daylight. The originals are retained in the user's generated-images directory; all website dependencies are copied into this project.

The current revision follows the supplied screenshots closely: full-screen modern villa hero with search over its lower foreground, equal three-column white listing cards, narrow process text panel with a large image, and a white owner banner. Seven new modern architectural concepts replace the initial traditional-looking imagery.


On desktop and tablet, the hero and its video fill `100svh` with search layered over the bottom. Below 768 px, a compact hero is followed by a separate search panel with a 16 px gap. The supplied MP4 plays muted and loops under a black overlay. Visitors can pause playback, and reduced-motion mode starts with a still frame from the video. Advanced filters and validation errors expand naturally. To capture and verify the opening composition at seven desktop/mobile sizes with the same Playwright environment settings, run `node scripts/check-hero.cjs` while the local preview is running.

Custom dropdown checks run with `node scripts/check-choices.cjs` using the same Playwright settings. They cover keyboard selection/dismissal, pointer selection, viewport placement, form reset, dynamic property types, area synchronization, required alert choices, and unique runtime IDs. `scripts/check-hero.cjs` also verifies visible supporting copy and a contrasting usable hero action across seven viewport sizes.

### Glass surfaces

- `glass-light` styles the Post property button, listing controls, and category captions. The navy navbar keeps the silver and cyan logo readable as it docks after 40 px of scroll.
- `glass-medium` styles search, the mobile menu, dialogs, dropdowns, and selected content panels. Search uses a light frost and transparent fields so the photo shows through. Dialogs and dropdowns use stronger blur.
- `glass-dark` is available for dark overlays where white text needs contrast. Listing prices sit on the right, opposite the property name.

The utilities live in `styles/glass.css` and their tokens in `styles/tokens.css`. Listing chips use tinted surfaces in the scrolling grids. Live blur on listing cards is limited to the hovered View details control.

The contact form validates enquiries and prepares text for copying. When clipboard access is unavailable, it shows selectable text. It does not send or store enquiries because no delivery service is configured.

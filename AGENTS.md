# Agent guidance for Terviora

## Scope

These instructions apply throughout this repository. Follow any additional
`AGENTS.md` instructions in the directories you modify.

## Project context

The landing, listings, property detail, Sell, and Contact pages use plain HTML, CSS, and JavaScript with no runtime framework.
Sitewide animation uses native CSS and browser APIs. Run `npm start` for the local preview and `npm run check` for
syntax, references, and design-token checks. `scripts/browser-check.cjs` provides
optional browser QA with Playwright. See `README.md` for setup and limitations.

## Working approach

- Read relevant code, documentation, and configuration before making changes.
- Make focused changes that address the requested task and follow existing
  conventions as the project develops.
- Preserve unrelated work. Do not overwrite or revert changes you did not make.
- Resolve routine implementation choices independently. Ask for clarification
  when a missing requirement materially affects the result.
- Avoid adding dependencies unless the task requires them. Use the project's
  established dependency manager and update its lockfile when applicable.
- Update documentation when behavior, configuration, or setup steps change.

## Security and data

- Never commit secrets, credentials, private keys, or local environment files.
- Use placeholders in configuration examples and document required variables.
- Do not delete user data or perform destructive repository operations without
  explicit authorization.

## Verification

- Use the build, lint, type-check, and test commands defined by the project once
  they exist. Do not invent commands or claim checks ran when they did not.
- Verify the changed behavior with checks appropriate to the scope of the work.
- Add or update tests when they meaningfully protect behavior or fix a regression.
- If verification cannot run, explain the limitation and what remains unchecked.

## Handoff

- Summarize what changed and any relevant verification results.
- Mention unresolved issues or required setup steps.
- Keep this file aligned with the actual project as tooling and conventions are
  established.

## Design principles
- Never use Inter, Roboto, Arial, or system fonts. Choose a distinctive display + body pairing.
- Never use purple/blue gradients on white, or generic SaaS card grids.
- Before building any page, output a "Design Direction" block: concept, palette (hex),
  fonts, layout idea, signature interaction. Wait for approval.
- Use design tokens only; no hardcoded colors or spacing in components.
- Motion: purposeful, with defined easing and stagger. Respect prefers-reduced-motion.
- Asymmetry, strong typographic scale, and intentional whitespace over symmetric templates.
- After implementing, screenshot at mobile and desktop and critique against this list.
- Terviora is Kerala-based. Imagery must show plausible contemporary Kerala
  architecture: luxurious, refined buildings, tropical planting, and appropriate
  local materials. Avoid European or American architectural imagery.
- Use a consistent, high-quality image set with coordinated light, color, and
  composition. Keep generated concepts and sample inventory clearly identified
  until genuine listing photography and data are available.
- Latest user direction takes precedence over the original design proposal:
  closely reproduce the supplied reference screenshots' composition, scale,
  compact controls, equal three-column listing cards, process split, and white
  owner CTA. Restore the supplied blue Terviora Estates logo and keep the UI restrained.
  The approved Luxespace-inspired homepage hero uses the supplied Terviora branding
  and the requested Dubai reference footage as an exception to the Kerala imagery
  direction. Use a full-height desktop and tablet stage and a shorter phone stage.
  Place search in normal flow below the hero at every viewport width.
- Architecture must be distinctly modern: flat roofs, cantilevers, concrete,
  glass, and restrained tropical landscaping. Avoid tiled/sloping roofs,
  traditional verandas, rustic laterite, cane furniture, or heritage styling.

- Latest typography direction overrides the earlier display/body pairing requirement: use self-hosted Manrope throughout page text and controls, with regular-weight headings and tight tracking to match the supplied screenshot. The screenshot does not establish an exact font identity; Manrope is the chosen visual match. Keep the hero paragraph visible on all screen sizes and use a solid high-contrast hero action.
- Do not use HTML select elements. Use the styled `terviora-choice` component in `scripts/choices.js`, preserving keyboard controls, reset, validation, and responsive option placement.
- Keep compact text readable: use the shared reading weight (500) for body text and controls, emphasis weight (600) for small labels and key information, and display weight (400) for large headings.
- Set listing prices in compact, readable type at the right of the property name. Avoid boxed price badges over photographs and default-looking form controls.

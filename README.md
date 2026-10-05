# QHAKAZA — Sports Foundation Website

A website for Qhakaza Sports Foundation.

QHAKAZA is a Non-Profit Organisation (NPO), founded by Gromingo Mzunga.
The project's digital director is Armiel Pillay.

QHAKAZA has spread its roots throughout the Kwa-Zulu Natal region and has helped countless students attain greatness, despite their poverty stricken situations.

The QHAKAZA website is under active development by the above mentioned digital director.

## Project structure (Vite + vanilla ES modules)

Refactored from a monolithic `index.html` into separated, well-structured modules —
so the repository reflects its real HTML / CSS / JavaScript split instead of “100% HTML”.

```text
index.html                  # slim shell: meta + sections + <script type="module" src="/src/js/main.js">
vite.config.js              # base './' for GitHub Project Pages, publicDir 'public'
public/
  CNAME
  Assets/Media/...          # images, videos, logo, sponsors (copied to dist/Assets/...)
src/
  styles/
    main.css                # entry — @imports everything in cascade order
    variables.css           # design tokens (:root + [data-theme="light"] base)
    reset.css               # reset, scrollbar, body bg, particles canvas
    base.css                # sections, typography, buttons, .reveal
    themes-light.css        # light-theme overrides (extracted)
    responsive.css          # authoritative responsive (verbatim from original)
    components/
      nav.css / hero.css / stats.css / mission.css / founder.css
      athletes.css / sponsors.css / donate.css
      overlays.css          # boot + showcase overlays
      footer.css / modals.css
  js/
    main.js                 # entry — init order + window bridge for onclick=""
    config.js               # PayFast + STATE_URL constants
    theme.js                # dark/light toggle
    boot.js                 # intro video overlay (+ window.__showBoot)
    particles.js            # canvas particles (+ window.__setParticle*)
    site-state.js           # remote kill-switches from Gist
    navigation.js           # navbar, reveal, carousels, athletes video
    donation.js             # multi-step checkout + PayFast
    modals.js               # generic/dev/showcase modals + Konami + copy
```

## Development

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # outputs to dist/
npm run preview  # preview the production build
```

## Deploy (GitHub Pages)

```bash
npm run deploy   # builds + pushes dist/ to gh-pages
```

Or use the repo's Pages workflow serving from `dist/` / `gh-pages` branch.
`public/CNAME` (`qhakaza.co.za`) is copied to `dist/CNAME` automatically.

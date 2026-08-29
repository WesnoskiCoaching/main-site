# Website update, 2026-08-29

> **Re-upload, 2026-08-29 (fix).** The first upload shipped a broken hero on all six
> guides. The magnet used `class="hero"` and the site stylesheet sets
> `.hero{display:flex;min-height:90vh}`, so the badge, headline and deck laid out
> side by side in strips instead of stacked. Renamed to `.mhero` and `.mcta`.
> `.btn` still collides on purpose, that is what makes the Apply button look native.
> Re-upload the six guide pages. `resources.html` and `sitemap.xml` are unchanged
> but re-uploading them is harmless.
>
> **Also delete `DEPLOY.md` from the repo.** It went up with the first batch and is
> now public at wesnoskicoaching.com/DEPLOY.md. It is internal notes, not secrets,
> but it does not belong on the live site.

**Repo:** `WesnoskiCoaching/main-site`  
**Upload page:** https://github.com/WesnoskiCoaching/main-site/upload/main

## 1. Copy these 7 files into the repo root

Next to `index.html`, alongside `coaches.html` and `reviews.html`.

| File | What it is |
|---|---|
| `resources.html` | Hub listing all six guides |
| `depleted.html` | Depleted, drug-nutrient depletion |
| `iron-protocol.html` | The Complete Iron Protocol, replaces the dead Replit |
| `metabolic-panel.html` | The Metabolic Panel Cheat Sheet |
| `cholesterol-playbook.html` | The Cholesterol Playbook |
| `estrogen-clearance.html` | The Estrogen Clearance Protocol |
| `birth-control.html` | What Birth Control Is Actually Doing To Your Body |

Each is self-contained apart from `assets/styles.css` and `assets/logo-192.png`,
which already exist. Each carries GA4, the Meta Pixel and the Metricool tracker,
verified to fire once.

## 2. Replace sitemap.xml

The live sitemap lists only 3 URLs: the homepage, terms and privacy. `coaches`,
`reviews`, `assessment` and `calculator` were never added, so they are already
invisible to search. The `sitemap.xml` in this folder covers all 15 pages
including the six guides and the hub. Drop it in the same upload.

## 3. Add Resources to the nav, one line per file

Do this **in the repo, not in `Website Preview/`**. That local folder predates
the tracking commit and deploying from it would strip analytics off the site.

In each of `index.html`, `coaches.html`, `reviews.html`, `assessment.html`,
`calculator.html`, `terms.html`, `privacy.html`, `disclaimer.html`, find:

```html
<a href="reviews.html">Stories</a>
```

and add directly after it:

```html
<a href="resources.html">Resources</a>
```

One-liner from the repo root:

```bash
sed -i '' 's|<a href="reviews.html">Stories</a>|<a href="reviews.html">Stories</a>\
      <a href="resources.html">Resources</a>|' *.html
```

## 4. Redirect the dead Replit link

`ferritin-guide--farrenbrown.replit.app/guide` is down. Anywhere that URL is
still published, point it at `/iron-protocol.html`.

## Measuring it, since nothing is gated

Every guide fires two events to GA4 and the Meta Pixel, tagged with which guide
they came from:

| Event | Fires when | Answers |
|---|---|---|
| `guide_read_75` | Reader passes 75% scroll depth | Who actually finishes, per guide |
| `guide_apply_click` | Reader clicks the Apply button | Readers per application, per guide |

In GA4 these appear under Reports, Engagement, Events. In Meta they arrive as
custom conversions, so once there is volume the pixel can optimise ad delivery
toward `guide_apply_click` rather than raw traffic.

The number to watch on the Sep 18 pull is reads-to-apply-clicks. Healthy reads
with near-zero apply clicks means the guides are landing with people who are not
ready, and a low-commitment email capture at the end is worth building. Decent
apply clicks means leaving them ungated was right.

## Rebuilding

`python3 build.py` regenerates everything. `python3 build.py iron` does one.
Content lives in `magnets/*.py`, one file per guide. Figures in
`engine/figures.py`. Canonical ranges at the top of `engine/blocks.py`.

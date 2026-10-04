# MAMPU Initiative website — agent onboarding

Marketing site for **Inisiatif MAMPU** (“Alleviating Poverty One Family at a Time”). Repository: `Ayyub29/mampu-website`.

## Stack

| Layer | Choice |
|--------|--------|
| Framework | Next.js **10.0.4** (Pages Router) |
| UI | React 17, React Bootstrap 1.x, Bootstrap 4.6 |
| Styling | CSS Modules (`*.module.css`) + global `styles/globals.css` |
| CMS | [Contentful](https://www.contentful.com/) via `contentful` SDK |
| Newsletter | Mailchimp REST API (`pages/api/subscribe.js`) |
| Hosting | Netlify static export (`out/`) + serverless API |

Bootstrapped from [next-netlify-starter](https://github.com/cassidoo/next-netlify-starter); `README.md` still describes the generic starter.

## Repository layout

```
pages/           Route entrypoints (getStaticProps for CMS data)
  index.js       Home — testimonials
  About.js       Vision/mission + values + newsletter
  Families.js    Current/past families
  Team.js        Team by department (accordion)
  Contact.js     “Coming soon” placeholder
  api/subscribe.js   Mailchimp subscribe (Netlify function)
components/      Presentational UI by page area (Home/, About/, Team/, …)
util/
  contentfulPosts.js   All Contentful fetch helpers
public/          Static assets (SVGs, images referenced in CSS)
styles/globals.css
netlify.toml     build + `/api/subscribe` redirect
jsconfig.json    Path aliases: @components, @styles, @util
```

## Routes (important)

Filenames use **PascalCase**, so URLs are capitalized:

| URL | File |
|-----|------|
| `/` | `pages/index.js` |
| `/About` | `pages/About.js` |
| `/Families` | `pages/Families.js` |
| `/Team` | `pages/Team.js` |
| `/Contact` | `pages/Contact.js` (not linked in nav; shows Pending) |

Nav links live in `components/Navbars.js`.

## Data flow

1. **Build time**: Pages with `getStaticProps` call `util/contentfulPosts.js`, map `entry.fields`, pass props to components.
2. **Images**: Contentful assets use `https:${field.fields.file.url}`.
3. **Newsletter**: `components/Home/Newsletter.js` posts to `/api/subscribe`. On Netlify, `netlify.toml` rewrites that to the serverless handler in `pages/api/subscribe.js`.

### Contentful content types

| `content_type` | Fetch function | Used on |
|----------------|----------------|---------|
| `testimoni` | `fetchTestimoni` | Home |
| `advisors` | `fetchAdvisors` | Team |
| `mampuProgramme` | `fetchMampuprogramme` | Team |
| `legalDivision` | `fetchLegaldivision` | Team |
| `donorEngagement` | `fetchDonorengagement` | Team |
| `digitalFundraising` | `fetchDigitalfundraising` | Team |
| `onGroundFundraising` | `fetchOngroundfundraising` | Team |
| `currentFamily` | `fetchCurrentFamily` | Families |
| `pastFamily` | `fetchPastFamily` | Families |

Team member entries reuse field names like `namaAdvisor`, `jabatanAdvisor`, `deskripsiAdvisor`, `fotoAdvisor` across several types.

## Environment variables

Create `.env.local` (see `.env.local` in repo — **should be gitignored and rotated**; keys are currently committed):

- `NEXT_PUBLIC_CONTENTFUL_SPACE_ID`
- `NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN`
- `NEXT_PUBLIC_MAILCHIMP_LIST_ID`
- `NEXT_PUBLIC_MAILCHIMP_API_KEY`

All are prefixed `NEXT_PUBLIC_` so they are embedded at build time for static export.

## Local development

```bash
npm install --ignore-scripts   # avoids node-sass native build on modern Node
npm run dev                    # http://localhost:3000
```

**Node version**: Next 10 and legacy `@zeit/next-*` packages expect **Node 14–16**. Node 18+ often fails at `next build` (e.g. PostCSS export errors). Use `nvm use 16` (or match Netlify’s build image) for production builds.

```bash
npm run build && npm run export   # produces static site in out/
```

Netlify runs: `npm run build && npm run export`, publish `out`, functions from `./pages/api`.

## Conventions when changing code

- Match existing patterns: CSS Modules colocated with components, React Bootstrap for layout/widgets, accordion toggles via local `useState` in Team/Families.
- Prefer path aliases (`@components/...`) over deep relative imports.
- Pages duplicate `<Head>`, Bootstrap CDN link, `<Navbars />`, and `<Footer />`; there is no shared layout component beyond `_app.js`.
- Several components use `class=` instead of React’s `className` (legacy; works in React 17 with warnings).

## Known quirks / cleanup opportunities

- `components/Team/TeamMember.js` imports unused `fetchEntries` (not exported from `contentfulPosts.js`).
- `Newsletter.js`: Mailchimp `onSubmit={subscribe}` is commented; form uses `data-netlify="true"` without Netlify form handling — newsletter may not work as intended outside a wired Netlify form flow.
- `pages/*/index` wrappers use raw `<html>` inside page components instead of `pages/_document.js`.
- `util/contentfulPosts.js` error paths reference undefined `contentType`.
- `.env.local` is not in `.gitignore`; treat secrets as exposed and rotate in Contentful/Mailchimp if the repo is public.

## Scripts (`package.json`)

| Script | Purpose |
|--------|---------|
| `dev` | Next dev server |
| `build` | Next production build |
| `export` | Static HTML export to `out/` |
| `start` | Next production server (not used on Netlify static hosting) |
| `postinstall` | `netlify-lambda install` |

## What to touch for common tasks

| Task | Where |
|------|--------|
| Nav / routes | `components/Navbars.js` |
| Footer / donate info | `components/Footer.js` |
| Home hero, impact stats, testimonials | `components/Home/*`, `pages/index.js` |
| About copy | `components/About/VisiMisi.js`, `Values.js` |
| Team sections | `components/Team/TeamMember.js`, Contentful types above |
| Families cards | `components/Families/FamiliesMember.js` |
| New CMS type | Add fetch in `contentfulPosts.js`, wire `getStaticProps` on the page |
| Newsletter API | `pages/api/subscribe.js`, env vars |

Keep diffs small; this codebase is mostly static presentation with CMS-backed lists.

# TripSuggest – AI Trip Planner (React frontend)

React + Vite frontend for TripSuggest. This is the completed React version of the original
HTML/CSS/JS site; the visual design (colors, layout, cards, header, footer) is unchanged.

## Run

```bash
npm install
npm run dev        # development
npm run build      # production build
npm run preview    # serve the production build
```

## Routes

| Route | Page |
|---|---|
| `/` | Home (hero, popular destinations, map) |
| `/destinations` | Destinations with search, budget + type filters, map |
| `/trip-details?dest=Goa` | Trip details: itinerary, estimated budget, save/remove |
| `/trip-planner` | Trip planner form (validated) |
| `/results` | Recommended destinations |
| `/packages`, `/about`, `/how-it-works`, `/faq`, `/contact` | Content pages |
| `/login`, `/signup` | Validated forms (demo only, see below) |
| `/dashboard` | Saved trips, planned trips, upcoming trip, recommendations |

## Project structure

```
src/
  components/   Header, Footer, Layout, DestinationCard, DestinationMap, ToastProvider, PageBanner
  context/      toast context
  hooks/        useSavedTrips / useUser / useTripRequests (localStorage-backed)
  data/         destinations.js  <- single source of truth for all destinations
  utils/        recommend.js, budget.js, itinerary.js, storage.js, validation.js, weather.js
  pages/        one file per route
  css/          original stylesheets (page CSS files + common.css)
```

To add a destination, add one object to `src/data/destinations.js`; every page picks it up.

## How the main features work

- **Recommendations** (`utils/recommend.js`): rule-based, no AI. Same selection rules as the original
  `trip-planner.js` (typed destination, then trip types, then budget band), plus a transparent score
  (type, preferences, budget fit) that produces the "% Match" and the reason tags.
- **Budget** (`utils/budget.js`): each destination's package price is for 2 travelers for its default
  days. The estimate scales that by the chosen travelers/duration and splits it into accommodation /
  food / transport / activities. It is an indicative estimate, not a quote.
- **Save Trip**: `localStorage` key `savedTrips` (array of destination ids, same as the original site).
- **Planner requests**: last request/results in `sessionStorage`; history in `localStorage` (`tripRequests`).
- **Map**: Leaflet + OpenStreetMap (no API key).

## Needs a backend / API later (extension points)

- `utils/recommend.js` – replace `recommendDestinations()` with an API call (keep the return shape).
- `utils/storage.js` – replace with API calls for saved trips / trip requests.
- `pages/Login.jsx`, `pages/Signup.jsx` – **demo only**: nothing is verified server-side and passwords
  are never stored. Connect real authentication here.
- `pages/Contact.jsx` – the message is not sent anywhere yet.
- `utils/weather.js` – no weather API key is configured, so no weather is shown.

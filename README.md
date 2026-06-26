# MarketDesk UI

The frontend for the **MarketDesk** market-intelligence API — a client-rendered
Next.js SPA styled as a precision instrument panel ("The Desk").

> Pairs with the FastAPI backend in `../stockadvisor`. This app only renders;
> all market data, scoring, and the ML model come from that API.

## Design

A deliberate, non-templated identity:

- **Semantic color** is the core idea. `brass` = the market / brand needle,
  `ion` (periwinkle) = the ML model's opinion, and **green/red are reserved
  strictly for price direction** — so color carries meaning in a tool whose
  whole job is separating signals.
- **Type**: Fraunces (editorial serif display — the engine cites academic
  finance), Inter (UI), IBM Plex Mono (tabular data and the tape).
- **Signature**: a persistent live **Regime Tape** across the top — market
  regime, breadth meter, ETF ticks, a VIX arc gauge, and a connection light.
- Warm graphite chassis, machined hairlines, hand-drawn SVG instruments
  (gauge, breadth meter, price chart, sector bars). Responsive to mobile,
  visible keyboard focus, and `prefers-reduced-motion` respected.
- **Dark + light themes** via a no-flash toggle (semantic tokens are swapped at
  the CSS-variable level; preference persists to `localStorage`).
- **Mobile-ready**: the rail collapses to a sticky top bar + scrollable nav, and
  the screener switches from a dense table to swipeable cards on small screens.

### Interaction & performance

The Screener fetches the scored universe **once per profile/engine setting** and
does every other filter (search, sector, signal, score/ML/confidence/volatility
ranges) **client-side** — so filtering is instant with no network chatter.
Filtering/sorting is memoized, search is deferred (`useDeferredValue`), and table
rows / cards are `memo`-ized to keep large lists smooth. Active filters show as
clearable pills with a one-tap reset.

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · Tailwind CSS v4 (CSS-first
`@theme`) · SWR for client data fetching/polling. No chart library — the
instruments are bespoke SVG.

## Run

```bash
npm install
cp .env.local.example .env.local      # set NEXT_PUBLIC_API_BASE_URL
npm run dev                           # http://localhost:3000
```

You also need the backend running and seeded with a snapshot:

```bash
# in ../stockadvisor
python train.py            # builds the model + market snapshot
uvicorn api.main:app       # serves http://localhost:8000
```

The sidebar **Backend** control lets you re-point the UI at any API host
(e.g. a Lambda Function URL) at runtime — it persists to `localStorage`.

## Routes

| Path | Page |
|---|---|
| `/` | Dashboard — breadth, factor regime, sector rotation, movers, model card |
| `/screener` | Scored universe — filter by profile/signal/sector, sortable table |
| `/allocation` | Build a dollar/share plan with full risk analysis; save it |
| `/stock` · `/stock/[ticker]` | Stock Lab — quote validation, price chart, model read, analysts, news |
| `/plans` | Saved plans marked to live prices vs an SPY buy-and-hold |
| `/model` | The model — metrics, feature importance, training history, method |

## Structure

```
src/
  app/                  routes (one folder per page)
  components/
    app-shell.tsx       left rail + Regime Tape + content frame
    regime-tape.tsx     the signature live strip
    charts.tsx          bespoke SVG instruments
    ui.tsx              Panel, Stat, Badge, ScoreBar, Segmented, states
    providers.tsx       SWR config + live API-base context
  lib/
    api.ts              typed fetch client (env + localStorage base URL)
    hooks.ts            SWR hooks per endpoint
    types.ts            response types mirroring the API
    format.ts           number/percent/currency + tone helpers
```

Educational tool, not financial advice.

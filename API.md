# API Reference

Base URL: `/api` (mounted on the Express app alongside `GET /` which returns `"Hello world"`, and static assets served from `/images` and `/favicon.ico`).

All responses are JSON. Errors follow the shape `{ "message": string }` with an appropriate HTTP status code (see [Error handling](#error-handling)).

## Endpoints

| Method | Path | Description |
|---|---|---|
| POST | [/api/prices](#post-apiprices) | Search a given seller for a card and return matching listings |
| GET | [/api/prices](#get-apiprices) | List all supported sellers |
| GET | [/api/prices/test-all-models](#get-apipricestest-all-models) | Run a smoke test against every configured seller |
| POST | [/api/data/search-history](#post-apidatasearch-history) | Record one or more search terms |
| GET | [/api/data/search-history](#get-apidatasearch-history) | Get aggregated search term history |
| DELETE | [/api/data/search-history](#delete-apidatasearch-history) | Prune search history older than N days |
| POST | [/api/data/click-through](#post-apidataclick-through) | Record a click-through event for a card/seller pair |
| DELETE | [/api/data/click-through](#delete-apidataclick-through) | Prune click-through events older than N days |
| GET | [/api/data/click-through/sellers](#get-apidataclick-throughsellers) | Get click-through counts aggregated by seller |
| GET | [/api/data/click-through/cards](#get-apidataclick-throughcards) | Get click-through counts aggregated by card |
| GET | [/api/data/click-through/cards-by-seller](#get-apidataclick-throughcards-by-seller) | Get click-through counts aggregated by card, broken down per seller |
| GET | [/api/info/faq](#get-apiinfofaq) | Get the FAQ content shown in the app |

Any other method on a defined route (e.g. `PUT /api/info/faq`), and any undefined route entirely, returns an error (`405` and `404` respectively — see [Error handling](#error-handling)).

---

### POST `/api/prices`

Fetches live price listings for a card from a single seller by scraping/querying that seller's site (with short-lived caching — see `CachingPriceGetter`).

**Body**

| Field | Type | Required | Notes |
|---|---|---|---|
| `seller` | string | yes | Must match one of the seller `name`s returned by `GET /api/prices`. |
| `searchTerm` | string | yes | Card name (or partial name) to search for. |
| `saveOutput` | boolean | no | Defaults to `false`. If `true`, the price getter also persists its raw scrape output (used for debugging/model verification). |

**Response** `200`

```json
{
  "prices": [
    {
      "seller": "string",
      "title": "string",
      "imgSrc": "string",
      "productRef": "string",
      "expansion": "string",
      "price_relativeUnits": 0,
      "price_textRepresentation": "string",
      "stock_inStock": true,
      "stock_level": "string",
      "subtitle": "string",
      "isFoil": false,
      "searchTerm": "string"
    }
  ]
}
```

**Errors**
- `404` — `seller` does not match a configured/known seller.

---

### GET `/api/prices`

Returns the list of sellers currently configured (i.e. enabled) in the service, for populating a seller picker.

**Response** `200`

```json
{
  "sellers": [
    { "name": "string", "region": "UK | Europe | North America | Rest of World", "logoUrl": "string" }
  ]
}
```

---

### GET `/api/prices/test-all-models`

Diagnostic/health-check endpoint. For each configured seller, tries a fixed list of search terms (`Steam Vents`, `Glen Elendra Guardian`, `Lightning Bolt`, `Counterspell`) in order until one returns results, and reports which term worked (or that none did). Useful for detecting sellers whose scraper has broken (e.g. after a site redesign).

**Response** `200`

```json
{
  "testData": {
    "<sellerName>": {
      "status": "ok | no results",
      "resultCount": 0,
      "searchTerm": "string"
    }
  }
}
```

---

### POST `/api/data/search-history`

Records that a set of terms was searched for (used for analytics, e.g. "most searched cards").

**Body**

| Field | Type | Required | Notes |
|---|---|---|---|
| `searchedFor` | string[] | yes | Defaults to `[]` if omitted. Each entry is recorded as a separate search event with the current timestamp. |

**Response** `201`

```json
{ "message": "Search history recorded" }
```

**Errors**
- `400` — `searchedFor` is not an array.

---

### GET `/api/data/search-history`

Returns aggregated search history: one entry per unique term, with a count and the most recent time it was searched, sorted by count descending.

**Query params**

| Param | Type | Required | Notes |
|---|---|---|---|
| `days` | number | no | If provided, only includes searches from the last N days. |

**Response** `200`

```json
{
  "searchHistory": [
    { "term": "string", "count": 0, "lastSearchedAt": "2026-01-01T00:00:00.000Z" }
  ]
}
```

---

### DELETE `/api/data/search-history`

Prunes (permanently deletes) search history entries older than a given number of days. Intended for periodic cleanup.

**Query params**

| Param | Type | Required | Notes |
|---|---|---|---|
| `olderThan` | number | yes | Must be a positive number of days. |

**Response** `200`

```json
{ "removed": 0 }
```

**Errors**
- `400` — `olderThan` is missing, not a number, or not positive.

---

### POST `/api/data/click-through`

Records that a user clicked through to a seller's site for a given card (used for analytics, e.g. "most clicked seller").

**Body**

| Field | Type | Required | Notes |
|---|---|---|---|
| `card` | string | yes | Defaults to `''` if omitted, which is then rejected. |
| `seller` | string | yes | Defaults to `''` if omitted, which is then rejected. |

**Response** `201`

```json
{ "message": "Click-through recorded" }
```

**Errors**
- `400` — `card` or `seller` is missing/empty.

---

### DELETE `/api/data/click-through`

Prunes click-through events older than a given number of days.

**Query params**

| Param | Type | Required | Notes |
|---|---|---|---|
| `olderThan` | number | yes | Must be a positive number of days. |

**Response** `200`

```json
{ "removed": 0 }
```

**Errors**
- `400` — `olderThan` is missing, not a number, or not positive.

---

### GET `/api/data/click-through/sellers`

Returns click-through counts aggregated by seller, sorted by count descending.

**Query params**

| Param | Type | Required | Notes |
|---|---|---|---|
| `days` | number | no | If provided, only includes click-throughs from the last N days. |

**Response** `200`

```json
{
  "clickThroughs": [
    { "name": "string", "count": 0 }
  ]
}
```

---

### GET `/api/data/click-through/cards`

Same as above, but aggregated by card instead of seller.

**Query params**

| Param | Type | Required | Notes |
|---|---|---|---|
| `days` | number | no | If provided, only includes click-throughs from the last N days. |

**Response** `200`

```json
{
  "clickThroughs": [
    { "name": "string", "count": 0 }
  ]
}
```

---

### GET `/api/data/click-through/cards-by-seller`

Same as `/api/data/click-through/cards`, but broken down per seller instead of aggregated across all sellers: one entry per seller, each containing its own card breakdown (sorted by count descending). Sellers are sorted by their total click-through count descending.

**Query params**

| Param | Type | Required | Notes |
|---|---|---|---|
| `days` | number | no | If provided, only includes click-throughs from the last N days. |

**Response** `200`

```json
{
  "clickThroughs": [
    {
      "seller": "string",
      "cards": [
        { "name": "string", "count": 0 }
      ]
    }
  ]
}
```

---

### GET `/api/info/faq`

Returns static FAQ content displayed in the app (disclaimer, how prices are sourced, sponsorship disclosure, etc.). Content is hardcoded in `InfoService`.

**Response** `200`

```json
{
  "faq": [
    { "title": "string", "body": "string" }
  ]
}
```

---

## Error handling

All errors are passed to Express's error-handling middleware and returned as:

```json
{ "message": "string" }
```

with one of the following status codes:

| Status | When |
|---|---|
| 400 | Invalid/missing request data (e.g. bad `olderThan`, missing `card`/`seller`, non-array `searchedFor`) |
| 404 | Route doesn't exist, or (for `POST /api/prices`) an unknown `seller` was requested |
| 405 | A recognized route was hit with an unsupported HTTP method |
| 500 | Unhandled/unexpected error |

## Data service

Search history and click-through logic both live in `DataService` (`src/services/dataService/DataService.ts`), mirroring how `PricesService` and `InfoService` encapsulate their own domains. `searchHistoryModels.ts` and `clickThroughModels.ts` are thin wrappers around this singleton service, matching the existing model → service pattern used elsewhere.

## Notes on persistence

Search history and click-through data are currently stored **in-memory** (plain arrays inside `DataService.ts`) and are lost on server restart. `DataService.ts` contains a documented migration path to Postgres (e.g. Neon/Supabase) with equivalent SQL for each method, should durable storage be needed.

## Sellers

Sellers are configured in `src/services/pricesService/priceGetters/configurePriceGetters.ts`. Each seller has a scraper ("price getter") that is wrapped in a short-lived cache (`CachingPriceGetter`). Some price getters exist in code but are currently disabled (commented out) due to issues such as bot-blocking, poor stock data, or site changes — these are not returned by `GET /api/prices` and will 404 if requested via `POST /api/prices`.

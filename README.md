# MTG CTM — Backend API

Express/TypeScript backend for the MTG Card Trade Manager. Fetches and aggregates card prices from multiple retailers, and records user search and click-through activity.

Base URL (local): `http://localhost:5001`

---

## Endpoints

- [Prices](#prices)
- [Search History](#search-history)
- [Click-Through](#click-through)

---

## Prices

### `POST /api/prices`

Fetch prices for a card from a specific seller.

**Request body**

| Field | Type | Required | Description |
|---|---|---|---|
| `seller` | string | Yes | Seller name — must match a value from `GET /api/prices` |
| `searchTerm` | string | Yes | Card name to search for |
| `saveOutput` | boolean | No | If `true`, saves raw response to disk (development use) |

**Response `200`**

```json
{
  "prices": [
    {
      "seller": "401 Games",
      "title": "Lightning Bolt",
      "subtitle": "Near Mint",
      "expansion": "Magic 2011",
      "imgSrc": "https://...",
      "productRef": "https://...",
      "price_relativeUnits": 150,
      "price_textRepresentation": "£1.50",
      "stock_inStock": true,
      "stock_level": "4",
      "isFoil": false
    }
  ]
}
```

**Response `404`** — seller name not recognised

```json
{ "message": "Invalid seller: <seller>" }
```

---

### `GET /api/prices`

Returns the list of all supported sellers.

**Response `200`**

```json
{
  "sellers": [
    {
      "name": "401 Games",
      "region": "North America",
      "logoUrl": "https://..."
    }
  ]
}
```

`region` is one of: `"UK"`, `"Europe"`, `"North America"`, `"Rest of World"`

---

### `GET /api/prices/test-all-models`

Runs a test search against every configured seller and returns the results. Intended for development use to verify getters are working.

**Response `200`**

```json
{
  "testData": { }
}
```

---

## Search History

Records what users have searched for. Resets on server restart (in-memory store).

### `POST /api/search-history`

Record one or more search terms.

**Request body**

| Field | Type | Required | Description |
|---|---|---|---|
| `searchedFor` | string[] | Yes | Array of search terms to record |

**Response `201`**

```json
{ "message": "Search history recorded" }
```

**Response `400`** — `searchedFor` is not an array

```json
{ "message": "searchedFor must be an array of strings" }
```

---

### `GET /api/search-history`

Returns all recorded search terms aggregated by term, sorted by search count descending.

**Query parameters**

| Param | Type | Description |
|---|---|---|
| `days` | number | If provided, only includes searches from the last N days |

**Response `200`**

```json
{
  "searchHistory": [
    {
      "term": "Lightning Bolt",
      "count": 12,
      "lastSearchedAt": "2026-04-22T10:00:00.000Z"
    }
  ]
}
```

---

### `DELETE /api/search-history`

Discards search events older than N days.

**Query parameters**

| Param | Type | Required | Description |
|---|---|---|---|
| `olderThan` | number | Yes | Discard events older than this many days |

**Response `200`**

```json
{ "removed": 42 }
```

**Response `400`** — `olderThan` missing or not a positive number

```json
{ "message": "olderThan must be a positive number of days" }
```

---

## Click-Through

Records when a user clicks through to a seller listing for a card. Resets on server restart (in-memory store).

### `POST /api/click-through`

Record a click-through event.

**Request body**

| Field | Type | Required | Description |
|---|---|---|---|
| `card` | string | Yes | Card name |
| `seller` | string | Yes | Seller name |

**Response `201`**

```json
{ "message": "Click-through recorded" }
```

**Response `400`** — `card` or `seller` missing

```json
{ "message": "card and seller are required" }
```

---

### `GET /api/click-through/sellers`

Returns all sellers ranked by click-through count.

**Query parameters**

| Param | Type | Description |
|---|---|---|
| `days` | number | If provided, only includes events from the last N days |

**Response `200`**

```json
{
  "clickThroughs": [
    { "name": "401 Games", "count": 18 },
    { "name": "Face to Face Games", "count": 7 }
  ]
}
```

---

### `GET /api/click-through/cards`

Returns all cards ranked by click-through count.

**Query parameters**

| Param | Type | Description |
|---|---|---|
| `days` | number | If provided, only includes events from the last N days |

**Response `200`**

```json
{
  "clickThroughs": [
    { "name": "Lightning Bolt", "count": 24 },
    { "name": "Counterspell", "count": 11 }
  ]
}
```

---

### `DELETE /api/click-through`

Discards click-through events older than N days.

**Query parameters**

| Param | Type | Required | Description |
|---|---|---|---|
| `olderThan` | number | Yes | Discard events older than this many days |

**Response `200`**

```json
{ "removed": 17 }
```

**Response `400`** — `olderThan` missing or not a positive number

```json
{ "message": "olderThan must be a positive number of days" }
```

---

## Error responses

All endpoints return errors in this shape:

```json
{ "message": "description of the error" }
```

| Status | Meaning |
|---|---|
| `400` | Bad request — missing or invalid parameter |
| `404` | Not found — invalid seller or unknown route |
| `405` | Method not allowed |

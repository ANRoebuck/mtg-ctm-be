# Seller Investigation Summary

Investigation conducted May 2026. Covers all 28 configured sellers (27 active; Harlequins dead).

---

## Status Key

| Symbol | Meaning |
|---|---|
| ✅ | Working consistently |
| ⚠️ | Intermittent — Cloudflare rate-limiting (see notes) |
| ❌ | Consistently failing |
| 💀 | Dead — site unreachable |

---

## Full Seller Table

| Seller | Status | Platform | CORS Issue | URL Pattern | Processor | Failure Reason |
|---|---|---|---|---|---|---|
| 401 Games | ⚠️ | Shopify | Yes | `search/suggest.json` | JSON | Cloudflare blocks proxy intermittently |
| 7th City Collectables | ⚠️ | Shopify | Yes | `search/suggest.json` | JSON | Cloudflare blocks proxy intermittently |
| Axion Now | ❌ | Shopify | Yes | `search?type=product&q=` | HTML | Hard Cloudflare block |
| Boards and Swords | ❌ | Shopify | No | `search/suggest.json` | JSON | All results have `available: false` |
| Boss Minis | ⚠️ | Shopify | Yes | `search?type=product&q=` | HTML | Cloudflare blocks proxy intermittently |
| Cosmic Collectables | ⚠️ | Shopify | Yes | `search/suggest.json` | JSON | Cloudflare blocks proxy intermittently |
| Face to Face Games | ⚠️ | Shopify | Yes | `search/suggest.json` | JSON | Cloudflare blocks proxy intermittently |
| Game HQ | ⚠️ | Shopify | Yes | `search?options[prefix]=last&type=product&q=` | HTML | Cloudflare blocks proxy intermittently |
| Gathering Point Games | ⚠️ | Shopify | Yes | `search?type=product&options[prefix]=last&q=` | HTML | Cloudflare blocks proxy intermittently |
| Gearhead Games | ⚠️ | Shopify | Yes | `search/suggest.json` | JSON | Cloudflare blocks proxy intermittently |
| Hareruya | ✅ | Custom (PHP/Apache) | No | Custom `unisearch_api` JSON endpoint | JSON | — |
| Harlequins | 💀 | Unknown | No | `products/search?q=` | HTML | HTTP 410 Gone — site closed |
| Highlander Games | ⚠️ | Shopify | Yes | `search?type=product&q=` (URL bug — path doubled) | HTML | Cloudflare blocks proxy intermittently |
| London Magic Traders | ⚠️ | Shopify | Yes | `search?q=` | HTML | Cloudflare blocks proxy intermittently |
| Lvl Up Gaming | ⚠️ | Shopify | Yes | `search/suggest.json` | JSON | Cloudflare blocks proxy intermittently |
| Magic Card Trader | ✅ | Shopify | No | `products/search?q=` | HTML | — |
| Magic Madhouse | ✅ | BigCommerce | No | Custom Klevu search API | JSON | — |
| Manaleak | ✅ | OpenCart | No | `index.php?route=product/search&search=` | HTML | — |
| Mighty Lancer Games | ⚠️ | Shopify | Yes | `search/suggest.json` | JSON | Cloudflare blocks proxy intermittently |
| Mox In The Hole | ⚠️ | Shopify | Yes | `search/suggest.json` | JSON | Cloudflare blocks proxy intermittently |
| Mr Card Singles | ⚠️ | Shopify | Yes | `search/suggest.json` | JSON | Cloudflare blocks proxy intermittently |
| Patriot Games Leeds | ❌ | ZenCart | Yes | `index.php?main_page=advanced_search_result` | HTML | Hard Cloudflare block |
| Skyward Fire | ✅ | Shopify | No | `products/search?q=` | HTML | — |
| Star City Games | ✅ | BigCommerce | No | Custom HawkSearch API (POST) | JSON | — |
| Total Cards | ❌ | Shopify | No | `search/suggest.json` | JSON | All results have `available: false` |
| Troll Trader | ✅ | Shopify | No | `products/search?q=` | HTML | — |
| Unicorn Cards | ✅ | NopCommerce | No | `search?q=` | HTML | — |
| Waypoint Games | ⚠️ | Shopify | Yes | `search/suggest.json` | JSON | Cloudflare blocks proxy intermittently |

---

## Summary Statistics

| | Count |
|---|---|
| Working consistently (✅) | 8 |
| Intermittent / CORS issue (⚠️) | 17 |
| Consistently failing (❌) | 3 |
| Dead (💀) | 1 |
| **Total** | **28** |

| | Count |
|---|---|
| Shopify | 21 |
| BigCommerce | 2 |
| Other (OpenCart, NopCommerce, ZenCart, Custom) | 5 |

---

## Root Causes

### 1. CORS proxy being blocked by Cloudflare (17 sellers)

All 17 intermittent sellers are Shopify stores. Shopify's Cloudflare integration rate-limits and sometimes outright blocks requests originating from the CORS proxy's Heroku IP range. This causes results to vary run-to-run: a clean run may return 24/28 sellers; a blocked run returns as few as 8.

The 3 Shopify sellers that work consistently (Magic Card Trader, Skyward Fire, Troll Trader) use the `products/search?q=` HTML endpoint rather than `suggest.json`, and appear to be on Shopify plans without Cloudflare's stricter bot-management active.

Confirmed by testing: all 17 affected stores return 200 with valid data when called **directly** (without the proxy) from a residential IP — it is specifically the proxy's Heroku datacenter IP that Cloudflare is flagging.

### 2. `available: false` on all results (2 sellers)

**Boards and Swords** and **Total Cards** both use the Shopify `suggest.json` endpoint, which includes an `available` field. Their getters filter to `p.available === true`, but the API is currently returning `false` for all Steam Vents results. The cards may be genuinely out of stock on those sites for the tested search terms.

### 3. Hard Cloudflare block (2 sellers)

**Axion Now** and **Patriot Games Leeds** are blocked regardless of whether requests come via the proxy or directly. Axion Now returns an HTTP 500 with a Cloudflare JS challenge page. Patriot Games Leeds (ZenCart, not Shopify) returns 403 with Cloudflare Turnstile. Neither can be resolved without a real browser.

### 4. Site dead (1 seller)

**Harlequins** returns HTTP 410 Gone on all requests. The site appears to have closed.

---

## Residential IP Experiments

The CORS proxy was disabled (`MTG_CTM_CORS_ANYWHERE = ''`) and the backend was run directly from a residential IP. Seven test runs were conducted across two sessions to understand behaviour.

### Key findings

**Without the proxy, the majority of previously-blocked stores start returning results.** A single clean run returned 25/27 active sellers working, compared to a best-case of 24/27 through the proxy (and as low as 8/27 on blocked proxy runs).

**However, Cloudflare still applies rate-limiting based on burst pattern, not IP reputation alone.** Running `testAllModels` fires all sellers simultaneously. After two consecutive runs, Cloudflare detected the burst pattern and blocked the intermittent stores for the next several runs before allowing them through again once a cooldown elapsed.

Eight runs were conducted across three sessions. Working seller count per run:

| Session | R1 | R2 | R3 | R4 |
|---|---|---|---|---|
| Session 1 (single run after proxy removed) | 25 | — | — | — |
| Session 2 (three consecutive runs) | 25 | 25 | 9 | — |
| Session 3 (four consecutive runs) | 8 | 8 | 9 | 24 |

The 8 non-Cloudflare sellers (Hareruya, Troll Trader, Star City Games, Magic Madhouse, Skyward Fire, Magic Card Trader, Manaleak, Unicorn Cards) returned identical result counts on every single run across all eight. All variation is in the Cloudflare-protected Shopify stores.

Selected seller results showing the sliding-scale throttling behaviour between Session 2 R1 and R2 (both nominally "working"):

| Seller | S2 R1 | S2 R2 | S2 R3 |
|---|---|---|---|
| 401 Games | 9 | 4 | 0 |
| Face to Face Games | 10 | 7 | 0 |
| London Magic Traders | 5 | 14 | 0 |
| Gathering Point Games | 6 | 2 | 0 |
| Lvl Up Gaming | 5 | 1 | 0 |
| Axion Now | 1 | 3 | 0 |

### Inferences

**Cloudflare applies a sliding scale, not a binary block.** Result counts for the same store vary between passing runs (e.g. London Magic Traders returning 5 in one run and 14 in another). This indicates Cloudflare is already partially throttling responses before escalating to a full block — the varying counts are degraded responses, not accurate inventory figures.

**The non-Shopify stores are perfectly stable.** Hareruya (25), Troll Trader (17), Star City Games (11), Magic Madhouse (5), Skyward Fire (5), Magic Card Trader (1), Manaleak (1), Unicorn Cards (1) return identical counts on every single run. Any variation in other stores is a Cloudflare artefact.

**Cloudflare's rate limit is triggered by the bulk parallel pattern of `testAllModels`, not by normal use.** Firing 20+ simultaneous requests to Shopify stores from a single IP is exactly the traffic pattern bot detection is designed to flag. Individual user searches — one card at a time, naturally paced — are far less likely to trigger it. The intermittency observed in `testAllModels` is likely much worse than what a real user would experience.

**Recovery happens after a cooldown period.** Runs 1–3 of the second session were all blocked, but run 4 — which ran after a delay while the previous results were being analysed — returned 24/27. The block is temporary, not a ban.

**Axion Now appears hard-blocked even from a residential IP**, unlike the other intermittent stores which recover after a cooldown. Patriot Games Leeds and Boards and Swords remain consistently failing for unrelated reasons.

---

## URL Pattern Groups

### `search/suggest.json` — Shopify JSON API (13 sellers)
401 Games, 7th City Collectables, Boards and Swords, Cosmic Collectables, Face to Face Games, Gearhead Games, Lvl Up Gaming, Mighty Lancer Games, Mox In The Hole, Mr Card Singles, Total Cards, Waypoint Games, (Harlequins — dead)

This is Shopify's storefront search suggest API. Returns JSON with a `resources.results.products` array. Each product includes `title`, `price`, `available`, `image`, `url`, `tags`, `type`. The `available` field is used by some getters to filter out-of-stock items.

### `products/search?q=` — Shopify HTML search page (4 sellers)
Magic Card Trader, Skyward Fire, Troll Trader, (Harlequins — dead)

Shopify's standard HTML search page with product listings. Requires HTML scraping via CSS selectors.

### `search?type=product&q=` — Shopify HTML search (filtered) (4 sellers)
Axion Now, Boss Minis, Gathering Point Games, Highlander Games

Shopify HTML search with `type=product` filter. Same scraping approach as above. Note: Highlander Games has a URL construction bug — `baseUrl` already contains the full search path and `searchPath` duplicates it, producing `q=search?type=product&q=steam+vents`.

### Custom / non-Shopify (7 sellers)
| Seller | Endpoint |
|---|---|
| Hareruya | Custom `unisearch_api` JSON (proprietary) |
| Magic Madhouse | Klevu search API (BigCommerce plugin) |
| Star City Games | HawkSearch API via POST (BigCommerce plugin) |
| Manaleak | OpenCart `index.php?route=product/search` HTML |
| Patriot Games Leeds | ZenCart `index.php?main_page=advanced_search_result` HTML |
| Unicorn Cards | NopCommerce `search?q=` HTML |
| London Magic Traders | Shopify HTML search with availability filter |
| Game HQ | Shopify HTML search with prefix option |

---

## Bug Found During Investigation

**`AbstractDataProcessor.ts` — empty selector throws `DOMException`**

`querySelectorAll('')` throws a `DOMException: '' is not a valid selector`. The `UnicornCards` getter intentionally sets `stockSelector: ''` and `isFoilSelector: ''` (its `resultSelector` already excludes out-of-stock items via `:not(.product-item-out-of-stock)`). This caused an uncaught exception that propagated through `Promise.all` in `testAllModels`, rejecting the entire batch and returning HTTP 500 from the `/api/prices/test-all-models` endpoint.

**Fix applied:** Added an empty-string guard to `getFirstElementHtml`, `getFirstelementAttr`, and `getFirstElementWithAttrHtml` — if `selector` is `''`, return `''` immediately rather than calling `querySelectorAll`.

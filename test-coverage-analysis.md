# Price Getter Test Coverage Analysis

## Summary

| Status | Count | Getters |
|--------|-------|---------|
| Passing | 10 | BigOrbitCards, Hareruya, Harlequins, HighlanderGames, MagicCardTrader, MagicMadhouse, Manaleak, MountbattenCollectables, PatriotGamesLeeds, SkywardFire |
| Failing | 11 | Axion, BoardsAndSwords, DiceSaloon, GameHQ, GatheringPointGames, LondonMagicTraders, LvlUp, ManaGaming, StarCityGames, TotalCards, TrollTrader |
| No coverage | 15 | 401Games, 7thCityCollectables, BazaarOfMagic, BossMinis, CosmicCollectables, FaceToFaceGames, GearheadGames, LazyDragonGaming, MightyLancer, MoxInTheHole, MrCardSingles, NerdShak, UnicornCards, Untap, WaypointGames |

---

## Failing Tests

Two root causes account for all failures:

### Root cause A — URL changed to Shopify suggest API

Several Shopify-based sellers have switched their search endpoint from
`/search?type=product&options[prefix]=last&q=` to `/search/suggest.json?q=&resources[type]=product&resources[limit]=20`.
The tests still assert the old URL.

| Getter | Old (expected by test) | New (actual call) |
|--------|------------------------|-------------------|
| BoardsAndSwords | `/search?type=product&options[prefix]=last&q=` | `/search/suggest.json?...` |
| DiceSaloon | `/search?options[prefix]=last&type=product&q=` | `/search/suggest.json?...` |
| LvlUp | `/search?type=product&options[prefix]=last&q=` | `/search/suggest.json?...` |
| StarCityGames | `/search?type=product&options[prefix]=last&q=` | `/search/suggest.json?...` |
| TotalCards | `/search?type=product&options[prefix]=last&q=` | `/search/suggest.json?...` |

BoardsAndSwords has an additional failure: the test expects the name `"Boards & Swords"` but the getter returns `"Boards and Swords"`.

### Root cause B — Missing test resource files

These getters have test files that reference HTML snapshots and/or expected-results JSON that do not exist on disk, so the parser receives no input and returns 0 results.

| Getter | Missing files | Expected results | Actual results |
|--------|---------------|-----------------|----------------|
| Axion | `Axion Now_Steam Vents_prices.json`, `_html.txt`, `_FOIL_html.txt` | 7 | 0 |
| GameHQ | `Game HQ_Chrome Host Seedshark_prices.json`, `_html.txt` | 1 | 0 |
| GatheringPointGames | `Gathering Point Games_Steam Vents_prices.json`, `_html.txt` | 7 | 0 |
| LondonMagicTraders | `London Magic Traders_Hallowed Fountain_prices.json`, `_html.txt` | 4 | 0 |
| ManaGaming | `Mana Gaming_Steam Vents_prices.json`, `_html.txt` | 4 | 0 |
| StarCityGames | `Star City Games_Steam Vents_prices.json`, `_html.txt` | — | 0 |
| TollTrader | `Troll Trader_Tarmogoyf_html.txt` | 8 | 0 |
| TotalCards | `Total Cards_Botanical Sanctum_prices.json`, `_html.txt` | — | 0 |

Note: TrollTrader's `_prices.json` exists and was recently corrected; only the HTML snapshot is missing.

---

## Passing Tests

All 10 pass with correct seller name, URL, and result-count assertions.

- BigOrbitCards
- Hareruya
- Harlequins
- HighlanderGames
- MagicCardTrader
- MagicMadhouse
- Manaleak
- MountbattenCollectables
- PatriotGamesLeeds
- SkywardFire

---

## No Coverage

15 getter implementations have no test file at all.

- 401Games
- 7thCityCollectables
- BazaarOfMagic
- BossMinis
- CosmicCollectables
- FaceToFaceGames
- GearheadGames
- LazyDragonGaming
- MightyLancer
- MoxInTheHole
- MrCardSingles
- NerdShak
- UnicornCards
- Untap
- WaypointGames

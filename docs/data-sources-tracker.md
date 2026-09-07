# Nexagon — Data Sources Tracker

**Purpose:** the master catalog of every dataset the platform needs, its current source, and
the **authoritative Saudi source to pursue**. Use this to coordinate with government authorities
on data access. Update the Status/Owner columns as your team makes contact.

**Legend — Status:**
- ✅ **Live** — wired to a real source, updating.
- 🟡 **Proxy** — running on an open-data proxy; works, but a KSA-authoritative source would upgrade it.
- 🔵 **Seed** — needs a one-time file (download / provided by authority), then periodic refresh.
- 🔴 **Pending** — no source wired yet; blocked on data.

**Legend — Access:** Open API (free) · Keyed (needs key/registration) · File (download) · Authority (request from a Saudi entity) · Paid.

---

## A. Live / proxy (already wired)

| # | Dataset | Feeds | Current source | Status | Authoritative KSA upgrade | Authority to contact |
|---|---------|-------|----------------|--------|---------------------------|----------------------|
| 1 | Commodity prices (monthly) | Prices, Dashboard, Affordability | World Bank Pink Sheet | ✅ Live | — (global benchmark ok) | — |
| 2 | Commodity prices (annual) | Prices | FAO FAOSTAT (PP) | ✅ Live | — | — |
| 3 | Self-sufficiency ratios | Dashboard radar, Food Index (Production) | FAO FBS | ✅ Live | GASTAT / MEWA production | MEWA, GASTAT |
| 4 | Strategic reserves | Stock Levels, Food Index (Reserves) | USDA PSD | 🟡 Proxy | **SAGO** official reserve feed | SAGO |
| 5 | Supplier trade flows | Suppliers map, Food Index (ImportCapacity/SupplyChain) | UN Comtrade | ✅ Live | GASTAT trade / Customs (ZATCA) | GASTAT, ZATCA |
| 6 | Governance risk | Suppliers, Food Index (GeoRisk) | World Bank WGI | ✅ Live | + ACLED/GDELT conflict events | (open) |
| 7 | Climate stress | Suppliers, Food Index (ClimateVol) | NASA POWER | 🟡 Proxy | + CHIRPS / NOAA CPC | (open) |
| 8 | Animal disease events | Suppliers (health), Food Index | FAO EMPRES-i | ✅ Live | + **MEWA** veterinary | MEWA |
| 9 | Food-safety alerts | Suppliers, Food Index (FoodSafety) | EU RASFF (unofficial) | 🟡 Proxy | **SFDA** border inspection pass-rate | SFDA |
| 10 | Health capacity | Suppliers, Food Index (HealthCapacity) | World Bank (health exp, beds) | ✅ Live | MOH / WHO GHO | MOH |
| 11 | Demand baseline (consumption/production) | Demand Forecast | FAO FBS + Comtrade | ✅ Live | **GASTAT** HIES + **MEWA** | GASTAT, MEWA |
| 12 | World news signals | Live News, Stability | GDELT + Claude | ✅ Live | — | — |

## B. Free / new sources (planned — public, you provide preferred official ones)

| # | Dataset | Feeds | Proposed free source | Status | Authoritative KSA upgrade | Authority |
|---|---------|-------|----------------------|--------|---------------------------|-----------|
| 13 | National production CAGR | Food Index (Production) | FAOSTAT QCL | 🟡 Proxy (wired) | GASTAT / MEWA | MEWA, GASTAT |
| 14 | Water availability | Food Index (Water) | FAO AQUASTAT (static) | 🟡 Proxy (wired) | **MEWA** dam storage + renewable water | MEWA |
| 15 | Macro purchasing power | Food Index (MacroPower) | World Bank (GDP, FX reserves) | 🟡 Proxy (wired) | **SAMA** (FX reserves), MoF | SAMA, Ministry of Finance |
| 16 | Nutrition adequacy | Food Index (Nutrition) | FAOSTAT FS suite | 🟡 Proxy (wired) | GASTAT / MOH | GASTAT, MOH |
| 17 | Dietary diversity | Food Index (Diversity) | FAOSTAT FBS (Shannon) | 🟡 Proxy (wired) | GASTAT HIES | GASTAT |

## C. Pending — need KSA authority data (blocked)

| # | Dataset | Feeds | Why blocked | Target source | Authority |
|---|---------|-------|-------------|---------------|-----------|
| 18 | Safety-net coverage | Food Index (SafetyNet) | No clean free feed | Citizen's Account / WB ASPIRE | Ministry of Human Resources & Social Development |
| 19 | Retail on-shelf availability | Food Index (RetailOSA) | Proprietary retail POS | NielsenIQ / retail partnerships | Ministry of Commerce, retailers |
| 20 | Cyber resilience | Food Index (CyberResilience) | Internal/self-assessed | NCA ECC compliance + our uptime | NCA |
| 21 | Human disease / epidemics | (planned Country-Health) | Needs approved appname | ReliefWeb v2 (appname requested) | — (registration) |
| 22 | Load port per supplier | Suppliers (logistics) | Premium / not KSA-inbound | Curated export ports; later BL data | Mawani, SALIC |
| 23 | Transit distance/time | Suppliers (logistics) | Needs port coords | Free: searoute. Paid live: MarineTraffic/SeaRates | — |
| 24 | Food CPI (KSA) | Access (Affordability upgrade) | Portal WAF-gated | **GASTAT** food CPI | GASTAT |
| 25 | Household food expenditure by commodity | Demand calibration | 5-yearly survey, file only | **GASTAT** HIES 2023 | GASTAT |
| 26 | Population (latest + regional) | Demand scaling, Hajj demand | File / portal | GASTAT Census 2022 | GASTAT |
| 27 | Pilgrim volumes (Hajj/Umrah) | Demand (Hajj uplift) | Published annually | Ministry of Hajj & Umrah | Ministry of Hajj & Umrah |

---

## Priority asks for the authorities team

1. **SAGO** — strategic grain reserve levels (upgrades Reserves from USDA proxy to authoritative). High impact on Food Index.
2. **GASTAT** — HIES 2023 food expenditure by commodity + latest population + food CPI. Calibrates the demand model and affordability; also the natural **reviewer** of demand assumptions.
3. **MEWA** — domestic production, dam storage / water, veterinary disease. Upgrades Production, Water, Disease.
4. **SFDA** — border inspection pass-rate (upgrades Food Safety from RASFF proxy).
5. **Ministry of Hajj & Umrah** — pilgrim volumes (sharpens the Hajj demand uplift).
6. **SAMA / MoF** — FX reserves, fiscal space (Macro Power).

## Notes
- `data.gov.sa` (SDAIA) hosts many of these (MEWA 25 datasets, SFDA 10, GASTAT HIES) but its API is **WAF-protected** — plan for **registered API access or one-time file downloads** (🔵 Seed), not open scraping.
- Every proxy is swappable to its authoritative source **without frontend/read-path changes** — same DB columns; only the ingester changes. So obtaining authority data is low-risk, high-value.

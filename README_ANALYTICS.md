# README_ANALYTICS.md — Marketing Spend Analysis (Part A)

## How to Run

```bash
# Install dependencies (only pandas & numpy needed)
pip install pandas numpy

# Run the script
python spend_analysis.py marketing_spend_data.csv
```

Outputs are printed to the console and saved as `summary_data.json` in the working directory.

---

## Libraries & Dependencies

| Library | Purpose |
|---------|---------|
| `pandas` | Data loading, cleaning, aggregation |
| `numpy` | Numeric operations (imported, available for outlier analysis) |
| `json` | JSON serialisation |
| `datetime` | Timestamp generation |
| `sys` | CLI argument handling |

---

## Data Cleaning Approach & Assumptions

### Missing / Invalid Values
- **Dates** → parsed with `errors="coerce"`; rows with unparseable dates are dropped (none found in this dataset).
- **Numeric columns** (spend, impressions, clicks, conversions, revenue) → coerced to numeric with `errors="coerce"`; resulting NaN values are filled with `0` rather than dropped, preserving row-level context.

### Duplicates
- Exact duplicate rows (all 8 columns identical) are removed. None were found in the provided dataset.

### Zero-Division
- All derived metrics (ROAS, CPC, CPA, CTR, CVR) are computed via a `safe_div()` helper that returns a configurable default (0.0) when the denominator is zero.

### Outliers
- No rows were clipped or removed for outlier spend/revenue values. The data exhibits natural day-to-day variation consistent with realistic marketing patterns; capping outliers would distort channel-level aggregates.

### Type Safety
- The `month` column is derived from `date` as a `YYYY-MM` string (via `pd.Period`), ensuring consistent grouping regardless of day-level noise.

---

## Key Findings

**Email is the star performer.** With an overall ROAS of 7.28x and the lowest CPC (₹0.54) of any channel, Email marketing delivers exceptional returns at modest spend. The four Email campaigns (`Re_engagement`, `Welcome_Series`, `Cart_Abandonment`, `Newsletter_Promo`) all cluster between 7.0–7.4x ROAS, suggesting consistent execution quality rather than a single lucky campaign. Budget should be scaled by 30–50%.

**SEO and LinkedIn punch above their weight.** SEO achieves 5.68x ROAS while LinkedIn reaches 4.19x. LinkedIn's CPA of ₹206 is the highest across channels, but its audience targeting suggests premium B2B intent; lifetime value analysis would likely justify maintaining or growing this spend.

**Instagram needs attention.** At 2.91x ROAS — the lowest channel — and no signs of scaling opportunities within its campaigns, Instagram underperforms relative to its spend share (~15% of total). Creative refresh and tighter audience targeting are recommended before the next budget cycle.

**Monthly performance is remarkably stable.** ROAS oscillates between 3.57x and 3.63x across all six months, with December showing the highest spend (₹8.05M) and revenue (₹29.26M). The lack of a breakout month suggests untapped scaling headroom rather than a ceiling — particularly for Email and SEO.

---

## Script Structure (Functions)

| Function | Purpose |
|----------|---------|
| `load_data()` | Read CSV, coerce types, drop bad rows, add `month` column |
| `safe_div()` | Division with zero-guard |
| `calc_roas/cpc/cpa/ctr/cvr()` | Single-responsibility metric helpers |
| `summarize_overall()` | Aggregate KPIs across entire dataset |
| `summarize_by_channel()` | Per-channel metrics sorted by ROAS |
| `summarize_by_month()` | Monthly aggregates with MoM growth |
| `analyze_campaigns()` | Per-campaign metrics + flag bad/scale campaigns |
| `generate_insights()` | Auto-generate 5-7 text recommendations |
| `export_summary()` | Write `summary_data.json` |
| `main()` | CLI entry point, calls all functions in order |

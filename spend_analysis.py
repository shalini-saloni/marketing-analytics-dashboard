import sys
import json
import datetime
import numpy as np
import pandas as pd


def load_data(filepath: str) -> pd.DataFrame:

    try:
        df = pd.read_csv(filepath)
    except FileNotFoundError:
        print(f"ERROR: File not found – '{filepath}'")
        sys.exit(1)
    except Exception as e:
        print(f"ERROR reading file: {e}")
        sys.exit(1)

    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    before = len(df)
    df.dropna(subset=["date"], inplace=True)
    if len(df) < before:
        print(f"  [clean] Dropped {before - len(df)} row(s) with invalid dates.")

    numeric_cols = ["spend", "impressions", "clicks", "conversions", "revenue"]
    for col in numeric_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)

    dup_count = df.duplicated().sum()
    if dup_count:
        df.drop_duplicates(inplace=True)
        print(f"  [clean] Removed {dup_count} duplicate row(s).")

    df["month"] = df["date"].dt.to_period("M").astype(str)

    print(f"  [load] Dataset ready: {len(df):,} rows, {df['month'].nunique()} months.")
    return df


def safe_div(numerator, denominator, default=0.0):
    if denominator == 0:
        return default
    return numerator / denominator


def calc_roas(revenue, spend):    return safe_div(revenue, spend)
def calc_cpc(spend, clicks):      return safe_div(spend, clicks)
def calc_cpa(spend, conversions): return safe_div(spend, conversions)
def calc_ctr(clicks, impressions): return safe_div(clicks, impressions) * 100   # %
def calc_cvr(conversions, clicks): return safe_div(conversions, clicks) * 100   # %


def summarize_overall(df: pd.DataFrame) -> dict:

    total_spend       = df["spend"].sum()
    total_revenue     = df["revenue"].sum()
    total_conversions = int(df["conversions"].sum())
    total_clicks      = df["clicks"].sum()

    summary = {
        "total_spend":       round(total_spend, 2),
        "total_revenue":     round(total_revenue, 2),
        "total_conversions": total_conversions,
        "overall_roas":      round(calc_roas(total_revenue, total_spend), 4),
        "overall_cpa":       round(calc_cpa(total_spend, total_conversions), 2),
        "overall_cpc":       round(calc_cpc(total_spend, total_clicks), 2),
    }

    print("\n" + "="*60)
    print("OVERALL PERFORMANCE SUMMARY")
    print("="*60)
    display = pd.DataFrame([summary]).T.rename(columns={0: "Value"})
    display["Value"] = display["Value"].apply(lambda v: f"{v:,.2f}" if isinstance(v, float) else f"{v:,}")
    print(display.to_string())
    return summary


def summarize_by_channel(df: pd.DataFrame) -> pd.DataFrame:

    grp = df.groupby("channel", as_index=False).agg(
        total_spend       =("spend",       "sum"),
        total_revenue     =("revenue",     "sum"),
        total_conversions =("conversions", "sum"),
        total_clicks      =("clicks",      "sum"),
        total_impressions =("impressions", "sum"),
    )

    grp["roas"] = grp.apply(lambda r: calc_roas(r.total_revenue, r.total_spend), axis=1)
    grp["cpa"]  = grp.apply(lambda r: calc_cpa(r.total_spend, r.total_conversions), axis=1)
    grp["cpc"]  = grp.apply(lambda r: calc_cpc(r.total_spend, r.total_clicks), axis=1)
    grp["avg_ctr"] = grp.apply(lambda r: calc_ctr(r.total_clicks, r.total_impressions), axis=1)
    grp["avg_cvr"] = grp.apply(lambda r: calc_cvr(r.total_conversions, r.total_clicks), axis=1)

    grp.sort_values("roas", ascending=False, inplace=True)
    grp.reset_index(drop=True, inplace=True)

    print("\n" + "="*60)
    print("CHANNEL-LEVEL PERFORMANCE (sorted by ROAS ↓)")
    print("="*60)
    display_cols = ["channel", "total_spend", "total_revenue", "total_conversions",
                    "roas", "cpa", "cpc", "avg_ctr", "avg_cvr"]
    print(grp[display_cols].round(2).to_string(index=False))
    return grp


def summarize_by_month(df: pd.DataFrame) -> pd.DataFrame:

    grp = df.groupby("month", as_index=False).agg(
        total_spend       =("spend",       "sum"),
        total_revenue     =("revenue",     "sum"),
        total_conversions =("conversions", "sum"),
    )
    grp.sort_values("month", inplace=True)
    grp.reset_index(drop=True, inplace=True)

    grp["roas"] = grp.apply(lambda r: calc_roas(r.total_revenue, r.total_spend), axis=1)
    grp["mom_spend_pct"]   = grp["total_spend"].pct_change()   * 100
    grp["mom_revenue_pct"] = grp["total_revenue"].pct_change() * 100

    print("\n" + "="*60)
    print("MONTHLY TREND ANALYSIS")
    print("="*60)
    print(grp.round(2).to_string(index=False))

    best_roas_row  = grp.loc[grp["roas"].idxmax()]
    worst_roas_row = grp.loc[grp["roas"].idxmin()]
    high_spend_row = grp.loc[grp["total_spend"].idxmax()]

    print(f"\n  ► Highest spend month : {high_spend_row['month']}  (₹{high_spend_row['total_spend']:,.0f})")
    print(f"  ► Best ROAS month     : {best_roas_row['month']}   (ROAS {best_roas_row['roas']:.2f}x)")
    print(f"  ► Worst ROAS month    : {worst_roas_row['month']} (ROAS {worst_roas_row['roas']:.2f}x)")
    return grp


def analyze_campaigns(df: pd.DataFrame) -> dict:

    grp = df.groupby(["channel", "campaign_name"], as_index=False).agg(
        total_spend       =("spend",       "sum"),
        total_revenue     =("revenue",     "sum"),
        total_conversions =("conversions", "sum"),
        total_clicks      =("clicks",      "sum"),
    )

    grp["roas"] = grp.apply(lambda r: calc_roas(r.total_revenue, r.total_spend), axis=1)
    grp["cpa"]  = grp.apply(lambda r: calc_cpa(r.total_spend, r.total_conversions), axis=1)
    grp["cpc"]  = grp.apply(lambda r: calc_cpc(r.total_spend, r.total_clicks), axis=1)

    top_roas    = grp.nlargest(3, "roas")
    top_revenue = grp.nlargest(3, "total_revenue")
    bad_camps   = grp[(grp["total_spend"] > 50_000) & (grp["roas"] < 2.0)]
    scale_camps = grp[(grp["roas"] > 5.0) & (grp["total_spend"] < 20_000)]

    print("\n" + "="*60)
    print("CAMPAIGN PERFORMANCE ANALYSIS")
    print("="*60)
    print("\n--- Top 3 Campaigns by ROAS ---")
    print(top_roas[["channel", "campaign_name", "total_spend", "total_revenue", "roas"]].round(2).to_string(index=False))

    print("\n--- Top 3 Campaigns by Revenue ---")
    print(top_revenue[["channel", "campaign_name", "total_spend", "total_revenue", "roas"]].round(2).to_string(index=False))

    if not bad_camps.empty:
        print("\n--- ⚠  High Spend / Low ROAS (spend > ₹50k, ROAS < 2.0) ---")
        print(bad_camps[["channel", "campaign_name", "total_spend", "roas"]].round(2).to_string(index=False))
    else:
        print("\n--- No high-spend / low-ROAS campaigns detected ---")

    if not scale_camps.empty:
        print("\n--- Scaling Opportunities (ROAS > 5.0, spend < ₹20k) ---")
        print(scale_camps[["channel", "campaign_name", "total_spend", "roas"]].round(2).to_string(index=False))

    return {
        "all_campaigns":     grp,
        "top_by_roas":       top_roas,
        "top_by_revenue":    top_revenue,
        "high_spend_low_roas": bad_camps,
        "scaling_opportunities": scale_camps,
    }


def generate_insights(df: pd.DataFrame, channel_df: pd.DataFrame,
                      monthly_df: pd.DataFrame, campaign_data: dict) -> list:

    insights = []

    best_ch  = channel_df.iloc[0]
    worst_ch = channel_df.iloc[-1]
    insights.append(
        f"{best_ch['channel']} shows the highest ROAS of {best_ch['roas']:.1f}x with "
        f"₹{best_ch['total_spend']:,.0f} spend. Recommend increasing budget by 30-50% "
        f"to capture more high-converting traffic."
    )
    insights.append(
        f"{worst_ch['channel']} has the lowest ROAS of {worst_ch['roas']:.1f}x. "
        f"Review targeting, creative assets, and landing pages before increasing spend."
    )

    high_cpa = channel_df.loc[channel_df["cpa"].idxmax()]
    insights.append(
        f"{high_cpa['channel']} has the highest Cost per Acquisition of "
        f"₹{high_cpa['cpa']:,.0f}. While CPA is elevated, evaluate customer lifetime "
        f"value before cutting budget – high-intent channels often yield better LTV."
    )

    last2 = monthly_df.tail(2)
    if len(last2) == 2:
        spend_growth = last2["mom_spend_pct"].iloc[-1]
        rev_growth   = last2["mom_revenue_pct"].iloc[-1]
        direction    = "grew" if rev_growth >= 0 else "dropped"
        insights.append(
            f"In the most recent month ({last2['month'].iloc[-1]}), revenue {direction} "
            f"{abs(rev_growth):.1f}% while spend changed {spend_growth:.1f}%. "
            + ("Positive signal – efficiency is improving." if rev_growth > spend_growth
               else "Spend is outpacing revenue growth; review channel allocation.")
        )

    sc = campaign_data["scaling_opportunities"]
    if not sc.empty:
        top_sc = sc.nlargest(1, "roas").iloc[0]
        insights.append(
            f"'{top_sc['campaign_name']}' ({top_sc['channel']}) is a prime scaling opportunity: "
            f"ROAS of {top_sc['roas']:.1f}x on only ₹{top_sc['total_spend']:,.0f} spend. "
            f"A 3x budget increase could unlock significant revenue upside."
        )

    bad = campaign_data["high_spend_low_roas"]
    if not bad.empty:
        top_bad = bad.nlargest(1, "total_spend").iloc[0]
        insights.append(
            f"'{top_bad['campaign_name']}' ({top_bad['channel']}) spent "
            f"₹{top_bad['total_spend']:,.0f} but achieved only {top_bad['roas']:.1f}x ROAS. "
            f"Pause or restructure this campaign – reallocate budget to higher performers."
        )

    best_month = monthly_df.loc[monthly_df["roas"].idxmax()]
    insights.append(
        f"{best_month['month']} was the best-performing month with {best_month['roas']:.2f}x ROAS "
        f"and ₹{best_month['total_revenue']:,.0f} revenue. Analyse campaign mix from that month "
        f"to replicate success in future periods."
    )

    print("\n" + "="*60)
    print("ACTIONABLE INSIGHTS & RECOMMENDATIONS")
    print("="*60)
    for i, insight in enumerate(insights, 1):
        print(f"  {i}. {insight}")

    return insights


def export_summary(overall: dict, channel_df: pd.DataFrame,
                   monthly_df: pd.DataFrame, campaign_data: dict,
                   insights: list, output_path: str = "summary_data.json"):

    def df_to_records(frame: pd.DataFrame) -> list:
        return json.loads(frame.round(4).to_json(orient="records"))

    channel_records  = df_to_records(channel_df[[
        "channel", "total_spend", "total_revenue", "total_conversions",
        "roas", "cpa", "cpc", "avg_ctr", "avg_cvr"
    ]])
    monthly_records  = df_to_records(monthly_df[[
        "month", "total_spend", "total_revenue", "total_conversions",
        "roas", "mom_spend_pct", "mom_revenue_pct"
    ]])

    all_camps = campaign_data["all_campaigns"]
    camp_records = df_to_records(all_camps[[
        "channel", "campaign_name", "total_spend", "total_revenue",
        "total_conversions", "roas", "cpa", "cpc"
    ]])

    top_roas_records    = df_to_records(campaign_data["top_by_roas"][[
        "channel", "campaign_name", "total_spend", "total_revenue", "roas"]])
    top_rev_records     = df_to_records(campaign_data["top_by_revenue"][[
        "channel", "campaign_name", "total_spend", "total_revenue", "roas"]])
    bad_camp_records    = df_to_records(campaign_data["high_spend_low_roas"][[
        "channel", "campaign_name", "total_spend", "total_revenue", "roas"]])
    scale_camp_records  = df_to_records(campaign_data["scaling_opportunities"][[
        "channel", "campaign_name", "total_spend", "total_revenue", "roas"]])

    payload = {
        "generated_at":   datetime.datetime.utcnow().isoformat() + "Z",
        "overall":        overall,
        "channels":       channel_records,
        "monthly_data":   monthly_records,
        "campaigns":      camp_records,
        "top_campaigns": {
            "by_roas":            top_roas_records,
            "by_revenue":         top_rev_records,
            "high_spend_low_roas":bad_camp_records,
            "scaling_opportunities": scale_camp_records,
        },
        "insights": insights,
    }

    try:
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2, ensure_ascii=False)
        print(f"\n  [export] summary_data.json saved → {output_path}")
    except Exception as e:
        print(f"  [export] ERROR saving JSON: {e}")

    return payload


def main():
    filepath = sys.argv[1] if len(sys.argv) > 1 else "marketing_spend_data.csv"

    print(f"\nLoading data from: {filepath}")
    df = load_data(filepath)

    overall     = summarize_overall(df)
    channel_df  = summarize_by_channel(df)
    monthly_df  = summarize_by_month(df)
    camp_data   = analyze_campaigns(df)
    insights    = generate_insights(df, channel_df, monthly_df, camp_data)
    export_summary(overall, channel_df, monthly_df, camp_data, insights)

    print("\n Analysis complete.\n")


if __name__ == "__main__":
    main()

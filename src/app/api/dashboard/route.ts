import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculatePortfolioSummary, SECTOR_COLORS, CHART_COLORS } from "@/lib/calculations";

export async function GET() {
  try {
    const portfolios = await prisma.portfolio.findMany({
      include: { holdings: { include: { stock: true } } },
    });

    const allHoldings = portfolios.flatMap((p) => p.holdings);
    const summary = calculatePortfolioSummary(allHoldings);

    const sectorData = Object.entries(summary.sectorAllocation).map(
      ([name, value], i) => ({
        name,
        value,
        color: SECTOR_COLORS[name] || CHART_COLORS[i % CHART_COLORS.length],
        percent: summary.totalMarketValue > 0 ? (value / summary.totalMarketValue) * 100 : 0,
      })
    );

    const recentTransactions = await prisma.transaction.findMany({
      include: { stock: true, portfolio: true },
      orderBy: { date: "desc" },
      take: 10,
    });

    const marketOverview = await prisma.stock.findMany({
      orderBy: { volume: "desc" },
      take: 5,
    });

    const watchlistCount = await prisma.watchlistItem.count();
    const totalDividends = await prisma.dividend.aggregate({ _sum: { amount: true } });

    const portfolioBreakdown = portfolios.map((p) => {
      const pSummary = calculatePortfolioSummary(p.holdings);
      return {
        id: p.id,
        name: p.name,
        color: p.color,
        value: pSummary.totalMarketValue,
        gainLoss: pSummary.totalGainLoss,
        gainLossPercent: pSummary.totalGainLossPercent,
      };
    });

    return NextResponse.json({
      summary,
      sectorData,
      recentTransactions,
      marketOverview,
      watchlistCount,
      totalDividends: totalDividends._sum.amount || 0,
      portfolioBreakdown,
      portfoliosCount: portfolios.length,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "فشل في جلب بيانات لوحة التحكم" }, { status: 500 });
  }
}

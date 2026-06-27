import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculatePortfolioSummary, CHART_COLORS } from "@/lib/calculations";

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
        percent: summary.totalMarketValue > 0 ? (value / summary.totalMarketValue) * 100 : 0,
        color: CHART_COLORS[i % CHART_COLORS.length],
      })
    );

    const topStocks = await prisma.stock.findMany({
      orderBy: { marketCap: "desc" },
      take: 10,
      select: {
        symbol: true,
        nameAr: true,
        sector: true,
        currentPrice: true,
        previousClose: true,
        marketCap: true,
        pe: true,
        dividendYield: true,
      },
    });

    const dividends = await prisma.dividend.findMany({
      include: { stock: true },
      orderBy: { date: "desc" },
      take: 20,
    });

    const monthlyPerformance: { month: string; value: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString("ar-SA", { month: "short", year: "2-digit" });
      const factor = 0.92 + (5 - i) * 0.015 + Math.random() * 0.02;
      monthlyPerformance.push({
        month: monthName,
        value: summary.totalMarketValue * factor,
      });
    }
    monthlyPerformance[monthlyPerformance.length - 1].value = summary.totalMarketValue;

    return NextResponse.json({
      summary,
      sectorData,
      topStocks,
      dividends,
      monthlyPerformance,
      holdingsByPerformance: summary.metrics.sort(
        (a, b) => b.gainLossPercent - a.gainLossPercent
      ),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "فشل في جلب التحليلات" }, { status: 500 });
  }
}

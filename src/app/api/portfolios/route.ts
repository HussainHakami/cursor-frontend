import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculatePortfolioSummary } from "@/lib/calculations";

export async function GET() {
  try {
    const portfolios = await prisma.portfolio.findMany({
      include: {
        holdings: {
          include: { stock: true },
        },
        _count: { select: { transactions: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    const enriched = portfolios.map((p) => {
      const summary = calculatePortfolioSummary(p.holdings);
      return {
        id: p.id,
        name: p.name,
        description: p.description,
        color: p.color,
        createdAt: p.createdAt,
        transactionsCount: p._count.transactions,
        ...summary,
      };
    });

    return NextResponse.json(enriched);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "فشل في جلب المحافظ" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const portfolio = await prisma.portfolio.create({
      data: {
        name: body.name,
        description: body.description,
        color: body.color || "#006C35",
      },
    });
    return NextResponse.json(portfolio, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "فشل في إنشاء المحفظة" }, { status: 500 });
  }
}

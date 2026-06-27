import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const portfolioId = searchParams.get("portfolioId");

    const transactions = await prisma.transaction.findMany({
      where: portfolioId ? { portfolioId } : undefined,
      include: { stock: true, portfolio: true },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "فشل في جلب المعاملات" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { portfolioId, stockId, type, quantity, price, fees, date, notes } = body;

    const transaction = await prisma.$transaction(async (tx) => {
      const created = await tx.transaction.create({
        data: {
          portfolioId,
          stockId,
          type,
          quantity,
          price,
          fees: fees || 0,
          date: new Date(date),
          notes,
        },
        include: { stock: true },
      });

      if (type === "BUY" || type === "SELL") {
        const existing = await tx.holding.findUnique({
          where: { portfolioId_stockId: { portfolioId, stockId } },
        });

        if (type === "BUY") {
          if (existing) {
            const totalQty = existing.quantity + quantity;
            const newAvg =
              (existing.quantity * existing.avgBuyPrice + quantity * price) / totalQty;
            await tx.holding.update({
              where: { id: existing.id },
              data: { quantity: totalQty, avgBuyPrice: newAvg },
            });
          } else {
            await tx.holding.create({
              data: { portfolioId, stockId, quantity, avgBuyPrice: price },
            });
          }
        } else if (type === "SELL" && existing) {
          const newQty = existing.quantity - quantity;
          if (newQty <= 0) {
            await tx.holding.delete({ where: { id: existing.id } });
          } else {
            await tx.holding.update({
              where: { id: existing.id },
              data: { quantity: newQty },
            });
          }
        }
      }

      return created;
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "فشل في إنشاء المعاملة" }, { status: 500 });
  }
}

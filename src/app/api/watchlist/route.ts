import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPriceChange } from "@/lib/stocks";

export async function GET() {
  try {
    const items = await prisma.watchlistItem.findMany({
      include: { stock: true },
      orderBy: { createdAt: "desc" },
    });

    const enriched = items.map((item) => {
      const { change, changePercent } = getPriceChange(
        item.stock.currentPrice,
        item.stock.previousClose
      );
      const distanceToTarget = item.targetPrice
        ? ((item.stock.currentPrice - item.targetPrice) / item.targetPrice) * 100
        : null;

      return {
        ...item,
        change,
        changePercent,
        distanceToTarget,
      };
    });

    return NextResponse.json(enriched);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "فشل في جلب قائمة المراقبة" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const item = await prisma.watchlistItem.create({
      data: {
        stockId: body.stockId,
        targetPrice: body.targetPrice,
        notes: body.notes,
      },
      include: { stock: true },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "فشل في إضافة للمراقبة" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "المعرف مطلوب" }, { status: 400 });
    }

    await prisma.watchlistItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "فشل في الحذف" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const stock = await prisma.stock.findUnique({
      where: { id },
      include: {
        priceHistory: { orderBy: { date: "asc" }, take: 90 },
        dividends: { orderBy: { date: "desc" }, take: 12 },
      },
    });

    if (!stock) {
      return NextResponse.json({ error: "السهم غير موجود" }, { status: 404 });
    }

    return NextResponse.json(stock);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "فشل في جلب السهم" }, { status: 500 });
  }
}

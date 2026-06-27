import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { portfolioId, stockId, quantity, avgBuyPrice } = body;

    const holding = await prisma.holding.upsert({
      where: {
        portfolioId_stockId: { portfolioId, stockId },
      },
      update: { quantity, avgBuyPrice },
      create: { portfolioId, stockId, quantity, avgBuyPrice },
      include: { stock: true },
    });

    return NextResponse.json(holding, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "فشل في إضافة الحيازة" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "معرف الحيازة مطلوب" }, { status: 400 });
    }

    await prisma.holding.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "فشل في حذف الحيازة" }, { status: 500 });
  }
}

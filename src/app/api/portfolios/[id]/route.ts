import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculatePortfolioSummary } from "@/lib/calculations";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const portfolio = await prisma.portfolio.findUnique({
      where: { id },
      include: {
        holdings: { include: { stock: true } },
        transactions: {
          include: { stock: true },
          orderBy: { date: "desc" },
          take: 20,
        },
      },
    });

    if (!portfolio) {
      return NextResponse.json({ error: "المحفظة غير موجودة" }, { status: 404 });
    }

    const summary = calculatePortfolioSummary(portfolio.holdings);
    return NextResponse.json({ ...portfolio, ...summary });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "فشل في جلب المحفظة" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const portfolio = await prisma.portfolio.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        color: body.color,
      },
    });
    return NextResponse.json(portfolio);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "فشل في تحديث المحفظة" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.portfolio.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "فشل في حذف المحفظة" }, { status: 500 });
  }
}

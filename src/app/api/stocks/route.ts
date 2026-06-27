import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sector = searchParams.get("sector");
    const search = searchParams.get("search");

    const stocks = await prisma.stock.findMany({
      where: {
        ...(sector && { sector }),
        ...(search && {
          OR: [
            { symbol: { contains: search } },
            { nameAr: { contains: search } },
            { nameEn: { contains: search } },
          ],
        }),
      },
      orderBy: { marketCap: "desc" },
    });

    return NextResponse.json(stocks);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "فشل في جلب الأسهم" }, { status: 500 });
  }
}

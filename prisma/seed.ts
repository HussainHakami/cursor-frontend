import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";
import { SAUDI_STOCKS, generatePriceHistory } from "../src/lib/stocks";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 بدء تهيئة قاعدة البيانات...");

  for (const stock of SAUDI_STOCKS) {
    const created = await prisma.stock.upsert({
      where: { symbol: stock.symbol },
      update: {
        currentPrice: stock.currentPrice,
        previousClose: stock.previousClose,
        dayHigh: stock.dayHigh,
        dayLow: stock.dayLow,
        volume: stock.volume,
        marketCap: stock.marketCap,
        pe: stock.pe,
        dividendYield: stock.dividendYield,
      },
      create: stock,
    });

    const history = generatePriceHistory(stock.currentPrice, 90);
    for (const point of history) {
      await prisma.priceHistory.upsert({
        where: {
          stockId_date: {
            stockId: created.id,
            date: point.date,
          },
        },
        update: { price: point.price },
        create: {
          stockId: created.id,
          price: point.price,
          date: point.date,
        },
      });
    }
  }

  console.log(`✅ تم إضافة ${SAUDI_STOCKS.length} سهم سعودي`);

  const portfolio = await prisma.portfolio.upsert({
    where: { id: "default-portfolio" },
    update: {},
    create: {
      id: "default-portfolio",
      name: "محفظتي الرئيسية",
      description: "المحفظة الاستثمارية الرئيسية في السوق السعودي",
      color: "#006C35",
    },
  });

  const stocks = await prisma.stock.findMany();
  const stockMap = Object.fromEntries(stocks.map((s) => [s.symbol, s]));

  const sampleHoldings = [
    { symbol: "2222", quantity: 500, avgBuyPrice: 27.50 },
    { symbol: "1120", quantity: 200, avgBuyPrice: 78.00 },
    { symbol: "2010", quantity: 150, avgBuyPrice: 85.00 },
    { symbol: "7010", quantity: 300, avgBuyPrice: 40.00 },
    { symbol: "2082", quantity: 100, avgBuyPrice: 50.00 },
  ];

  for (const h of sampleHoldings) {
    const stock = stockMap[h.symbol];
    if (!stock) continue;

    await prisma.holding.upsert({
      where: {
        portfolioId_stockId: {
          portfolioId: portfolio.id,
          stockId: stock.id,
        },
      },
      update: { quantity: h.quantity, avgBuyPrice: h.avgBuyPrice },
      create: {
        portfolioId: portfolio.id,
        stockId: stock.id,
        quantity: h.quantity,
        avgBuyPrice: h.avgBuyPrice,
      },
    });
  }

  const sampleTransactions = [
    { symbol: "2222", type: "BUY", quantity: 500, price: 27.50, daysAgo: 60 },
    { symbol: "1120", type: "BUY", quantity: 200, price: 78.00, daysAgo: 45 },
    { symbol: "2010", type: "BUY", quantity: 150, price: 85.00, daysAgo: 30 },
    { symbol: "7010", type: "BUY", quantity: 300, price: 40.00, daysAgo: 20 },
    { symbol: "2082", type: "BUY", quantity: 100, price: 50.00, daysAgo: 15 },
    { symbol: "2222", type: "DIVIDEND", quantity: 500, price: 0.35, daysAgo: 10 },
  ];

  for (const t of sampleTransactions) {
    const stock = stockMap[t.symbol];
    if (!stock) continue;

    const date = new Date();
    date.setDate(date.getDate() - t.daysAgo);

    const existing = await prisma.transaction.findFirst({
      where: {
        portfolioId: portfolio.id,
        stockId: stock.id,
        type: t.type,
        date,
      },
    });

    if (!existing) {
      await prisma.transaction.create({
        data: {
          portfolioId: portfolio.id,
          stockId: stock.id,
          type: t.type,
          quantity: t.quantity,
          price: t.price,
          fees: t.type === "BUY" ? t.quantity * t.price * 0.0015 : 0,
          date,
        },
      });
    }
  }

  const watchlistSymbols = ["1211", "4013", "4190", "1180"];
  for (const symbol of watchlistSymbols) {
    const stock = stockMap[symbol];
    if (!stock) continue;

    await prisma.watchlistItem.upsert({
      where: { stockId: stock.id },
      update: {},
      create: {
        stockId: stock.id,
        targetPrice: stock.currentPrice * 0.95,
        notes: "مراقبة للشراء عند الانخفاض",
      },
    });
  }

  const dividendStocks = ["2222", "1120", "2010", "1180"];
  for (const symbol of dividendStocks) {
    const stock = stockMap[symbol];
    if (!stock || !stock.dividendYield) continue;

    for (let i = 1; i <= 4; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i * 3);
      const amount = stock.currentPrice * (stock.dividendYield / 100) / 4;

      await prisma.dividend.upsert({
        where: { id: `${stock.id}-div-${i}` },
        update: {},
        create: {
          id: `${stock.id}-div-${i}`,
          stockId: stock.id,
          amount,
          date,
        },
      });
    }
  }

  const portfolio2 = await prisma.portfolio.upsert({
    where: { id: "growth-portfolio" },
    update: {},
    create: {
      id: "growth-portfolio",
      name: "محفظة النمو",
      description: "محفظة تركز على أسهم النمو",
      color: "#1B4D89",
    },
  });

  const growthHoldings = [
    { symbol: "4013", quantity: 50, avgBuyPrice: 270.00 },
    { symbol: "4190", quantity: 80, avgBuyPrice: 160.00 },
    { symbol: "1211", quantity: 120, avgBuyPrice: 55.00 },
  ];

  for (const h of growthHoldings) {
    const stock = stockMap[h.symbol];
    if (!stock) continue;

    await prisma.holding.upsert({
      where: {
        portfolioId_stockId: {
          portfolioId: portfolio2.id,
          stockId: stock.id,
        },
      },
      update: { quantity: h.quantity, avgBuyPrice: h.avgBuyPrice },
      create: {
        portfolioId: portfolio2.id,
        stockId: stock.id,
        quantity: h.quantity,
        avgBuyPrice: h.avgBuyPrice,
      },
    });
  }

  console.log("✅ تم إنشاء المحافظ والمعاملات التجريبية");
  console.log("🎉 اكتملت التهيئة بنجاح!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

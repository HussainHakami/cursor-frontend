#!/usr/bin/env node
/**
 * اختبار شامل لوظائف تطبيق متتبع الاستثمارات
 */
const BASE = process.env.BASE_URL || "http://localhost:3000";

let passed = 0;
let failed = 0;
const errors = [];

function ok(name) {
  passed++;
  console.log(`  ✅ ${name}`);
}

function fail(name, detail) {
  failed++;
  errors.push({ name, detail });
  console.log(`  ❌ ${name}: ${detail}`);
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  let body;
  const text = await res.text();
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  return { status: res.status, body };
}

async function test(name, fn) {
  try {
    await fn();
  } catch (e) {
    fail(name, e.message);
  }
}

async function main() {
  console.log("\n🧪 اختبار وظائف متتبع الاستثمارات\n");
  console.log(`الخادم: ${BASE}\n`);

  let stockId, portfolioId, holdingId, transactionId, watchlistId;

  // ─── الصفحات ───
  console.log("📄 اختبار الصفحات:");
  for (const page of [
    "/",
    "/portfolios",
    "/stocks",
    "/transactions",
    "/watchlist",
    "/analytics",
  ]) {
    await test(`GET ${page}`, async () => {
      const res = await fetch(`${BASE}${page}`);
      if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
      ok(`GET ${page}`);
    });
  }

  // ─── لوحة التحكم ───
  console.log("\n📊 API لوحة التحكم:");
  await test("GET /api/dashboard", async () => {
    const { status, body } = await request("/api/dashboard");
    if (status !== 200) throw new Error(`HTTP ${status}`);
    if (!body.summary?.totalMarketValue) throw new Error("بيانات الملخص مفقودة");
    if (!Array.isArray(body.sectorData)) throw new Error("sectorData مفقود");
    if (!Array.isArray(body.recentTransactions)) throw new Error("recentTransactions مفقود");
    ok("GET /api/dashboard - بيانات كاملة");
  });

  // ─── التحليلات ───
  console.log("\n📈 API التحليلات:");
  await test("GET /api/analytics", async () => {
    const { status, body } = await request("/api/analytics");
    if (status !== 200) throw new Error(`HTTP ${status}`);
    if (!body.summary) throw new Error("summary مفقود");
    if (!body.monthlyPerformance?.length) throw new Error("monthlyPerformance مفقود");
    ok("GET /api/analytics - بيانات كاملة");
  });

  // ─── الأسهم ───
  console.log("\n📈 API الأسهم:");
  await test("GET /api/stocks", async () => {
    const { status, body } = await request("/api/stocks");
    if (status !== 200) throw new Error(`HTTP ${status}`);
    if (!Array.isArray(body) || body.length === 0) throw new Error("لا توجد أسهم");
    stockId = body[0].id;
    ok(`GET /api/stocks - ${body.length} سهم`);
  });

  await test("GET /api/stocks?search=أرامكو", async () => {
    const { status, body } = await request("/api/stocks?search=أرامكو");
    if (status !== 200) throw new Error(`HTTP ${status}`);
    if (!body.some((s) => s.nameAr.includes("أرامكو"))) throw new Error("البحث لا يعمل");
    ok("GET /api/stocks?search - البحث يعمل");
  });

  await test("GET /api/stocks?sector=البنوك", async () => {
    const { status, body } = await request("/api/stocks?sector=البنوك");
    if (status !== 200) throw new Error(`HTTP ${status}`);
    if (!body.every((s) => s.sector === "البنوك")) throw new Error("فلتر القطاع لا يعمل");
    ok("GET /api/stocks?sector - الفلترة تعمل");
  });

  await test("GET /api/stocks/[id]", async () => {
    const { status, body } = await request(`/api/stocks/${stockId}`);
    if (status !== 200) throw new Error(`HTTP ${status}`);
    if (!body.priceHistory?.length) throw new Error("priceHistory مفقود");
    ok("GET /api/stocks/[id] - تفاصيل السهم");
  });

  // ─── المحافظ ───
  console.log("\n💼 API المحافظ:");
  await test("GET /api/portfolios", async () => {
    const { status, body } = await request("/api/portfolios");
    if (status !== 200) throw new Error(`HTTP ${status}`);
    if (!Array.isArray(body) || body.length === 0) throw new Error("لا توجد محافظ");
    portfolioId = body[0].id;
    ok(`GET /api/portfolios - ${body.length} محفظة`);
  });

  await test("GET /api/portfolios/[id]", async () => {
    const { status, body } = await request(`/api/portfolios/${portfolioId}`);
    if (status !== 200) throw new Error(`HTTP ${status}`);
    if (!body.metrics) throw new Error("metrics مفقود");
    if (body.holdings?.length > 0) holdingId = body.holdings[0].id;
    ok("GET /api/portfolios/[id] - تفاصيل المحفظة");
  });

  await test("POST /api/portfolios - إنشاء محفظة", async () => {
    const { status, body } = await request("/api/portfolios", {
      method: "POST",
      body: JSON.stringify({
        name: "محفظة اختبار",
        description: "للاختبار فقط",
        color: "#FF5733",
      }),
    });
    if (status !== 201) throw new Error(`HTTP ${status}: ${JSON.stringify(body)}`);
    if (!body.id) throw new Error("لم يُرجع معرف");
    global.testPortfolioId = body.id;
    ok("POST /api/portfolios - إنشاء محفظة");
  });

  await test("PUT /api/portfolios/[id] - تحديث محفظة", async () => {
    const { status, body } = await request(`/api/portfolios/${global.testPortfolioId}`, {
      method: "PUT",
      body: JSON.stringify({ name: "محفظة محدّثة", description: "محدّثة", color: "#00FF00" }),
    });
    if (status !== 200) throw new Error(`HTTP ${status}`);
    if (body.name !== "محفظة محدّثة") throw new Error("التحديث لم يُطبّق");
    ok("PUT /api/portfolios/[id] - تحديث محفظة");
  });

  // ─── الحيازات ───
  console.log("\n📦 API الحيازات:");
  await test("POST /api/holdings - إضافة حيازة", async () => {
    const { status, body } = await request("/api/holdings", {
      method: "POST",
      body: JSON.stringify({
        portfolioId: global.testPortfolioId,
        stockId,
        quantity: 100,
        avgBuyPrice: 25.5,
      }),
    });
    if (status !== 201) throw new Error(`HTTP ${status}: ${JSON.stringify(body)}`);
    global.testHoldingId = body.id;
    ok("POST /api/holdings - إضافة حيازة");
  });

  await test("POST /api/holdings - تحديث حيازة موجودة", async () => {
    const { status, body } = await request("/api/holdings", {
      method: "POST",
      body: JSON.stringify({
        portfolioId: global.testPortfolioId,
        stockId,
        quantity: 150,
        avgBuyPrice: 26.0,
      }),
    });
    if (status !== 201) throw new Error(`HTTP ${status}`);
    if (body.quantity !== 150) throw new Error("التحديث لم يُطبّق");
    ok("POST /api/holdings - تحديث حيازة (upsert)");
  });

  // ─── المعاملات ───
  console.log("\n🔄 API المعاملات:");
  await test("GET /api/transactions", async () => {
    const { status, body } = await request("/api/transactions");
    if (status !== 200) throw new Error(`HTTP ${status}`);
    if (!Array.isArray(body)) throw new Error("ليست مصفوفة");
    ok(`GET /api/transactions - ${body.length} معاملة`);
  });

  await test("POST /api/transactions - شراء", async () => {
    const stocks = (await request("/api/stocks")).body;
    const testStock = stocks.find((s) => s.symbol === "1050") || stocks[1];
    const { status, body } = await request("/api/transactions", {
      method: "POST",
      body: JSON.stringify({
        portfolioId: global.testPortfolioId,
        stockId: testStock.id,
        type: "BUY",
        quantity: 50,
        price: 22.0,
        fees: 1.65,
        date: new Date().toISOString(),
        notes: "اختبار شراء",
      }),
    });
    if (status !== 201) throw new Error(`HTTP ${status}: ${JSON.stringify(body)}`);
    transactionId = body.id;
    ok("POST /api/transactions - شراء");
  });

  await test("POST /api/transactions - تحديث الحيازة بعد الشراء", async () => {
    const { status, body } = await request(`/api/portfolios/${global.testPortfolioId}`);
    if (status !== 200) throw new Error(`HTTP ${status}`);
    const stocks = (await request("/api/stocks")).body;
    const testStock = stocks.find((s) => s.symbol === "1050") || stocks[1];
    const holding = body.holdings?.find((h) => h.stockId === testStock.id);
    if (!holding) throw new Error("الحيازة لم تُنشأ بعد الشراء");
    ok("الحيازة تُحدَّث تلقائياً بعد الشراء");
  });

  await test("POST /api/transactions - توزيعات", async () => {
    const { status, body } = await request("/api/transactions", {
      method: "POST",
      body: JSON.stringify({
        portfolioId: global.testPortfolioId,
        stockId,
        type: "DIVIDEND",
        quantity: 150,
        price: 0.35,
        fees: 0,
        date: new Date().toISOString(),
      }),
    });
    if (status !== 201) throw new Error(`HTTP ${status}: ${JSON.stringify(body)}`);
    ok("POST /api/transactions - توزيعات");
  });

  await test("GET /api/transactions?portfolioId", async () => {
    const { status, body } = await request(
      `/api/transactions?portfolioId=${global.testPortfolioId}`
    );
    if (status !== 200) throw new Error(`HTTP ${status}`);
    if (!body.every((t) => t.portfolioId === global.testPortfolioId))
      throw new Error("فلتر المحفظة لا يعمل");
    ok("GET /api/transactions?portfolioId - الفلترة تعمل");
  });

  // ─── قائمة المراقبة ───
  console.log("\n👁 API قائمة المراقبة:");
  await test("GET /api/watchlist", async () => {
    const { status, body } = await request("/api/watchlist");
    if (status !== 200) throw new Error(`HTTP ${status}`);
    if (!Array.isArray(body)) throw new Error("ليست مصفوفة");
    ok(`GET /api/watchlist - ${body.length} عنصر`);
  });

  await test("POST /api/watchlist - إضافة", async () => {
    const stocks = (await request("/api/stocks")).body;
    const newStock = stocks.find((s) => s.symbol === "9510");
    if (!newStock) throw new Error("سهم الاختبار غير موجود");

    // حذف إن وُجد مسبقاً
    const existing = (await request("/api/watchlist")).body;
    const found = existing.find((w) => w.stockId === newStock.id);
    if (found) {
      await request(`/api/watchlist?id=${found.id}`, { method: "DELETE" });
    }

    const { status, body } = await request("/api/watchlist", {
      method: "POST",
      body: JSON.stringify({
        stockId: newStock.id,
        targetPrice: 3.5,
        notes: "اختبار مراقبة",
      }),
    });
    if (status !== 201) throw new Error(`HTTP ${status}: ${JSON.stringify(body)}`);
    watchlistId = body.id;
    ok("POST /api/watchlist - إضافة");
  });

  await test("GET /api/watchlist - بيانات محسوبة", async () => {
    const { status, body } = await request("/api/watchlist");
    if (status !== 200) throw new Error(`HTTP ${status}`);
    const item = body.find((w) => w.id === watchlistId);
    if (!item) throw new Error("العنصر غير موجود");
    if (item.changePercent === undefined) throw new Error("changePercent مفقود");
    if (item.distanceToTarget === undefined) throw new Error("distanceToTarget مفقود");
    ok("GET /api/watchlist - حسابات التغير والهدف");
  });

  await test("DELETE /api/watchlist", async () => {
    const { status } = await request(`/api/watchlist?id=${watchlistId}`, {
      method: "DELETE",
    });
    if (status !== 200) throw new Error(`HTTP ${status}`);
    ok("DELETE /api/watchlist - حذف");
  });

  // ─── حذف الحيازة ───
  console.log("\n🗑 API الحذف:");
  await test("DELETE /api/holdings", async () => {
    const { status } = await request(`/api/holdings?id=${global.testHoldingId}`, {
      method: "DELETE",
    });
    if (status !== 200) throw new Error(`HTTP ${status}`);
    ok("DELETE /api/holdings - حذف حيازة");
  });

  await test("DELETE /api/portfolios/[id]", async () => {
    const { status } = await request(`/api/portfolios/${global.testPortfolioId}`, {
      method: "DELETE",
    });
    if (status !== 200) throw new Error(`HTTP ${status}`);
    ok("DELETE /api/portfolios/[id] - حذف محفظة");
  });

  // ─── اختبارات الأخطاء ───
  console.log("\n⚠️ اختبار معالجة الأخطاء:");
  await test("GET /api/portfolios/invalid-id", async () => {
    const { status } = await request("/api/portfolios/invalid-id-xyz");
    if (status !== 404) throw new Error(`توقع 404 لكن حصل ${status}`);
    ok("404 للمحفظة غير الموجودة");
  });

  await test("GET /api/stocks/invalid-id", async () => {
    const { status } = await request("/api/stocks/invalid-id-xyz");
    if (status !== 404) throw new Error(`توقع 404 لكن حصل ${status}`);
    ok("404 للسهم غير الموجود");
  });

  // ─── النتيجة ───
  console.log("\n" + "═".repeat(50));
  console.log(`✅ نجح: ${passed}`);
  console.log(`❌ فشل: ${failed}`);
  console.log("═".repeat(50) + "\n");

  if (failed > 0) {
    console.log("تفاصيل الأخطاء:");
    errors.forEach((e) => console.log(`  - ${e.name}: ${e.detail}`));
    process.exit(1);
  }

  console.log("🎉 جميع الوظائف تعمل بشكل صحيح!\n");
}

main().catch((e) => {
  console.error("خطأ فادح:", e);
  process.exit(1);
});

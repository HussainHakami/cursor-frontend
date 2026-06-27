export interface StockSeed {
  symbol: string;
  nameAr: string;
  nameEn: string;
  sector: string;
  currentPrice: number;
  previousClose: number;
  dayHigh: number;
  dayLow: number;
  volume: number;
  marketCap: number;
  pe?: number;
  dividendYield?: number;
}

export const SAUDI_STOCKS: StockSeed[] = [
  { symbol: "2222", nameAr: "أرامكو السعودية", nameEn: "Saudi Aramco", sector: "الطاقة", currentPrice: 28.45, previousClose: 28.20, dayHigh: 28.60, dayLow: 28.10, volume: 12500000, marketCap: 6800000000000, pe: 14.2, dividendYield: 4.8 },
  { symbol: "1120", nameAr: "الراجحي", nameEn: "Al Rajhi Bank", sector: "البنوك", currentPrice: 82.30, previousClose: 81.50, dayHigh: 82.80, dayLow: 81.20, volume: 3200000, marketCap: 328000000000, pe: 18.5, dividendYield: 3.2 },
  { symbol: "2010", nameAr: "سابك", nameEn: "SABIC", sector: "المواد الأساسية", currentPrice: 87.60, previousClose: 86.90, dayHigh: 88.00, dayLow: 86.50, volume: 1800000, marketCap: 329000000000, pe: 22.1, dividendYield: 4.5 },
  { symbol: "1180", nameAr: "الأهلي السعودي", nameEn: "SNB", sector: "البنوك", currentPrice: 35.20, previousClose: 34.80, dayHigh: 35.50, dayLow: 34.60, volume: 2100000, marketCap: 131000000000, pe: 12.8, dividendYield: 5.1 },
  { symbol: "7010", nameAr: "الاتصالات السعودية", nameEn: "STC", sector: "الاتصالات", currentPrice: 42.15, previousClose: 41.80, dayHigh: 42.50, dayLow: 41.60, volume: 1500000, marketCap: 210000000000, pe: 16.3, dividendYield: 4.0 },
  { symbol: "1010", nameAr: "الرياض", nameEn: "Riyad Bank", sector: "البنوك", currentPrice: 28.90, previousClose: 28.50, dayHigh: 29.10, dayLow: 28.30, volume: 1900000, marketCap: 108000000000, pe: 11.5, dividendYield: 4.8 },
  { symbol: "4030", nameAr: "البحري", nameEn: "Bahri", sector: "النقل", currentPrice: 24.80, previousClose: 24.50, dayHigh: 25.00, dayLow: 24.30, volume: 980000, marketCap: 29800000000, pe: 15.2, dividendYield: 5.5 },
  { symbol: "2082", nameAr: "المراعي", nameEn: "Almarai", sector: "الأغذية", currentPrice: 52.40, previousClose: 51.90, dayHigh: 52.80, dayLow: 51.70, volume: 750000, marketCap: 42000000000, pe: 20.5, dividendYield: 3.8 },
  { symbol: "2280", nameAr: "المركزية السعودية", nameEn: "Alinma Bank", sector: "البنوك", currentPrice: 31.60, previousClose: 31.20, dayHigh: 31.80, dayLow: 31.00, volume: 1200000, marketCap: 63000000000, pe: 13.2, dividendYield: 4.2 },
  { symbol: "1211", nameAr: "معادن", nameEn: "Ma'aden", sector: "المواد الأساسية", currentPrice: 58.30, previousClose: 57.80, dayHigh: 58.70, dayLow: 57.50, volume: 890000, marketCap: 218000000000, pe: 25.8, dividendYield: 2.1 },
  { symbol: "2350", nameAr: "كيان السعودية", nameEn: "Saudi Kayan", sector: "المواد الأساسية", currentPrice: 4.85, previousClose: 4.78, dayHigh: 4.90, dayLow: 4.75, volume: 4500000, marketCap: 9700000000, pe: 0, dividendYield: 0 },
  { symbol: "5110", nameAr: "الكهرباء السعودية", nameEn: "SEC", sector: "المرافق", currentPrice: 16.42, previousClose: 16.30, dayHigh: 16.55, dayLow: 16.20, volume: 2800000, marketCap: 69000000000, pe: 14.8, dividendYield: 4.5 },
  { symbol: "4200", nameAr: "الدريس", nameEn: "Aldrees", sector: "الطاقة", currentPrice: 198.50, previousClose: 196.00, dayHigh: 200.00, dayLow: 195.50, volume: 120000, marketCap: 19800000000, pe: 18.2, dividendYield: 3.5 },
  { symbol: "1050", nameAr: "البلاد", nameEn: "Bank Albilad", sector: "البنوك", currentPrice: 22.15, previousClose: 21.90, dayHigh: 22.30, dayLow: 21.80, volume: 1100000, marketCap: 22100000000, pe: 10.5, dividendYield: 5.0 },
  { symbol: "1140", nameAr: "الإنماء", nameEn: "Alinma", sector: "البنوك", currentPrice: 28.75, previousClose: 28.40, dayHigh: 29.00, dayLow: 28.20, volume: 980000, marketCap: 34500000000, pe: 12.1, dividendYield: 4.6 },
  { symbol: "2060", nameAr: "التصنيع", nameEn: "Tasnee", sector: "المواد الأساسية", currentPrice: 12.30, previousClose: 12.10, dayHigh: 12.45, dayLow: 12.05, volume: 2100000, marketCap: 12300000000, pe: 0, dividendYield: 0 },
  { symbol: "2380", nameAr: "بترو رابغ", nameEn: "Petro Rabigh", sector: "المواد الأساسية", currentPrice: 7.82, previousClose: 7.75, dayHigh: 7.90, dayLow: 7.70, volume: 3800000, marketCap: 15600000000, pe: 0, dividendYield: 0 },
  { symbol: "4001", nameAr: "أسمنت العربية", nameEn: "Arabian Cement", sector: "الإسمنت", currentPrice: 32.50, previousClose: 32.20, dayHigh: 32.80, dayLow: 32.00, volume: 450000, marketCap: 3900000000, pe: 16.5, dividendYield: 4.0 },
  { symbol: "3002", nameAr: "أسمنت نجران", nameEn: "Najran Cement", sector: "الإسمنت", currentPrice: 8.45, previousClose: 8.35, dayHigh: 8.55, dayLow: 8.30, volume: 680000, marketCap: 845000000, pe: 12.0, dividendYield: 3.5 },
  { symbol: "6010", nameAr: "نادك", nameEn: "NADEC", sector: "الأغذية", currentPrice: 18.90, previousClose: 18.70, dayHigh: 19.05, dayLow: 18.60, volume: 520000, marketCap: 1890000000, pe: 15.8, dividendYield: 3.2 },
  { symbol: "8310", nameAr: "أمانة للتأمين", nameEn: "Amana Insurance", sector: "التأمين", currentPrice: 14.25, previousClose: 14.10, dayHigh: 14.40, dayLow: 14.00, volume: 320000, marketCap: 1420000000, pe: 14.2, dividendYield: 4.8 },
  { symbol: "4260", nameAr: "بدجت السعودية", nameEn: "Budget Saudi", sector: "النقل", currentPrice: 78.60, previousClose: 77.80, dayHigh: 79.20, dayLow: 77.50, volume: 180000, marketCap: 7860000000, pe: 22.5, dividendYield: 2.8 },
  { symbol: "4190", nameAr: "جرير", nameEn: "Jarir", sector: "التجزئة", currentPrice: 168.40, previousClose: 166.50, dayHigh: 169.80, dayLow: 166.00, volume: 95000, marketCap: 20200000000, pe: 24.8, dividendYield: 2.5 },
  { symbol: "4002", nameAr: "موبكو", nameEn: "Mouwasat", sector: "الرعاية الصحية", currentPrice: 95.20, previousClose: 94.00, dayHigh: 96.00, dayLow: 93.80, volume: 210000, marketCap: 9520000000, pe: 28.5, dividendYield: 1.8 },
  { symbol: "8230", nameAr: "الراجحي للتأمين", nameEn: "Al Rajhi Takaful", sector: "التأمين", currentPrice: 11.85, previousClose: 11.70, dayHigh: 12.00, dayLow: 11.60, volume: 890000, marketCap: 1180000000, pe: 11.8, dividendYield: 5.2 },
  { symbol: "7200", nameAr: "إم جي", nameEn: "MG", sector: "التجزئة", currentPrice: 6.42, previousClose: 6.35, dayHigh: 6.50, dayLow: 6.30, volume: 1500000, marketCap: 642000000, pe: 18.0, dividendYield: 0 },
  { symbol: "9510", nameAr: "الوطنية للبناء", nameEn: "National Building", sector: "العقارات", currentPrice: 3.85, previousClose: 3.80, dayHigh: 3.90, dayLow: 3.78, volume: 2200000, marketCap: 385000000, pe: 0, dividendYield: 0 },
  { symbol: "4300", nameAr: "دار الأركان", nameEn: "Dar Al Arkan", sector: "العقارات", currentPrice: 12.15, previousClose: 12.00, dayHigh: 12.30, dayLow: 11.95, volume: 1800000, marketCap: 12100000000, pe: 15.5, dividendYield: 3.0 },
  { symbol: "2080", nameAr: "الغاز", nameEn: "Gasco", sector: "الطاقة", currentPrice: 15.80, previousClose: 15.60, dayHigh: 15.95, dayLow: 15.50, volume: 650000, marketCap: 1580000000, pe: 14.0, dividendYield: 4.2 },
  { symbol: "4013", nameAr: "سليمان الحبيب", nameEn: "Dr. Sulaiman Al Habib", sector: "الرعاية الصحية", currentPrice: 285.60, previousClose: 282.00, dayHigh: 288.00, dayLow: 281.00, volume: 45000, marketCap: 85600000000, pe: 35.2, dividendYield: 1.5 },
];

export const SECTORS = [
  "الطاقة",
  "البنوك",
  "المواد الأساسية",
  "الاتصالات",
  "النقل",
  "الأغذية",
  "المرافق",
  "الإسمنت",
  "التأمين",
  "التجزئة",
  "الرعاية الصحية",
  "العقارات",
];

export function getPriceChange(current: number, previous: number) {
  const change = current - previous;
  const changePercent = previous > 0 ? (change / previous) * 100 : 0;
  return { change, changePercent };
}

export function generatePriceHistory(basePrice: number, days: number = 90) {
  const history: { date: Date; price: number }[] = [];
  let price = basePrice * (0.85 + Math.random() * 0.1);
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const volatility = 0.02;
    const change = (Math.random() - 0.48) * volatility;
    price = price * (1 + change);
    price = Math.max(price, basePrice * 0.7);
    price = Math.min(price, basePrice * 1.3);

    history.push({ date, price: Math.round(price * 100) / 100 });
  }

  history[history.length - 1].price = basePrice;
  return history;
}

import bcrypt from 'bcryptjs';
import db, { initializeDatabase } from './config/database';

async function seed() {
  console.log('Initializing database...');
  await initializeDatabase();

  console.log('Seeding data...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  db.prepare(`
    INSERT OR IGNORE INTO users (username, email, password, full_name, role)
    VALUES ('admin', 'admin@sarafi.af', ?, 'System Administrator', 'admin')
  `).run(adminPassword);

  // Create markets
  const markets = [
    { name: 'Sarai Shahzada', name_fa: 'سرای شهزاده', name_ps: 'سرای شهزاده', location: 'Kabul' },
    { name: 'Khorasan Market', name_fa: 'بازار خراسان', name_ps: 'د خراسان بازار', location: 'Herat' },
    { name: 'Da Afghanistan Bank', name_fa: 'د افغانستان بانک', name_ps: 'د افغانستان بانک', location: 'Kabul' }
  ];

  const insertMarket = db.prepare(`
    INSERT OR IGNORE INTO markets (name, name_fa, name_ps, location)
    VALUES (?, ?, ?, ?)
  `);

  for (const market of markets) {
    insertMarket.run(market.name, market.name_fa, market.name_ps, market.location);
  }

  // Create currencies
  const currencies = [
    { code: 'USD', name: 'US Dollar', name_fa: 'دالر امریکایی', name_ps: 'امریکایی ډالر', symbol: '$', flag_code: 'us' },
    { code: 'EUR', name: 'Euro', name_fa: 'یورو', name_ps: 'یورو', symbol: '€', flag_code: 'eu' },
    { code: 'GBP', name: 'British Pound', name_fa: 'پوند انگلیس', name_ps: 'برتانوی پونډ', symbol: '£', flag_code: 'gb' },
    { code: 'PKR', name: 'Pakistani Rupee', name_fa: 'روپیه پاکستان', name_ps: 'پاکستانی روپۍ', symbol: '₨', flag_code: 'pk' },
    { code: 'INR', name: 'Indian Rupee', name_fa: 'روپیه هند', name_ps: 'هندی روپۍ', symbol: '₹', flag_code: 'in' },
    { code: 'IRR', name: 'Iranian Rial', name_fa: 'ریال ایران', name_ps: 'ایراني ریال', symbol: '﷼', flag_code: 'ir' },
    { code: 'SAR', name: 'Saudi Riyal', name_fa: 'ریال سعودی', name_ps: 'سعودی ریال', symbol: '﷼', flag_code: 'sa' },
    { code: 'AED', name: 'UAE Dirham', name_fa: 'درهم امارات', name_ps: 'اماراتی درهم', symbol: 'د.إ', flag_code: 'ae' },
    { code: 'CNY', name: 'Chinese Yuan', name_fa: 'یوان چین', name_ps: 'چینایی یوان', symbol: '¥', flag_code: 'cn' },
    { code: 'TRY', name: 'Turkish Lira', name_fa: 'لیره ترکیه', name_ps: 'ترکی لیره', symbol: '₺', flag_code: 'tr' }
  ];

  const insertCurrency = db.prepare(`
    INSERT OR IGNORE INTO currencies (code, name, name_fa, name_ps, symbol, flag_code)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const currency of currencies) {
    insertCurrency.run(currency.code, currency.name, currency.name_fa, currency.name_ps, currency.symbol, currency.flag_code);
  }

  // Create exchange rates for Sarai Shahzada (market_id = 1)
  const rates = [
    { currency: 'USD', buy: 70.50, sell: 70.80 },
    { currency: 'EUR', buy: 77.20, sell: 77.60 },
    { currency: 'GBP', buy: 89.50, sell: 90.00 },
    { currency: 'PKR', buy: 0.25, sell: 0.26 },
    { currency: 'INR', buy: 0.84, sell: 0.85 },
    { currency: 'IRR', buy: 0.0017, sell: 0.0018 },
    { currency: 'SAR', buy: 18.80, sell: 18.90 },
    { currency: 'AED', buy: 19.20, sell: 19.35 },
    { currency: 'CNY', buy: 9.70, sell: 9.80 },
    { currency: 'TRY', buy: 2.00, sell: 2.05 }
  ];

  const getCurrencyId = db.prepare('SELECT id FROM currencies WHERE code = ?');
  const insertRate = db.prepare(`
    INSERT OR REPLACE INTO exchange_rates (market_id, currency_id, buy_rate, sell_rate, updated_by)
    VALUES (?, ?, ?, ?, 1)
  `);

  for (const rate of rates) {
    const currency = getCurrencyId.get(rate.currency) as { id: number };
    if (currency) {
      // Insert for all three markets with slightly different rates
      insertRate.run(1, currency.id, rate.buy, rate.sell);
      insertRate.run(2, currency.id, rate.buy * 0.998, rate.sell * 1.002);
      insertRate.run(3, currency.id, rate.buy * 0.995, rate.sell * 1.005);
    }
  }

  // Create gold rates
  const goldRates = [
    { type: 'Gold 24K', price_afn: 6200, price_usd: 88, unit: 'gram' },
    { type: 'Gold 22K', price_afn: 5700, price_usd: 81, unit: 'gram' },
    { type: 'Gold 21K', price_afn: 5450, price_usd: 77, unit: 'gram' },
    { type: 'Gold 18K', price_afn: 4650, price_usd: 66, unit: 'gram' },
    { type: 'Silver', price_afn: 75, price_usd: 1.07, unit: 'gram' }
  ];

  const insertGold = db.prepare(`
    INSERT OR IGNORE INTO gold_rates (type, price_afn, price_usd, unit, updated_by)
    VALUES (?, ?, ?, ?, 1)
  `);

  for (const gold of goldRates) {
    insertGold.run(gold.type, gold.price_afn, gold.price_usd, gold.unit);
  }

  // Create sample news
  const news = [
    {
      title: 'Afghani Maintains Stability Against Dollar',
      title_fa: 'افغانی در برابر دالر ثبات خود را حفظ کرد',
      title_ps: 'افغانۍ د ډالر په وړاندې خپله ثباتیت وساته',
      content: 'The Afghan Afghani has shown remarkable stability against the US Dollar in recent trading sessions at Sarai Shahzada market.',
      content_fa: 'افغانی افغان در جلسات معاملاتی اخیر در بازار سرای شهزاده ثبات قابل توجهی را در برابر دالر آمریکا نشان داده است.',
      content_ps: 'افغان افغانۍ په سرای شهزاده بازار کې په وروستیو سوداګریزو غونډو کې د امریکایی ډالر په وړاندې د پام وړ ثبات ښودلی.',
      category: 'market',
      is_published: 1
    },
    {
      title: 'New Currency Exchange Regulations Announced',
      title_fa: 'مقررات جدید تبادله ارز اعلام شد',
      title_ps: 'د اسعارو د تبادلې نوي مقررات اعلان شول',
      content: 'Da Afghanistan Bank has announced new regulations for currency exchange businesses operating in the country.',
      content_fa: 'د افغانستان بانک مقررات جدیدی را برای کسب و کارهای تبادله ارز که در کشور فعالیت می‌کنند اعلام کرده است.',
      content_ps: 'د افغانستان بانک د هغو اسعارو د تبادلې سوداګریو لپاره نوي مقررات اعلان کړي چې په هیواد کې فعالیت کوي.',
      category: 'announcement',
      is_published: 1
    },
    {
      title: 'Gold Prices Rise Amid Global Uncertainty',
      title_fa: 'قیمت طلا در میان عدم اطمینان جهانی افزایش یافت',
      title_ps: 'د سرو زرو بیې د نړیوال ناباوری په منځ کې لوړې شوې',
      content: 'Gold prices in Afghan markets have seen an uptick following global economic uncertainties and increased demand for safe-haven assets.',
      content_fa: 'قیمت طلا در بازارهای افغان به دنبال عدم قطعیت‌های اقتصادی جهانی و افزایش تقاضا برای دارایی‌های امن افزایش یافته است.',
      content_ps: 'په افغان بازارونو کې د سرو زرو بیې د نړیوال اقتصادی ناباوریو او د خوندي شتمنیو لپاره د غوښتنې د زیاتوالي په پایله کې لوړې شوي.',
      category: 'market',
      is_published: 1
    }
  ];

  const insertNews = db.prepare(`
    INSERT OR IGNORE INTO news (title, title_fa, title_ps, content, content_fa, content_ps, category, is_published, author_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
  `);

  for (const item of news) {
    insertNews.run(
      item.title,
      item.title_fa,
      item.title_ps,
      item.content,
      item.content_fa,
      item.content_ps,
      item.category,
      item.is_published
    );
  }

  console.log('Seed completed successfully!');
  console.log('Admin credentials: admin@sarafi.af / admin123');
}

seed().catch(console.error);

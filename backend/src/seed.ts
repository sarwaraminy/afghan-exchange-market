import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import db, { initializeDatabase, saveDatabaseNow } from './config/database';

async function seed() {
  console.log('Initializing database...');
  await initializeDatabase();

  console.log('Seeding data...');

  // Create provinces (34 provinces of Afghanistan)
  const provinces = [
    { name: 'Kabul', name_fa: 'کابل', name_ps: 'کابل', code: 'KBL' },
    { name: 'Herat', name_fa: 'هرات', name_ps: 'هرات', code: 'HER' },
    { name: 'Kandahar', name_fa: 'قندهار', name_ps: 'کندهار', code: 'KAN' },
    { name: 'Balkh', name_fa: 'بلخ', name_ps: 'بلخ', code: 'BAL' },
    { name: 'Nangarhar', name_fa: 'ننگرهار', name_ps: 'ننګرهار', code: 'NAN' },
    { name: 'Badakhshan', name_fa: 'بدخشان', name_ps: 'بدخشان', code: 'BDS' },
    { name: 'Baghlan', name_fa: 'بغلان', name_ps: 'بغلان', code: 'BGL' },
    { name: 'Bamyan', name_fa: 'بامیان', name_ps: 'باميان', code: 'BAM' },
    { name: 'Daykundi', name_fa: 'دایکندی', name_ps: 'دايکندي', code: 'DAY' },
    { name: 'Farah', name_fa: 'فراه', name_ps: 'فراه', code: 'FRA' },
    { name: 'Faryab', name_fa: 'فاریاب', name_ps: 'فارياب', code: 'FYB' },
    { name: 'Ghazni', name_fa: 'غزنی', name_ps: 'غزني', code: 'GHA' },
    { name: 'Ghor', name_fa: 'غور', name_ps: 'غور', code: 'GHO' },
    { name: 'Helmand', name_fa: 'هلمند', name_ps: 'هلمند', code: 'HEL' },
    { name: 'Jawzjan', name_fa: 'جوزجان', name_ps: 'جوزجان', code: 'JOW' },
    { name: 'Kapisa', name_fa: 'کاپیسا', name_ps: 'کاپيسا', code: 'KAP' },
    { name: 'Khost', name_fa: 'خوست', name_ps: 'خوست', code: 'KHO' },
    { name: 'Kunar', name_fa: 'کنر', name_ps: 'کنړ', code: 'KNR' },
    { name: 'Kunduz', name_fa: 'قندوز', name_ps: 'کندوز', code: 'KDZ' },
    { name: 'Laghman', name_fa: 'لغمان', name_ps: 'لغمان', code: 'LAG' },
    { name: 'Logar', name_fa: 'لوگر', name_ps: 'لوګر', code: 'LOG' },
    { name: 'Nimroz', name_fa: 'نیمروز', name_ps: 'نيمروز', code: 'NIM' },
    { name: 'Nuristan', name_fa: 'نورستان', name_ps: 'نورستان', code: 'NUR' },
    { name: 'Paktia', name_fa: 'پکتیا', name_ps: 'پکتيا', code: 'PIA' },
    { name: 'Paktika', name_fa: 'پکتیکا', name_ps: 'پکتيکا', code: 'PKA' },
    { name: 'Panjshir', name_fa: 'پنجشیر', name_ps: 'پنجشير', code: 'PAN' },
    { name: 'Parwan', name_fa: 'پروان', name_ps: 'پروان', code: 'PAR' },
    { name: 'Samangan', name_fa: 'سمنگان', name_ps: 'سمنګان', code: 'SAM' },
    { name: 'Sar-e Pol', name_fa: 'سرپل', name_ps: 'سرپل', code: 'SAR' },
    { name: 'Takhar', name_fa: 'تخار', name_ps: 'تخار', code: 'TAK' },
    { name: 'Uruzgan', name_fa: 'ارزگان', name_ps: 'ارزګان', code: 'URU' },
    { name: 'Wardak', name_fa: 'وردک', name_ps: 'وردک', code: 'WAR' },
    { name: 'Zabul', name_fa: 'زابل', name_ps: 'زابل', code: 'ZAB' },
    { name: 'Badghis', name_fa: 'بادغیس', name_ps: 'بادغيس', code: 'BDG' }
  ];

  const insertProvince = db.prepare(`
    INSERT OR IGNORE INTO provinces (name, name_fa, name_ps, code)
    VALUES (?, ?, ?, ?)
  `);

  const provinceIds: { [key: string]: number } = {};

  for (const province of provinces) {
    const result = insertProvince.run(province.name, province.name_fa, province.name_ps, province.code);
    const existing = db.prepare('SELECT id FROM provinces WHERE code = ?').get(province.code) as { id: number } | undefined;
    if (existing) {
      provinceIds[province.name] = existing.id;
    }
  }

  // Create comprehensive districts for all provinces
  const districts = [
    // Kabul Province (15 districts)
    { province: 'Kabul', name: 'Kabul City', name_fa: 'شهر کابل', name_ps: 'د کابل ښار', code: 'KBL-01' },
    { province: 'Kabul', name: 'Paghman', name_fa: 'پغمان', name_ps: 'پغمان', code: 'KBL-02' },
    { province: 'Kabul', name: 'Char Asiab', name_fa: 'چهار آسیاب', name_ps: 'څلور آسیاب', code: 'KBL-03' },
    { province: 'Kabul', name: 'Deh Sabz', name_fa: 'ده سبز', name_ps: 'ده سبز', code: 'KBL-04' },
    { province: 'Kabul', name: 'Shakar Dara', name_fa: 'شکردره', name_ps: 'شکردره', code: 'KBL-05' },
    { province: 'Kabul', name: 'Bagrami', name_fa: 'بگرامی', name_ps: 'بګرامي', code: 'KBL-06' },
    { province: 'Kabul', name: 'Kalakan', name_fa: 'کلکان', name_ps: 'کلکان', code: 'KBL-07' },
    { province: 'Kabul', name: 'Khak-e-Jabbar', name_fa: 'خاک جبار', name_ps: 'خاک جبار', code: 'KBL-08' },
    { province: 'Kabul', name: 'Mir Bacha Kot', name_fa: 'میربچه کوت', name_ps: 'میربچه کوټ', code: 'KBL-09' },
    { province: 'Kabul', name: 'Musahi', name_fa: 'موسهی', name_ps: 'موسهی', code: 'KBL-10' },
    { province: 'Kabul', name: 'Qarabagh', name_fa: 'قره باغ', name_ps: 'قره باغ', code: 'KBL-11' },
    { province: 'Kabul', name: 'Surobi', name_fa: 'سروبی', name_ps: 'سروبي', code: 'KBL-12' },
    { province: 'Kabul', name: 'Farza', name_fa: 'فرزه', name_ps: 'فرزه', code: 'KBL-13' },
    { province: 'Kabul', name: 'Guldara', name_fa: 'گلدره', name_ps: 'ګلدره', code: 'KBL-14' },
    { province: 'Kabul', name: 'Istalif', name_fa: 'استالف', name_ps: 'استالف', code: 'KBL-15' },

    // Herat Province (17 districts)
    { province: 'Herat', name: 'Herat City', name_fa: 'شهر هرات', name_ps: 'د هرات ښار', code: 'HER-01' },
    { province: 'Herat', name: 'Injil', name_fa: 'انجیل', name_ps: 'انجیل', code: 'HER-02' },
    { province: 'Herat', name: 'Guzara', name_fa: 'گذره', name_ps: 'ګذره', code: 'HER-03' },
    { province: 'Herat', name: 'Pashtun Zarghun', name_fa: 'پشتون زرغون', name_ps: 'پښتون زرغون', code: 'HER-04' },
    { province: 'Herat', name: 'Shindand', name_fa: 'شیندند', name_ps: 'شینډنډ', code: 'HER-05' },
    { province: 'Herat', name: 'Adraskan', name_fa: 'ادرسکن', name_ps: 'ادرسکن', code: 'HER-06' },
    { province: 'Herat', name: 'Farsi', name_fa: 'فارسی', name_ps: 'فارسي', code: 'HER-07' },
    { province: 'Herat', name: 'Ghoryan', name_fa: 'غوریان', name_ps: 'غوریان', code: 'HER-08' },
    { province: 'Herat', name: 'Gulran', name_fa: 'گلران', name_ps: 'ګلران', code: 'HER-09' },
    { province: 'Herat', name: 'Karukh', name_fa: 'کرخ', name_ps: 'کرخ', code: 'HER-10' },
    { province: 'Herat', name: 'Kushk', name_fa: 'کشک', name_ps: 'کشک', code: 'HER-11' },
    { province: 'Herat', name: 'Kushk-e-Kohna', name_fa: 'کشک کهنه', name_ps: 'کشک کهنه', code: 'HER-12' },
    { province: 'Herat', name: 'Obe', name_fa: 'اوبه', name_ps: 'اوبه', code: 'HER-13' },
    { province: 'Herat', name: 'Zinda Jan', name_fa: 'زنده جان', name_ps: 'زنده جان', code: 'HER-14' },
    { province: 'Herat', name: 'Kohsan', name_fa: 'کهسان', name_ps: 'کهسان', code: 'HER-15' },
    { province: 'Herat', name: 'Chishti Sharif', name_fa: 'چشتی شریف', name_ps: 'چشتي شریف', code: 'HER-16' },
    { province: 'Herat', name: 'Torghundi', name_fa: 'تورغندی', name_ps: 'تورغندي', code: 'HER-17' },

    // Kandahar Province (16 districts)
    { province: 'Kandahar', name: 'Kandahar City', name_fa: 'شهر قندهار', name_ps: 'د کندهار ښار', code: 'KAN-01' },
    { province: 'Kandahar', name: 'Daman', name_fa: 'دامان', name_ps: 'دامان', code: 'KAN-02' },
    { province: 'Kandahar', name: 'Panjwayi', name_fa: 'پنجوایی', name_ps: 'پنجوایي', code: 'KAN-03' },
    { province: 'Kandahar', name: 'Spin Boldak', name_fa: 'سپین بولدک', name_ps: 'سپین بولدک', code: 'KAN-04' },
    { province: 'Kandahar', name: 'Arghandab', name_fa: 'ارغنداب', name_ps: 'ارغنداب', code: 'KAN-05' },
    { province: 'Kandahar', name: 'Maiwand', name_fa: 'میوند', name_ps: 'میوند', code: 'KAN-06' },
    { province: 'Kandahar', name: 'Shah Wali Kot', name_fa: 'شاه ولی کوت', name_ps: 'شاه ولي کوټ', code: 'KAN-07' },
    { province: 'Kandahar', name: 'Khakrez', name_fa: 'خاکریز', name_ps: 'خاکریز', code: 'KAN-08' },
    { province: 'Kandahar', name: 'Ghorak', name_fa: 'غورک', name_ps: 'غورک', code: 'KAN-09' },
    { province: 'Kandahar', name: 'Maruf', name_fa: 'معروف', name_ps: 'معروف', code: 'KAN-10' },
    { province: 'Kandahar', name: 'Arghistan', name_fa: 'ارغستان', name_ps: 'ارغستان', code: 'KAN-11' },
    { province: 'Kandahar', name: 'Nish', name_fa: 'نیش', name_ps: 'نیش', code: 'KAN-12' },
    { province: 'Kandahar', name: 'Reg', name_fa: 'ریگ', name_ps: 'ریګ', code: 'KAN-13' },
    { province: 'Kandahar', name: 'Shorabak', name_fa: 'شورابک', name_ps: 'شورابک', code: 'KAN-14' },
    { province: 'Kandahar', name: 'Zhari', name_fa: 'ژړی', name_ps: 'ژړی', code: 'KAN-15' },
    { province: 'Kandahar', name: 'Dand', name_fa: 'دند', name_ps: 'دند', code: 'KAN-16' },

    // Balkh Province (15 districts)
    { province: 'Balkh', name: 'Mazar-i-Sharif', name_fa: 'مزار شریف', name_ps: 'مزار شریف', code: 'BAL-01' },
    { province: 'Balkh', name: 'Balkh', name_fa: 'بلخ', name_ps: 'بلخ', code: 'BAL-02' },
    { province: 'Balkh', name: 'Dehdadi', name_fa: 'دهدادی', name_ps: 'دهدادي', code: 'BAL-03' },
    { province: 'Balkh', name: 'Chimtal', name_fa: 'چمتال', name_ps: 'چمتال', code: 'BAL-04' },
    { province: 'Balkh', name: 'Nahr-e-Shahi', name_fa: 'نهر شاهی', name_ps: 'نهر شاهي', code: 'BAL-05' },
    { province: 'Balkh', name: 'Char Bolak', name_fa: 'چار بولک', name_ps: 'چاربولک', code: 'BAL-06' },
    { province: 'Balkh', name: 'Char Kint', name_fa: 'چارکنت', name_ps: 'چارکنت', code: 'BAL-07' },
    { province: 'Balkh', name: 'Dawlatabad', name_fa: 'دولت آباد', name_ps: 'دولت آباد', code: 'BAL-08' },
    { province: 'Balkh', name: 'Kaldar', name_fa: 'کلدار', name_ps: 'کلدار', code: 'BAL-09' },
    { province: 'Balkh', name: 'Khulm', name_fa: 'خلم', name_ps: 'خلم', code: 'BAL-10' },
    { province: 'Balkh', name: 'Kishindih', name_fa: 'کشنده', name_ps: 'کشنده', code: 'BAL-11' },
    { province: 'Balkh', name: 'Marmul', name_fa: 'مارمل', name_ps: 'مارمل', code: 'BAL-12' },
    { province: 'Balkh', name: 'Shortipa', name_fa: 'شورتیپه', name_ps: 'شورتیپه', code: 'BAL-13' },
    { province: 'Balkh', name: 'Zari', name_fa: 'زاری', name_ps: 'زاري', code: 'BAL-14' },
    { province: 'Balkh', name: 'Sholgara', name_fa: 'شولگره', name_ps: 'شولګره', code: 'BAL-15' },

    // Nangarhar Province (22 districts)
    { province: 'Nangarhar', name: 'Jalalabad', name_fa: 'جلال‌آباد', name_ps: 'جلال آباد', code: 'NAN-01' },
    { province: 'Nangarhar', name: 'Behsud', name_fa: 'بهسود', name_ps: 'بهسود', code: 'NAN-02' },
    { province: 'Nangarhar', name: 'Surkh Rod', name_fa: 'سرخ رود', name_ps: 'سرخ رود', code: 'NAN-03' },
    { province: 'Nangarhar', name: 'Kama', name_fa: 'کامه', name_ps: 'کامه', code: 'NAN-04' },
    { province: 'Nangarhar', name: 'Rodat', name_fa: 'رودات', name_ps: 'رودات', code: 'NAN-05' },
    { province: 'Nangarhar', name: 'Achin', name_fa: 'اچین', name_ps: 'اچین', code: 'NAN-06' },
    { province: 'Nangarhar', name: 'Bati Kot', name_fa: 'باتی کوت', name_ps: 'باتي کوټ', code: 'NAN-07' },
    { province: 'Nangarhar', name: 'Chaparhar', name_fa: 'چپرهار', name_ps: 'چپرهار', code: 'NAN-08' },
    { province: 'Nangarhar', name: 'Darai Nur', name_fa: 'درۀ نور', name_ps: 'درۀ نور', code: 'NAN-09' },
    { province: 'Nangarhar', name: 'Dih Bala', name_fa: 'ده بالا', name_ps: 'ده بالا', code: 'NAN-10' },
    { province: 'Nangarhar', name: 'Ghani Khel', name_fa: 'غنی خیل', name_ps: 'غني خیل', code: 'NAN-11' },
    { province: 'Nangarhar', name: 'Goshta', name_fa: 'گوشته', name_ps: 'ګوښته', code: 'NAN-12' },
    { province: 'Nangarhar', name: 'Haska Mena', name_fa: 'حسکه مینه', name_ps: 'حسکه مینه', code: 'NAN-13' },
    { province: 'Nangarhar', name: 'Khogyani', name_fa: 'خوگیانی', name_ps: 'خوګیاني', code: 'NAN-14' },
    { province: 'Nangarhar', name: 'Kot', name_fa: 'کوت', name_ps: 'کوټ', code: 'NAN-15' },
    { province: 'Nangarhar', name: 'Kuz Kunar', name_fa: 'کوز کنر', name_ps: 'کوز کنړ', code: 'NAN-16' },
    { province: 'Nangarhar', name: 'Lal Pur', name_fa: 'لعل پور', name_ps: 'لعل پور', code: 'NAN-17' },
    { province: 'Nangarhar', name: 'Mohmand Dara', name_fa: 'مومند دره', name_ps: 'مومند دره', code: 'NAN-18' },
    { province: 'Nangarhar', name: 'Nazyan', name_fa: 'نازیان', name_ps: 'نازیان', code: 'NAN-19' },
    { province: 'Nangarhar', name: 'Pachir Wa Agam', name_fa: 'پچیر و اگام', name_ps: 'پچیر و اګام', code: 'NAN-20' },
    { province: 'Nangarhar', name: 'Shinwar', name_fa: 'شینوار', name_ps: 'شینوار', code: 'NAN-21' },
    { province: 'Nangarhar', name: 'Durbaba', name_fa: 'دوربابا', name_ps: 'دوربابا', code: 'NAN-22' },

    // Badakhshan Province (28 districts)
    { province: 'Badakhshan', name: 'Fayzabad', name_fa: 'فیض‌آباد', name_ps: 'فیض آباد', code: 'BDS-01' },
    { province: 'Badakhshan', name: 'Baharak', name_fa: 'بهارک', name_ps: 'بهارک', code: 'BDS-02' },
    { province: 'Badakhshan', name: 'Jurm', name_fa: 'جرم', name_ps: 'جرم', code: 'BDS-03' },
    { province: 'Badakhshan', name: 'Ishkashim', name_fa: 'اشکاشم', name_ps: 'اشکاشم', code: 'BDS-04' },
    { province: 'Badakhshan', name: 'Argo', name_fa: 'ارگو', name_ps: 'ارګو', code: 'BDS-05' },
    { province: 'Badakhshan', name: 'Darayim', name_fa: 'درایم', name_ps: 'درایم', code: 'BDS-06' },
    { province: 'Badakhshan', name: 'Khash', name_fa: 'خاش', name_ps: 'خاش', code: 'BDS-07' },
    { province: 'Badakhshan', name: 'Khwahan', name_fa: 'خواهان', name_ps: 'خواهان', code: 'BDS-08' },
    { province: 'Badakhshan', name: 'Kishim', name_fa: 'کشم', name_ps: 'کشم', code: 'BDS-09' },
    { province: 'Badakhshan', name: 'Kuran Wa Munjan', name_fa: 'کران و منجان', name_ps: 'کران و منجان', code: 'BDS-10' },
    { province: 'Badakhshan', name: 'Raghistan', name_fa: 'راغستان', name_ps: 'راغستان', code: 'BDS-11' },
    { province: 'Badakhshan', name: 'Shahri Buzurg', name_fa: 'شهری بزرگ', name_ps: 'شهري بزرګ', code: 'BDS-12' },
    { province: 'Badakhshan', name: 'Shighnan', name_fa: 'شغنان', name_ps: 'شغنان', code: 'BDS-13' },
    { province: 'Badakhshan', name: 'Shuhada', name_fa: 'شهدا', name_ps: 'شهدا', code: 'BDS-14' },
    { province: 'Badakhshan', name: 'Tagab', name_fa: 'تگاب', name_ps: 'تګاب', code: 'BDS-15' },
    { province: 'Badakhshan', name: 'Tishkan', name_fa: 'تیشکان', name_ps: 'تیشکان', code: 'BDS-16' },
    { province: 'Badakhshan', name: 'Wakhan', name_fa: 'واخان', name_ps: 'واخان', code: 'BDS-17' },
    { province: 'Badakhshan', name: 'Wurduj', name_fa: 'وردوج', name_ps: 'وردوج', code: 'BDS-18' },
    { province: 'Badakhshan', name: 'Yaftali Sufla', name_fa: 'یفتل سفلی', name_ps: 'یفتل سفلي', code: 'BDS-19' },
    { province: 'Badakhshan', name: 'Yawan', name_fa: 'یاوان', name_ps: 'یاوان', code: 'BDS-20' },
    { province: 'Badakhshan', name: 'Zebak', name_fa: 'زیباک', name_ps: 'زیباک', code: 'BDS-21' },
    { province: 'Badakhshan', name: 'Kohistan', name_fa: 'کوهستان', name_ps: 'کوهستان', code: 'BDS-22' },
    { province: 'Badakhshan', name: 'Maimay', name_fa: 'میمی', name_ps: 'میمي', code: 'BDS-23' },
    { province: 'Badakhshan', name: 'Warduj', name_fa: 'وردج', name_ps: 'وردج', code: 'BDS-24' },
    { province: 'Badakhshan', name: 'Yamgan', name_fa: 'یمگان', name_ps: 'یمګان', code: 'BDS-25' },
    { province: 'Badakhshan', name: 'Yumgan', name_fa: 'یمگان', name_ps: 'یمګان', code: 'BDS-26' },
    { province: 'Badakhshan', name: 'Keran-o-Menjan', name_fa: 'کران و منجان', name_ps: 'کران او منجان', code: 'BDS-27' },
    { province: 'Badakhshan', name: 'Tagab-e-Argu', name_fa: 'تگاب ارگو', name_ps: 'تګاب ارګو', code: 'BDS-28' },

    // Baghlan Province (15 districts)
    { province: 'Baghlan', name: 'Pul-e-Khumri', name_fa: 'پل خمری', name_ps: 'پل خمري', code: 'BGL-01' },
    { province: 'Baghlan', name: 'Baghlan', name_fa: 'بغلان', name_ps: 'بغلان', code: 'BGL-02' },
    { province: 'Baghlan', name: 'Doshi', name_fa: 'دوشی', name_ps: 'دوشي', code: 'BGL-03' },
    { province: 'Baghlan', name: 'Nahrin', name_fa: 'نهرین', name_ps: 'نهرین', code: 'BGL-04' },
    { province: 'Baghlan', name: 'Andarab', name_fa: 'اندراب', name_ps: 'اندراب', code: 'BGL-05' },
    { province: 'Baghlan', name: 'Burka', name_fa: 'برکه', name_ps: 'برکه', code: 'BGL-06' },
    { province: 'Baghlan', name: 'Dahana-i-Ghuri', name_fa: 'دهنه غوری', name_ps: 'دهنه غوري', code: 'BGL-07' },
    { province: 'Baghlan', name: 'Dahanah-ye Ghawri', name_fa: 'دهنه غوری', name_ps: 'دهنه غوري', code: 'BGL-08' },
    { province: 'Baghlan', name: 'Farang Wa Gharu', name_fa: 'فرنگ و غارو', name_ps: 'فرنګ او غارو', code: 'BGL-09' },
    { province: 'Baghlan', name: 'Khenjan', name_fa: 'خنجان', name_ps: 'خنجان', code: 'BGL-10' },
    { province: 'Baghlan', name: 'Khost Wa Fereng', name_fa: 'خوست و فرنگ', name_ps: 'خوست او فرنګ', code: 'BGL-11' },
    { province: 'Baghlan', name: 'Pul-e-Hesar', name_fa: 'پل حصار', name_ps: 'پل حصار', code: 'BGL-12' },
    { province: 'Baghlan', name: 'Tala Wa Barfak', name_fa: 'تاله و برفک', name_ps: 'تاله او برفک', code: 'BGL-13' },
    { province: 'Baghlan', name: 'Dahana-i-Ghawri', name_fa: 'دهانه غوری', name_ps: 'دهانه غوري', code: 'BGL-14' },
    { province: 'Baghlan', name: 'Khwaja Hejran', name_fa: 'خواجه هجران', name_ps: 'خواجه هجران', code: 'BGL-15' },

    // Ghazni Province (19 districts)
    { province: 'Ghazni', name: 'Ghazni City', name_fa: 'شهر غزنی', name_ps: 'د غزني ښار', code: 'GHA-01' },
    { province: 'Ghazni', name: 'Andar', name_fa: 'اندر', name_ps: 'اندړ', code: 'GHA-02' },
    { province: 'Ghazni', name: 'Qarabagh', name_fa: 'قره باغ', name_ps: 'قره باغ', code: 'GHA-03' },
    { province: 'Ghazni', name: 'Jaghori', name_fa: 'جاغوری', name_ps: 'جاغوري', code: 'GHA-04' },
    { province: 'Ghazni', name: 'Ab Band', name_fa: 'آب بند', name_ps: 'اب بند', code: 'GHA-05' },
    { province: 'Ghazni', name: 'Ajristan', name_fa: 'اجرستان', name_ps: 'اجرستان', code: 'GHA-06' },
    { province: 'Ghazni', name: 'Dih Yak', name_fa: 'ده یک', name_ps: 'ده یک', code: 'GHA-07' },
    { province: 'Ghazni', name: 'Gelan', name_fa: 'گیلان', name_ps: 'ګیلان', code: 'GHA-08' },
    { province: 'Ghazni', name: 'Giro', name_fa: 'گیرو', name_ps: 'ګیرو', code: 'GHA-09' },
    { province: 'Ghazni', name: 'Jaghatu', name_fa: 'جغتو', name_ps: 'جغتو', code: 'GHA-10' },
    { province: 'Ghazni', name: 'Khwaja Umari', name_fa: 'خواجه عمری', name_ps: 'خواجه عمري', code: 'GHA-11' },
    { province: 'Ghazni', name: 'Malistan', name_fa: 'مالستان', name_ps: 'مالستان', code: 'GHA-12' },
    { province: 'Ghazni', name: 'Muqur', name_fa: 'مقر', name_ps: 'مقر', code: 'GHA-13' },
    { province: 'Ghazni', name: 'Nawa', name_fa: 'ناوه', name_ps: 'ناوه', code: 'GHA-14' },
    { province: 'Ghazni', name: 'Nawur', name_fa: 'ناور', name_ps: 'ناور', code: 'GHA-15' },
    { province: 'Ghazni', name: 'Rashidan', name_fa: 'رشیدان', name_ps: 'رشیدان', code: 'GHA-16' },
    { province: 'Ghazni', name: 'Wali Muhammad Shahid', name_fa: 'ولی محمد شهید', name_ps: 'ولي محمد شهید', code: 'GHA-17' },
    { province: 'Ghazni', name: 'Zana Khan', name_fa: 'زنه خان', name_ps: 'زنه خان', code: 'GHA-18' },
    { province: 'Ghazni', name: 'Waghaz', name_fa: 'واغظ', name_ps: 'واغظ', code: 'GHA-19' },

    // Kunduz Province (7 districts)
    { province: 'Kunduz', name: 'Kunduz City', name_fa: 'شهر قندوز', name_ps: 'د کندوز ښار', code: 'KDZ-01' },
    { province: 'Kunduz', name: 'Khan Abad', name_fa: 'خان‌آباد', name_ps: 'خان آباد', code: 'KDZ-02' },
    { province: 'Kunduz', name: 'Imam Sahib', name_fa: 'امام صاحب', name_ps: 'امام صاحب', code: 'KDZ-03' },
    { province: 'Kunduz', name: 'Char Dara', name_fa: 'چهار دره', name_ps: 'څلور دره', code: 'KDZ-04' },
    { province: 'Kunduz', name: 'Aliabad', name_fa: 'علی آباد', name_ps: 'علي آباد', code: 'KDZ-05' },
    { province: 'Kunduz', name: 'Dasht-e-Archi', name_fa: 'دشت ارچی', name_ps: 'دشت ارچي', code: 'KDZ-06' },
    { province: 'Kunduz', name: 'Qalay-i-Zal', name_fa: 'قلعه زال', name_ps: 'قلعه زال', code: 'KDZ-07' },

    // Helmand Province (13 districts)
    { province: 'Helmand', name: 'Lashkar Gah', name_fa: 'لشکرگاه', name_ps: 'لښکرګاه', code: 'HEL-01' },
    { province: 'Helmand', name: 'Gereshk', name_fa: 'گرشک', name_ps: 'ګرشک', code: 'HEL-02' },
    { province: 'Helmand', name: 'Nad Ali', name_fa: 'ناد علی', name_ps: 'ناد علي', code: 'HEL-03' },
    { province: 'Helmand', name: 'Sangin', name_fa: 'سنگین', name_ps: 'سنګین', code: 'HEL-04' },
    { province: 'Helmand', name: 'Kajaki', name_fa: 'کجکی', name_ps: 'کجکي', code: 'HEL-05' },
    { province: 'Helmand', name: 'Musa Qala', name_fa: 'موسی قلعه', name_ps: 'موسی قلعه', code: 'HEL-06' },
    { province: 'Helmand', name: 'Naw Zad', name_fa: 'نوزاد', name_ps: 'نوزاد', code: 'HEL-07' },
    { province: 'Helmand', name: 'Baghran', name_fa: 'بغران', name_ps: 'بغران', code: 'HEL-08' },
    { province: 'Helmand', name: 'Dishu', name_fa: 'دیشو', name_ps: 'دیشو', code: 'HEL-09' },
    { province: 'Helmand', name: 'Garmser', name_fa: 'گرمسیر', name_ps: 'ګرمسیر', code: 'HEL-10' },
    { province: 'Helmand', name: 'Khanashin', name_fa: 'خان نشین', name_ps: 'خان نشین', code: 'HEL-11' },
    { province: 'Helmand', name: 'Nahr-i-Saraj', name_fa: 'نهر سراج', name_ps: 'نهر سراج', code: 'HEL-12' },
    { province: 'Helmand', name: 'Washer', name_fa: 'واشیر', name_ps: 'واشیر', code: 'HEL-13' }
  ];

  const insertDistrict = db.prepare(`
    INSERT OR IGNORE INTO districts (province_id, name, name_fa, name_ps, code)
    VALUES (?, ?, ?, ?, ?)
  `);

  const districtIds: { [key: string]: number } = {};
  let inserted = 0;
  let skipped = 0;

  for (const district of districts) {
    const provinceId = provinceIds[district.province];
    if (provinceId) {
      const result = insertDistrict.run(provinceId, district.name, district.name_fa, district.name_ps, district.code);
      if (result.changes > 0) {
        inserted++;
      } else {
        skipped++;
        console.log(`Skipped duplicate: ${district.code} - ${district.name}`);
      }
      const existing = db.prepare('SELECT id FROM districts WHERE code = ?').get(district.code) as { id: number } | undefined;
      if (existing) {
        districtIds[district.code] = existing.id;
      }
    } else {
      console.log(`Province not found for district: ${district.province} - ${district.name}`);
    }
  }

  console.log(`Districts: ${inserted} inserted, ${skipped} skipped (duplicates)`);
  console.log(`Total districts in seed data: ${districts.length}`);

  // Create sample hawaladars
  const hawaladars = [
    // Kabul hawaladars
    {
      name: 'Ahmad Shah Money Exchange',
      name_fa: 'صرافی احمد شاه',
      name_ps: 'د احمد شاه صرافي',
      phone: '+93700123456',
      province: 'Kabul',
      district: 'KBL-01',
      location: 'Sarai Shahzada, Kabul City',
      location_fa: 'سرای شهزاده، شهر کابل',
      location_ps: 'سرای شهزاده، د کابل ښار',
      commission_rate: 2.0
    },
    {
      name: 'Karimi Hawala',
      name_fa: 'حواله کریمی',
      name_ps: 'کریمي حواله',
      phone: '+93700234567',
      province: 'Kabul',
      district: 'KBL-01',
      location: 'Money Exchange Market, Kabul',
      location_fa: 'بازار صرافی، کابل',
      location_ps: 'د صرافۍ بازار، کابل',
      commission_rate: 1.8
    },
    {
      name: 'Paghman Transfer Services',
      name_fa: 'خدمات انتقال پغمان',
      name_ps: 'د پغمان لیږد خدمات',
      phone: '+93700345678',
      province: 'Kabul',
      district: 'KBL-02',
      location: 'Paghman District Center',
      location_fa: 'مرکز ولسوالی پغمان',
      location_ps: 'د پغمان ولسوالۍ مرکز',
      commission_rate: 2.2
    },

    // Herat hawaladars
    {
      name: 'Herat International Exchange',
      name_fa: 'صرافی بین‌المللی هرات',
      name_ps: 'د هرات نړیوال صرافي',
      phone: '+93790123456',
      province: 'Herat',
      district: 'HER-01',
      location: 'Khorasan Market, Herat City',
      location_fa: 'بازار خراسان، شهر هرات',
      location_ps: 'د خراسان بازار، د هرات ښار',
      commission_rate: 1.9
    },
    {
      name: 'Injil Money Transfer',
      name_fa: 'انتقال پول انجیل',
      name_ps: 'د انجیل پیسې لیږد',
      phone: '+93790234567',
      province: 'Herat',
      district: 'HER-02',
      location: 'Injil Bazaar',
      location_fa: 'بازار انجیل',
      location_ps: 'د انجیل بازار',
      commission_rate: 2.1
    },
    {
      name: 'Shindand Hawala Center',
      name_fa: 'مرکز حواله شینډنډ',
      name_ps: 'د شینډنډ حواله مرکز',
      phone: '+93790345678',
      province: 'Herat',
      district: 'HER-05',
      location: 'Shindand Main Market',
      location_fa: 'بازار اصلی شیندند',
      location_ps: 'د شینډنډ اصلي بازار',
      commission_rate: 2.3
    },

    // Kandahar hawaladars
    {
      name: 'Kandahar Express Transfer',
      name_fa: 'انتقال سریع قندهار',
      name_ps: 'د کندهار چټک لیږد',
      phone: '+93770123456',
      province: 'Kandahar',
      district: 'KAN-01',
      location: 'City Center, Kandahar',
      location_fa: 'مرکز شهر، قندهار',
      location_ps: 'د ښار مرکز، کندهار',
      commission_rate: 2.0
    },
    {
      name: 'Spin Boldak Border Exchange',
      name_fa: 'صرافی مرزی سپین بولدک',
      name_ps: 'د سپین بولدک پوله ییزه صرافي',
      phone: '+93770234567',
      province: 'Kandahar',
      district: 'KAN-04',
      location: 'Border Market, Spin Boldak',
      location_fa: 'بازار مرزی، سپین بولدک',
      location_ps: 'پوله ییز بازار، سپین بولدک',
      commission_rate: 1.7
    },

    // Balkh hawaladars
    {
      name: 'Mazar Trading House',
      name_fa: 'خانه تجارتی مزار',
      name_ps: 'د مزار سوداګریز کور',
      phone: '+93760123456',
      province: 'Balkh',
      district: 'BAL-01',
      location: 'Central Bazaar, Mazar-i-Sharif',
      location_fa: 'بازار مرکزی، مزار شریف',
      location_ps: 'مرکزي بازار، مزار شریف',
      commission_rate: 1.9
    },
    {
      name: 'Balkh Province Transfer',
      name_fa: 'انتقال ولایت بلخ',
      name_ps: 'د بلخ ولایت لیږد',
      phone: '+93760234567',
      province: 'Balkh',
      district: 'BAL-02',
      location: 'Balkh District Market',
      location_fa: 'بازار ولسوالی بلخ',
      location_ps: 'د بلخ ولسوالۍ بازار',
      commission_rate: 2.0
    },

    // Nangarhar hawaladars
    {
      name: 'Jalalabad Money Services',
      name_fa: 'خدمات پولی جلال‌آباد',
      name_ps: 'د جلال آباد پیسو خدمات',
      phone: '+93750123456',
      province: 'Nangarhar',
      district: 'NAN-01',
      location: 'Jalalabad City Center',
      location_fa: 'مرکز شهر جلال‌آباد',
      location_ps: 'د جلال آباد ښار مرکز',
      commission_rate: 2.0
    },
    {
      name: 'Torkham Border Exchange',
      name_fa: 'صرافی مرزی تورخم',
      name_ps: 'د تورخم پوله ییزه صرافي',
      phone: '+93750234567',
      province: 'Nangarhar',
      district: 'NAN-04',
      location: 'Torkham Border, Kama',
      location_fa: 'مرز تورخم، کامه',
      location_ps: 'د تورخم پوله، کامه',
      commission_rate: 1.6
    },

    // Badakhshan hawaladars
    {
      name: 'Fayzabad Transfer Center',
      name_fa: 'مرکز انتقال فیض‌آباد',
      name_ps: 'د فیض آباد لیږد مرکز',
      phone: '+93780123456',
      province: 'Badakhshan',
      district: 'BDS-01',
      location: 'Main Market, Fayzabad',
      location_fa: 'بازار اصلی، فیض‌آباد',
      location_ps: 'اصلي بازار، فیض آباد',
      commission_rate: 2.5
    },

    // Kunduz hawaladars
    {
      name: 'Kunduz Money Exchange',
      name_fa: 'صرافی قندوز',
      name_ps: 'د کندوز صرافي',
      phone: '+93710123456',
      province: 'Kunduz',
      district: 'KDZ-01',
      location: 'City Center, Kunduz',
      location_fa: 'مرکز شهر، قندوز',
      location_ps: 'د ښار مرکز، کندوز',
      commission_rate: 2.1
    },
    {
      name: 'Khan Abad Financial Services',
      name_fa: 'خدمات مالی خان‌آباد',
      name_ps: 'د خان آباد مالي خدمات',
      phone: '+93710234567',
      province: 'Kunduz',
      district: 'KDZ-02',
      location: 'Khan Abad Bazaar',
      location_fa: 'بازار خان‌آباد',
      location_ps: 'د خان آباد بازار',
      commission_rate: 2.2
    },

    // Helmand hawaladars
    {
      name: 'Lashkar Gah Transfer',
      name_fa: 'انتقال لشکرگاه',
      name_ps: 'د لښکرګاه لیږد',
      phone: '+93730123456',
      province: 'Helmand',
      district: 'HEL-01',
      location: 'Provincial Center, Lashkar Gah',
      location_fa: 'مرکز ولایت، لشکرگاه',
      location_ps: 'ولایتي مرکز، لښکرګاه',
      commission_rate: 2.3
    },
    {
      name: 'Gereshk Money Exchange',
      name_fa: 'صرافی گرشک',
      name_ps: 'د ګرشک صرافي',
      phone: '+93730234567',
      province: 'Helmand',
      district: 'HEL-02',
      location: 'Gereshk Main Road',
      location_fa: 'جاده اصلی گرشک',
      location_ps: 'د ګرشک اصلي سړک',
      commission_rate: 2.4
    },

    // Ghazni hawaladars
    {
      name: 'Ghazni City Exchange',
      name_fa: 'صرافی شهر غزنی',
      name_ps: 'د غزني ښار صرافي',
      phone: '+93720123456',
      province: 'Ghazni',
      district: 'GHA-01',
      location: 'Ghazni City Market',
      location_fa: 'بازار شهر غزنی',
      location_ps: 'د غزني ښار بازار',
      commission_rate: 2.2
    }
  ];

  const insertHawaladar = db.prepare(`
    INSERT OR IGNORE INTO hawaladars (name, name_fa, name_ps, phone, province_id, district_id, location, location_fa, location_ps, commission_rate)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let hawaladarInserted = 0;
  let hawaladarSkipped = 0;

  for (const hawaladar of hawaladars) {
    const provinceId = provinceIds[hawaladar.province];
    const districtId = districtIds[hawaladar.district];

    if (provinceId) {
      const result = insertHawaladar.run(
        hawaladar.name,
        hawaladar.name_fa,
        hawaladar.name_ps,
        hawaladar.phone,
        provinceId,
        districtId || null,
        hawaladar.location,
        hawaladar.location_fa,
        hawaladar.location_ps,
        hawaladar.commission_rate
      );
      if (result.changes > 0) {
        hawaladarInserted++;
      } else {
        hawaladarSkipped++;
      }
    } else {
      console.log(`Province not found for hawaladar: ${hawaladar.province} - ${hawaladar.name}`);
    }
  }

  console.log(`Hawaladars: ${hawaladarInserted} inserted, ${hawaladarSkipped} skipped (duplicates)`);

  // Create admin user with secure random password (or from env)
  const adminPassword = process.env.ADMIN_PASSWORD || crypto.randomBytes(16).toString('hex');
  const hashedAdminPassword = await bcrypt.hash(adminPassword, 12);
  db.prepare(`
    INSERT OR IGNORE INTO users (username, email, password, full_name, role)
    VALUES ('admin', 'admin@afghanexchange.com', ?, 'System Administrator', 'admin')
  `).run(hashedAdminPassword);

  if (!process.env.ADMIN_PASSWORD) {
    console.log('\n*** GENERATED ADMIN PASSWORD ***');
    console.log('Email: admin@afghanexchange.com');
    console.log('Password:', adminPassword);
    console.log('SAVE THIS PASSWORD - it will not be shown again!\n');
  }

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

  // Save database to disk
  saveDatabaseNow();
  console.log('Database saved to disk');
}

seed().catch(console.error);

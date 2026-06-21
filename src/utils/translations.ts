export type Locale = 'en' | 'ur';

// Urdu number converter
export const toUrduNumbers = (numStr: string | number): string => {
  const urduDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(numStr).replace(/[0-9]/g, (w) => urduDigits[parseInt(w, 10)]);
};

// UI text translations
export const uiTranslations: Record<Locale, Record<string, string>> = {
  en: {
    eyebrow: 'Anjuman-e-Imamia · Richmond Town',
    title: 'Majlis-e-Aza',
    subtitle: 'Moharram-ul-Haraam 1448 AH · Bengaluru',
    live_now: 'LIVE NOW',
    home: 'Home',
    venues: 'Venues',
    todays_majlis: "Today's Majlis",
    upcoming_majlis: 'Upcoming Majlis',
    past_majlises: 'Past Majlises',
    concluded_majlises: 'Concluded Majlises',
    completed_badge: 'Completed',
    other_majlis: 'Other majlis at this venue',
    full_schedule: 'Full schedule this Moharram',
    get_directions: 'Get Directions',
    watch_live: 'Watch Live',
    date: 'Date',
    time: 'Time',
    minjanib: 'Minjanib',
    bayan_by: 'Bayan by',
    all: 'All',
    notes: 'Notes',
    photo_soon: 'Photo coming soon',
    no_majlis_day: 'No majlis recorded for this day yet.',
    all_concluded: 'All majlises for today have concluded.',
    all_concluded_day: 'All majlises for this day have concluded.',
    past_count: 'completed',
    past_badge: 'past',
    chand_raat: 'Chand Raat',
    moharram_day: 'Moharram',
  },
  ur: {
    eyebrow: 'انجمنِ امامیہ · رچمنڈ ٹاؤن',
    title: 'مجلسِ عزا',
    subtitle: 'محرم الحرام ۱۴۴۸ ھ · بنگلور',
    live_now: 'ابھی لائیو',
    home: 'ہوم',
    venues: 'مقامات',
    todays_majlis: 'آج کی مجالس',
    upcoming_majlis: 'آنے والی مجالس',
    past_majlises: 'گزشتہ مجالس',
    concluded_majlises: 'مکمل شدہ مجالس',
    completed_badge: 'مکمل',
    other_majlis: 'اس مقام پر دیگر مجالس',
    full_schedule: 'اس محرم کا مکمل شیڈول',
    get_directions: 'راستہ تلاش کریں',
    watch_live: 'لائیو دیکھیں',
    date: 'تاریخ',
    time: 'وقت',
    minjanib: 'منجانب',
    bayan_by: 'بنیان گزار / بیان',
    all: 'تمام',
    notes: 'نوٹس',
    photo_soon: 'تصویر جلد دستیاب ہوگی',
    no_majlis_day: 'اس دن کے لیے کوئی مجلس درج نہیں ہے۔',
    all_concluded: 'آج کی تمام مجالس مکمل ہو چکی ہیں۔',
    all_concluded_day: 'اس دن کی تمام مجالس مکمل ہو چکی ہیں۔',
    past_count: 'مکمل',
    past_badge: 'مکمل',
    chand_raat: 'چاند رات',
    moharram_day: 'محرم',
  }
};

// Dynamic data transliteration dictionary
const dataTranslations: Record<string, string> = {
  // Venues (Names)
  'Masjid e Askari': 'مسجدِ عسکری',
  'Imambara e Askari (Bada Ghar)': 'امام بارگاہِ عسکری (بڑا گھر)',
  'Imamia Manzil': 'امامیہ منزل',
  'Ba\'ab ul Hawaej (A.S)': 'باب الحوائج (ع)',
  'Ba\'ab ul Mura\'ad (A.S)': 'باب المراد (ع)',
  'Ba\'ab ash Shifa\'a': 'باب الشفاء',
  'Azakhana of Nawab Sartaj Hassan Mirza Saheb': 'عزاخانہ نواب سرتاج حسن مرزا صاحب',
  'Azakhana e Raza e Ghareeb (A.S)': 'عزاخانہ رضاۓ غریب (ع)',
  'Azakhana of Nawab Raza Ali Khan Saheb': 'عزاخانہ نواب رضا علی خان صاحب',
  'Azakhana of Mirza Hashim Raza Saheb': 'عزاخانہ مرزا ہاشم رضا صاحب',
  'Azakhana e Arman-e-Zainab (S.A)': 'عزاخانہ ارمانِ زینب (س)',
  'Azakhana e Zehra (S.A)': 'عزاخانہ زہرا (س)',
  'Azakhana e Shezada e Qasim (A.S)': 'عزاخانہ شہزادہ قاسم (ع)',
  'Ashurkhana of Aga Mohammed Hussain Shirazi Saheb': 'عاشور خانہ آغا محمد حسین شیرازی صاحب',
  'Ashurkhana of Aga Mohammed Ebrahim Saheb': 'عاشور خانہ آغا محمد ابراہیم صاحب',
  'Ashurkhana of Mir Gulam Ali Madani Saheb': 'عاشور خانہ میر غلام علی مدنی صاحب',
  'Hussainabad (Aga Abdul Hussain Wakf)': 'حسین آباد (آغا عبدالصمد وقف)',
  'Hussainia, Saqqa e Sakina': 'حسینیہ، سقاء سکینہ',
  'Hussainy Chowk Pandal': 'حسینی چوک پنڈال',
  'Hosur Road Pandal': 'ہوسور روڈ پنڈال',
  'Darbar e Hyderi': 'دربارِ حیدری',
  'Shia Qabrastan': 'شیعہ قبرستان',
  'Aga Abdullah St. / Shia Qabrastan route': 'آغا عبداللہ اسٹریٹ / شیعہ قبرستان روٹ',
  'Hassan Enclave': 'حسن انکلیو',
  'No. 37/1, 80 ft. Road': 'نمبر ۳۷/۱، ۸۰ فٹ روڈ',
  'Residence of Syed Ali Abbas Saheb': 'رہائش گاہ سید علی عباس صاحب',
  'Procession Route: Bangalore → Doddaballapur': 'جلوس کا راستہ: بنگلور ← ڈوڈا بالا پور',

  // Venues (Areas)
  'Richmond Town': 'رچمنڈ ٹاؤن',
  'Shia Aramgarh, Hosur Road': 'شیعہ آرام گاہ، ہوسور روڈ',
  'above Azakhana of Nawab Sartaj Hassan Mirza Saheb, Richmond Town': 'عزاخانہ نواب سرتاج حسن مرزا صاحب کے اوپر، رچمنڈ ٹاؤن',
  'Hosur Road': 'ہوسور روڈ',
  'behind Masjid e Askari, to Shia Qabrastan': 'مسجدِ عسکری کے پیچھے، شیعہ قبرستان تک',
  '# 6/1, Curley Street, Richmond Town': 'نمبر ۶/۱، کرلی اسٹریٹ، رچمنڈ ٹاؤن',
  'Opp. IBP Petrol Pump, 6th Block, Koramangala': 'آئی بی پی پٹرول پمپ کے سامنے، ۶ بلاک، کورامنگلا',
  'No. 21, Castle Street, Ashok Nagar, Bangalore': 'نمبر ۲۱، کیسل اسٹریٹ، اشوک نگر، بنگلور',
  'via Yelahanka, Hebbal, Shoolay Circle': 'بذریعہ یلاہنکا، ہیبل، شولے سرکل',
  'near Imambara e Askari, Bada Ghar, Hosur Road': 'نزد امام بارگاہ عسکری، بڑا گھر، ہوسور روڈ',
  'Koramangala': 'کورامنگلا',
  'Ashok Nagar': 'اشوک نگر',
  'Doddaballapur Route': 'ڈوڈا بالا پور روٹ',

  // Zones
  'Zone A': 'زون اے',
  'Zone B': 'زون بی',
  'Zone C': 'زون سی',
  'All': 'تمام',

  // Sponsors / Minjanib
  'Alhaj Syed Nawazish Hussain & Sons': 'الحاج سید نوازش حسین اور صاحبزادگان',
  "Ghulama'an e Hazrath Ali Asghar (A.S) Committee": 'غلامانِ حضرت علی اصغر (ع) کمیٹی',
  'Sons of Late Moulana S.M. Yousha Faizi Zangipuri Saheb': 'فرزندانِ مرحوم مولانا ایس ایم یوشع فیضی زنگی پوری صاحب',
  'Janab Meer Sujath Hussain Saheb': 'جناب میر سجاد حسین صاحب',
  'Arman e Zainab': 'ارمانِ زینب',
  'Janab Fareedoon Aga Saheb': 'جناب فریدون آغا صاحب',
  'Aga Ali Asker Wakf': 'آغا علی عسکر وقف',
  'Janab Mir Mujtaba Hussain Saheb': 'جناب میر مجتبیٰ حسین صاحب',
  'Janab Syed Jalal Hyder Saheb & Sons (UP)': 'جناب سید جلال حیدر صاحب اور صاحبزادگان (یو پی)',
  'Janab Mir Nasir Hussain Saheb': 'جناب میر ناصر حسین صاحب',
  'Sons of Janab Late Aga Mohammed Karim Sherazi Saheb': 'فرزندانِ جنابِ مرحوم آغا محمد کریم شیرازی صاحب',
  'Janab Syed Mohammed Raheel Saheb': 'جناب سید محمد راحیل صاحب',
  'Family of Late Hasnain Jafry (Asad Jafry)': 'خاندانِ مرحوم حسنین جعفری (اسد جعفری)',
  'Azakhana Fatima Kubra (S.A)': 'عزاخانہ فاطمہ کبریٰ (س)',
  'Janab Syed Arshad Hussain Saheb': 'جناب سید ارشد حسین صاحب',
  'Janab Mahboob Ali Dhanaliwala': 'جناب محبوب علی دھنالی والا',
  'Janab Syed Thasil Abbas Saheb': 'جناب سید تحصیل عباس صاحب',
  'Janab Mir Waris Ali Saheb': 'جناب میر وارث علی صاحب',
  'S/o Janab Late Mir Noorul Hussain Madani Saheb': 'فرزندِ جنابِ مرحوم میر نورالحسن مدنی صاحب',
  'Sons of Late Alhaj Moulana Buniyad Ali Saheb': 'فرزندانِ مرحوم الحاج مولانا بنیاد علی صاحب',
  'Janab Alhaj Mir Manzoor Hussain Saheb & Charolia Brothers': 'جناب الحاج میر منظور حسین صاحب اور چارولیا برادرز',
  'Anjuman e Imamia (Janab Late Aga Mohammed Rahim Saheb @ Babu Aga)': 'انجمنِ امامیہ (جنابِ مرحوم آغا محمد رحیم صاحب @ بابو آغا)',
  'Janab Aga Yousuf Ali Saheb': 'جناب آغا یوسف علی صاحب',
  'Syed Nasir Raza Wasti & Sons': 'سید ناصر رضا واسطی اور صاحبزادگان',
  'Janab Agha Anwar Abbas Saheb': 'جناب آغا انور عباس صاحب',
  'Sons of Janab Late Alhaj Sageer Hassan Ramzan Ali Saheb': 'فرزندانِ جنابِ مرحوم الحاج صغیر حسن رمضان علی صاحب',
  'Janab Late Abdul Hameed (Chotu Saab) Fayaz Hussain & Sons': 'جنابِ مرحوم عبدالحمید (چھوٹو صاحب) فیاض حسین اور صاحبزادگان',
  'Janab Mir Imran Ali Saheb': 'جناب میر عمران علی صاحب',
  "Khadima'ane Ba'ab ul Mura'ad (A.S)": 'خادماتِ باب المراد (ع)',
  'Mohibban e Hazrath Abu Talib (A.S) Committee': 'مہیبانِ حضرت ابو طالب (ع) کمیٹی',
  'Family of Janab Late Mir Safdar Hussain Saheb hosted by Janab Mirza Habib Hussain Saheb (Gents); Late Mrs. Zahida Begum hosted by Janab Mir Ameen Hussain (Ladies)': 'خاندانِ جنابِ مرحوم میر صفدر حسین صاحب زیرِ اہتمام جناب مرزا حبیب حسین صاحب (مردانہ)؛ مرحومہ بیگم زاہدہ زیرِ اہتمام جناب میر امین حسین (زنانہ)',
  'Anjuman e Imamia': 'انجمنِ امامیہ',
  'Masjid e Askari Committee': 'مسجدِ عسکری کمیٹی',
  'Family of Janab Late Mirza Sultan Ali @ Aga Jani Saheb (Gents); Mirza Ali Raza Wakf (Ladies)': 'خاندانِ جنابِ مرحوم مرزا سلطان علی @ آغا جانی صاحب (مردانہ)؛ مرزا علی رضا وقف (زنانہ)',
  'Hazrath Ali Asghar (A.S) Naunihal Association': 'حضرت علی اصغر (ع) نونہال ایسوسی ایشن',
  'Late Janab Mir Amjad Hussain Saheb': 'مرحوم جناب میر امجد حسین صاحب',
  "Ghulama'ane Hazrath Ali Asghar (A.S) Committee": 'غلامانِ حضرت علی اصغر (ع) کمیٹی',
  'Grandsons of Late Alhaj Moulana Buniyad Ali Saheb Committee': 'نواسے مرحوم الحاج مولانا بنیاد علی صاحب کمیٹی',
  'Janab Late Sultan Ali Haji Nassur Saheb, Janab Alhaj Mohsin S. Nassur Saheb & Sons': 'جنابِ مرحوم سلطان علی حاجی نصور صاحب، جناب الحاج محسن ایس نصور صاحب اور صاحبزادگان',
  'Sons of Janab Late AA R Shah Saheb': 'فرزندانِ جنابِ مرحوم اے اے آر شاہ صاحب',
  'Janab Late Alhaj Akbar Ali Badami Saheb': 'جنابِ مرحوم الحاج اکبر علی بادامی صاحب',
  'Janab Alhaj Mir Khadim Hussain Saheb': 'جناب الحاج میر خادم حسین صاحب',
  'Janab Late Qambar Ali Malvia Saheb': 'جنابِ مرحوم قنبر علی مالویا صاحب',
  'Janab Alhaj Mir Muntekhab Ali Saheb': 'جناب الحاج میر منتخب علی صاحب',
  'Sons of Janab Late Aga Kazim Ali Mashadi Saheb': 'فرزندانِ جنابِ مرحوم آغا کاظم علی مشہدی صاحب',
  'Janab Alhaj Mir Arif Ali Saheb (Retd. DYSP)': 'جناب الحاج میر عارف علی صاحب (ریٹائرڈ ڈی وائی ایس پی)',
  'Sons of Janab Late Alhaj Sageer Ramzan Ali Saheb': 'فرزندانِ جنابِ مرحوم الحاج صغیر رمضان علی صاحب',
  'Janab Syed Ali Abbas Saheb (Ex. Joint Sec. AEI)': 'جناب سید علی عباس صاحب (سابق جوائنٹ سکریٹری اے ای آئی)',
  'Hazrath Ali Akbar (A.S) Committee; Nowjawan e Richmond Town': 'حضرت علی اکبر (ع) کمیٹی؛ نوجوانانِ رچمنڈ ٹاؤن',
  'Tabrezi Family': 'تبریزی فیملی',
  'Muntazar e Mehdi (A.S) Committee': 'منتظرِ مہدی (ع) کمیٹی',
  'Karbala Committee a.s.': 'کربلا کمیٹی (ع)',
  'Nazre Hazrath Abbas a.s. Committee (Organisers Mazhar & Team)': 'نذرِ حضرت عباس (ع) کمیٹی (منتظمین مظہر اور ٹیم)',
  'Aun o Mohammed Committee': 'عون و محمد کمیٹی',
  'Youth of Bengaluru': 'نوجوانانِ بنگلور',
  'Late Janab Mirza Altaf Hussain': 'مرحوم جناب مرزا الطاف حسین',
  'Janab Alhaj Mirza Saqawath Ali Baig Saheb': 'جناب الحاج مرزا سخاوت علی بیگ صاحب',
  'Hazrath Syed e Sajjad (A.S) Group': 'حضرت سیدِ سجاج (ع) گروپ',
  'Janab Late Baquer Ali Saheb': 'جنابِ مرحوم باقر علی صاحب',
  'Janab Late Syed Abbas Saheb & Brothers': 'جنابِ مرحوم سید عباس صاحب اور برادران',
  'Janab Zaheen Abbas Saheb': 'جناب ذہین عباس صاحب',
  'Son of Janab Late Dr. Mir Raza Ali Saheb': 'فرزندِ جنابِ مرحوم ڈاکٹر میر رضا علی صاحب',
  'Family of Janab Late Arif Ali Saheb': 'خاندانِ جنابِ مرحوم عارف علی صاحب',
  'Sons of Janab Late Alhaj Mir Raza Ali Saheb (BWSSB)': 'فرزندانِ جنابِ مرحوم الحاج میر رضا علی صاحب (بی ڈبلیو ایس ایس بی)',
  'Janab Alhaj Syed Ahmed Hussain Saheb': 'جناب الحاج سید احمد حسین صاحب',
  'Janab Alhaj Mir Mohammed Ali Saheb & Sons': 'جناب الحاج میر محمد علی صاحب اور صاحبزادگان',
  'Janab Mukhtar Hussain Saheb': 'جناب مختار حسین صاحب',
  'Janab Alhaj Mir Khurram Ali Saheb & Sons': 'جناب الحاج میر خرم علی صاحب اور صاحبزادگان',
  'Sons of Janab Mirza Jaffer Ali Saheb & Late Nagina Begum W/o. Khuddus Ali Baig': 'فرزندانِ جناب مرزا جعفر علی صاحب اور مرحومہ نگینہ بیگم زوجہ قدوس علی بیگ',
  'Syed Raza Ali Abedi': 'سید رضا علی عابدی',
  'Janab Afham Raza Saheb & Brothers': 'جناب افہام رضا صاحب اور برادران',
  'Sons of Janab Late Ali Aga Saheb S/o. Late Mir Aga Saheb': 'فرزندانِ جنابِ مرحوم علی آغا صاحب ابنِ مرحوم میر آغا صاحب',
  'Sons of Janab Late Haji Mir Hassan Raza Tabrezi Saheb': 'فرزندانِ جنابِ مرحوم حاجی میر حسن رضا تبریزی صاحب',
  'Sadiq Ali': 'صادق علی',
  'Asfak Hussain Saheb': 'اشفاق حسین صاحب',
  'Sons of Janab Late Mir Nisar Ali Saheb': 'فرزندانِ جنابِ مرحوم میر نثار علی صاحب',
  'Sons of Janab Late Mirza Inayath Hussain Saheb': 'فرزندانِ جنابِ مرحوم مرزا عنایت حسین صاحب',
  'Sons of Janab Late Alhaj Anwar Ali H. Nassur Saheb': 'فرزندانِ جنابِ مرحوم الحاج انور علی ایچ نصور صاحب',
  'Janab Alhaj Late Mir Ahmed Ali Saheb (ACP Retd.), Son & Grand Son': 'جناب الحاج مرحوم میر احمد علی صاحب (سابق اے سی پی)، فرزند اور نواسہ',
  'Janab Late Alhaj Mirza Mehmood Ali Saheb': 'جنابِ مرحوم الحاج مرزا محمود علی صاحب',
  'Hazrath Ali (A.S) Police Committee Bengaluru': 'حضرت علی (ع) پولیس کمیٹی بنگلور',
  'Sons of Janab Late Alhaj Azeez Mirza Saheb': 'فرزندانِ جنابِ مرحوم الحاج عزیز مرزا صاحب',
  'Sons of Janab Late Mir Imdad Ali Saheb': 'فرزندانِ جنابِ مرحوم میر امداد علی صاحب',
  'Janab Fahim Ganjee Saheb': 'جناب فہیم گنجی صاحب',
  'Nohakhwans of Bangalore': 'نوحہ خوانانِ بنگلور',
  'Janab Syed Ali Abbas Saheb': 'جناب سید علی عباس صاحب',
  'Sons of Late Fathima Begum & Janab Syed Ibne Hassan (Nikhaar Jewellers)': 'فرزندانِ مرحومہ فاطمہ بیگم اور جناب سید ابنِ حسن (نکھار جیولرز)',
  'Hussainy Volunteers / Hazrath Ali Akbar (A.S) Committee': 'حسینی والنٹیرز / حضرت علی اکبر (ع) کمیٹی',

  // Location details / Route points
  'In front of Girias Showroom, Shoolay Circle (route to Doddaballapur)': 'شولے سرکل، گریاس شوروم کے سامنے (ڈوڈا بالا پور روٹ)',
  'Enroute to Doddaballapur (beyond Yelahanka, 5 km)': 'ڈوڈا بالا پور کے راستے میں (یلاہنکا سے ۵ کلومیٹر دور)',
  '18th KM milestone, Bangalore-Doddaballapur Road': '۱۸ واں کلومیٹر سنگِ میل، بنگلور-ڈوڈا بالا پور روڈ',
  '25th KM, Bangalore-Doddaballapur Road': '۲۵ واں کلومیٹر، بنگلور-ڈوڈا بالا پور روڈ',
  '28th KM, Bangalore-Doddaballapur Road': '۲۸ واں کلومیٹر، بنگلور-ڈوڈا بالا پور روڈ',
  '32nd KM, Bangalore-Doddaballapur Road (Toll Plaza)': '۳۲ واں کلومیٹر، بنگلور-ڈوڈا بالا پور روڈ (ٹول پلازہ)',
  'Near Bashethalli (near New Flyover)': 'نزد باشیت ہلی (نئے فلائی اوور کے پاس)',
  'Near Hebbal Junction': 'نزد ہیبل جنکشن',
  'Opp. Shell Petrol Pump, Yelahanka': 'شیل پٹرول پمپ کے سامنے، یلاہنکا',

  // Common tags and sub-phrases
  "Sabeel e Nazr e Sho'hda e Karbala (A.S)": "سبیل و نذرِ شہدائے کربلا (ع)",
  "Sabeel e Nazr e Sho'hda e Karbala (A.S": "سبیل و نذرِ شہدائے کربلا (ع)",
  "Sabeel e Nazr e Sho'hda e Karbala": "سبیل و نذرِ شہدائے کربلا",
  "Sabeel e Nazr e Sho'hda e Karba": "سبیل و نذرِ شہدائے کربلا",
  "Tabarruk after majlis": "مجلس کے بعد تبرک",
  "Tabarruk after Majlis": "مجلس کے بعد تبرک",
  "Tabarruk after Majlis (Ladies & Gents)": "مجلس کے بعد تبرک (مردانہ و زنانہ)",
  "Tabarruk after majlis (Ladies & Gents)": "مجلس کے بعد تبرک (مردانہ و زنانہ)",
  "Tabarruk after Majlis (Ladies)": "مجلس کے بعد تبرک (زنانہ)",
  "Tabarruk after majlis (Ladies)": "مجلس کے بعد تبرک (زنانہ)",
  "After Namaz e Zohrain": "نمازِ ظہرین کے بعد",
  "after Namaz e Zohrain": "نمازِ ظہرین کے بعد",
  "Majlis & Tabarruk": "مجلس اور تبرک",
  "Before Majlis": "مجلس سے پہلے",
  "Before majlis": "مجلس سے پہلے",
  "Ladies & Gents": "مردانہ و زنانہ",
  "Ladies": "زنانہ",
};

// Word translation map for fallback/splitting
const wordTranslations: Record<string, string> = {
  // Weekdays (with correct casing)
  'Sun': 'اتوار',
  'Mon': 'پیر',
  'Tue': 'منگل',
  'Wed': 'بدھ',
  'Thu': 'جمعرات',
  'Fri': 'جمعہ',
  'Sat': 'ہفتہ',
  'SUN': 'اتوار',
  'MON': 'پیر',
  'TUE': 'منگل',
  'WED': 'بدھ',
  'THU': 'جمعرات',
  'FRI': 'جمعہ',
  'SAT': 'ہفتہ',

  // Special tags
  'Sar-e-Moharram': 'سرِ محرم',
  'Shab-e-Ashoor': 'شبِ عاشور',
  'Ashura': 'عاشورہ',

  // Time expressions
  'AM': 'صبح',
  'PM': 'شام',
  'Before': 'پہلے',
  'Majlis': 'مجلس',
  'majlis': 'مجلس',
  'FAAQA': 'فاقہ',
  'SHIKANI': 'شکنی',
  'Tea': 'چائے',
  'during': 'دوران',
  'Tabarruk': 'تبرک',
  'after': 'بعد',
  'Juloos': 'جلوس',
  'Midnight': 'آدھی رات',
  'night': 'رات',
  'Moharram': 'محرم',
  '16th': '۱۶ ویں',
  'Aag': 'آگ',
  'Ka': 'کا',
  "Ma'atam": 'ماتم',
  'PM-Midnight': 'شام تا آدھی رات',
  '12:00': '۱۲:۰۰',
};

// Translate text dynamically based on locale
export const translate = (text: string | undefined, locale: Locale): string => {
  if (!text) return '';
  if (locale === 'en') return text;

  const trimmed = text.trim();
  if (dataTranslations[trimmed]) {
    return dataTranslations[trimmed];
  }

  // Parse time formats e.g. "7:15 PM" -> "۷:۱۵ شام" or "7:15" -> "۷:۱۵"
  if (/^\d{1,2}:\d{2}\s*(?:AM|PM)?$/i.test(trimmed)) {
    let result = trimmed
      .replace(/AM/i, 'صبح')
      .replace(/PM/i, 'شام');
    return toUrduNumbers(result);
  }

  // If the word has an exact translation in wordTranslations, return it
  if (wordTranslations[trimmed]) {
    return wordTranslations[trimmed];
  }

  // Check if it's a pure number
  if (/^\d+$/.test(trimmed)) {
    return toUrduNumbers(trimmed);
  }

  // Sub-string replacements for notes / details / labels
  let result = trimmed;

  // Replace numbers with Urdu numbers first if they are part of route descriptions
  result = result.replace(/\d+/g, (m) => toUrduNumbers(m));

  // Translate common sub-phrases
  const phraseReplacements: Record<string, string> = {
    'Immediately after Namaz e Fajr': 'نمازِ فجر کے فوراً بعد',
    'immediately after Namaz e Fajr': 'نمازِ فجر کے فوراً بعد',
    'Tabarruk after majlis': 'مجلس کے بعد تبرک',
    'Tabarruk after Majlis': 'مجلس کے بعد تبرک',
    'Tabarruk after Majlis (Ladies & Gents)': 'مجلس کے بعد تبرک (مردانہ و زنانہ)',
    'Tabarruk after majlis (Ladies & Gents)': 'مجلس کے بعد تبرک (مردانہ و زنانہ)',
    'Tabarruk after Majlis (Ladies)': 'مجلس کے بعد تبرک (زنانہ)',
    'Tabarruk after majlis (Ladies)': 'مجلس کے بعد تبرک (زنانہ)',
    'After Namaz e Zohrain': 'نمازِ ظہرین کے بعد',
    'after Namaz e Zohrain': 'نمازِ ظہرین کے بعد',
    'Majlis & Tabarruk': 'مجلس اور تبرک',
    'Before Majlis': 'مجلس سے پہلے',
    'Before majlis': 'مجلس سے پہلے',
    'Ladies & Gents': 'مردانہ و زنانہ',
    'Ladies': 'زنانہ'
  };

  for (const [key, value] of Object.entries(phraseReplacements)) {
    const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    result = result.replace(regex, value);
  }

  // Also split by commas/semicolons/spaces and try to translate segments
  if (result === trimmed) {
    if (trimmed.includes(';')) {
      const parts = trimmed.split(';').map(p => translate(p.trim(), locale));
      return parts.join('؛ ');
    }

    const words = trimmed.split(/\s+/);
    if (words.length > 1) {
      const translatedWords = words.map(w => {
        // Clean word from punctuation for translation, but preserve it
        let clean = w.replace(/[(),]/g, '');
        let translated = dataTranslations[w] || dataTranslations[clean] || wordTranslations[w] || wordTranslations[clean] || w;
        // Re-apply punctuation
        if (translated !== w) {
          if (w.startsWith('(')) translated = '(' + translated;
          if (w.endsWith(')')) translated = translated + ')';
          if (w.endsWith(',')) translated = translated + '،';
        }
        return translated;
      });
      return toUrduNumbers(translatedWords.join(' '));
    }
  }

  return result;
};

// Translate day tags
export const translateDayTag = (tag: string | undefined, locale: Locale): string => {
  if (!tag) return '';
  if (locale === 'en') return tag;
  const trimmed = tag.trim();
  if (wordTranslations[trimmed]) {
    return wordTranslations[trimmed];
  }
  if (trimmed === 'Sar-e-Moharram') return 'سرِ محرم';
  if (trimmed === 'Shab-e-Ashoor') return 'شبِ عاشور';
  if (trimmed === 'Ashura') return 'عاشورہ';
  if (trimmed.includes('Ashura')) return 'عاشورہ';
  return tag;
};

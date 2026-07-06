import { Category, Business, Review, PaymentRecord, Product, Order } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-clothing', name: { en: 'Clothing', ar: 'الملابس' }, group: 'Shops', iconName: 'Shirt' },
  { id: 'cat-grocery', name: { en: 'Grocery', ar: 'البقالة' }, group: 'Shops', iconName: 'ShoppingBag' },
  { id: 'cat-education', name: { en: 'Education', ar: 'التعليم' }, group: 'Shops', iconName: 'BookOpen' },
  { id: 'cat-electronics', name: { en: 'Electronics', ar: 'الإلكترونيات' }, group: 'Shops', iconName: 'Tv' },
  { id: 'cat-jewelry', name: { en: 'Jewelry', ar: 'المجوهرات' }, group: 'Shops', iconName: 'Gem' },
  { id: 'cat-books', name: { en: 'Books', ar: 'الكتب' }, group: 'Shops', iconName: 'Book' },
  { id: 'cat-plumbing', name: { en: 'Plumbing', ar: 'السباكة' }, group: 'Services', iconName: 'Wrench' },
  { id: 'cat-electrical', name: { en: 'Electrical', ar: 'الكهرباء' }, group: 'Services', iconName: 'Zap' },
  { id: 'cat-carpentry', name: { en: 'Carpentry', ar: 'النجارة' }, group: 'Services', iconName: 'Hammer' },
  { id: 'cat-cleaning', name: { en: 'Cleaning', ar: 'خدمات التنظيف' }, group: 'Services', iconName: 'Sparkles' },
  { id: 'cat-maintenance', name: { en: 'Maintenance', ar: 'الصيانة العامة' }, group: 'Services', iconName: 'Settings' },
  { id: 'cat-doctor', name: { en: 'Doctors', ar: 'الأطباء' }, group: 'Professionals', iconName: 'UserCheck' },
  { id: 'cat-lawyer', name: { en: 'Lawyers', ar: 'المحاماة' }, group: 'Professionals', iconName: 'Scale' },
  { id: 'cat-engineer', name: { en: 'Engineers', ar: 'الهندسة' }, group: 'Professionals', iconName: 'HardHat' },
  { id: 'cat-accountant', name: { en: 'Accountants', ar: 'المحاسبة' }, group: 'Professionals', iconName: 'Calculator' },
  { id: 'cat-realestate', name: { en: 'Real Estate', ar: 'العقارات' }, group: 'Professionals', iconName: 'Building' },
  { id: 'cat-restaurant', name: { en: 'Restaurants', ar: 'المطاعم' }, group: 'Food', iconName: 'Utensils' },
  { id: 'cat-bakery', name: { en: 'Bakery', ar: 'المخبز' }, group: 'Food', iconName: 'Croissant' },
  { id: 'cat-catering', name: { en: 'Catering', ar: 'التجهيزات الغذائية' }, group: 'Food', iconName: 'Soup' }
];

export const INITIAL_BUSINESSES: Business[] = [
  {
    id: 'biz-alkawthar',
    ownerId: 'business-businessshiadirectorycom',
    name: 'Al-Kawthar Grocery',
    logoUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=200&h=200',
    coverUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=1200&h=400',
    description: {
      en: 'Premium organic grocery store providing fresh halal products, fruits, vegetables, and high-quality Middle Eastern spices and staples to the community.',
      ar: 'متجر بقالة متميز يوفر المنتجات الحلال الطازجة، الفواكه، الخضروات، والتوابل الشرق أوسطية عالية الجودة للمجتمع.'
    },
    categoryId: 'cat-grocery',
    subcategory: { en: 'Grocery Store', ar: 'متجر بقالة' },
    address: 'Karada St, Near Al-Attar Mosque',
    city: 'New York',
    area: 'Karada',
    isVerified: true,
    status: 'active',
    phone: '+1 770 123 4567',
    whatsapp: '+17701234567',
    website: 'https://alkawtharmarket.com',
    workingHours: { en: '8:00 AM - 11:00 PM', ar: '8:00 صباحاً - 11:00 مساءً' },
    membershipExpiryDate: '2026-10-15',
    gallery: [
      'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600&h=400',
      'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=600&h=400'
    ],
    rating: 4.8,
    reviewsCount: 15
  },
  {
    id: 'biz-noor',
    ownerId: 'service_provider-serviceshiadirectorycom',
    name: 'Noor Electricians',
    logoUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=200&h=200',
    coverUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=1200&h=400',
    description: {
      en: 'Certified local electrical installation, power cabling, backup generator setups, and emergency repair services for houses and shops.',
      ar: 'تركيبات كهربائية معتمدة، تمديد الكابلات، تركيب المولدات الاحتياطية، وخدمات الإصلاح الطارئة للمنازل والمحلات.'
    },
    categoryId: 'cat-electrical',
    subcategory: { en: 'Electrician', ar: 'كهربائي متميز' },
    address: 'Palestine St, Intersection 4',
    city: 'New York',
    area: 'Palestine Street',
    isVerified: true,
    status: 'active',
    phone: '+1 780 987 6543',
    whatsapp: '+17809876543',
    website: '',
    workingHours: { en: '9:00 AM - 9:00 PM (24/7 Available for emergency)', ar: '9:00 صباحاً - 9:00 مساءً (متوفر 24/7 للطوارئ)' },
    membershipExpiryDate: '2026-10-15',
    gallery: [
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=600&h=400'
    ],
    rating: 4.9,
    reviewsCount: 8
  },
  {
    id: 'biz-fatima',
    ownerId: 'owner-fatima',
    name: 'Fatima Modest Wear',
    logoUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=200&h=200',
    coverUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200&h=400',
    description: {
      en: 'Premium bespoke and ready-to-wear modest clothing, elegant abayas, premium hijabs, and traditional attire carefully sourced and crafted.',
      ar: 'ملابس محتشمة راقية جاهزة وتحت الطلب، عبايات أنيقة، حجابات مميزة، وملابس تقليدية مصممة بعناية.'
    },
    categoryId: 'cat-clothing',
    subcategory: { en: 'Clothing Shop', ar: 'متجر ملابس' },
    address: 'Mansour District, Al-Amirat Road',
    city: 'New York',
    area: 'Mansour',
    isVerified: true,
    status: 'active',
    phone: '+1 771 222 3344',
    whatsapp: '+17712223344',
    website: 'https://fatimamodestwear.iq',
    workingHours: { en: '10:00 AM - 10:00 PM', ar: '10:00 صباحاً - 10:00 مساءً' },
    membershipExpiryDate: '2026-11-01',
    gallery: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=600&h=400'
    ],
    rating: 4.7,
    reviewsCount: 22
  },
  {
    id: 'biz-hussaini',
    ownerId: 'owner-hussaini',
    name: 'Hussaini Kitchen',
    logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=200&h=200',
    coverUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=1200&h=400',
    description: {
      en: 'Authentic traditional Iraqi grills, Quzi, Biryani, and sacred feast catering options prepared with high sanitary standards near the Holy Shrine.',
      ar: 'مشويات عراقية تقليدية أصيلة، قوزي، برياني، وتجهيز الولائم والمجالس الحسينية بمستوى نظافة واهتمام عالٍ قرب الروضة الحيدرية المطهرة.'
    },
    categoryId: 'cat-restaurant',
    subcategory: { en: 'Restaurant', ar: 'مطعم ومطابخ' },
    address: 'Al-Rasool St, Near Imam Ali Shrine',
    city: 'Los Angeles',
    area: 'Ancient City',
    isVerified: true,
    status: 'active',
    phone: '+1 781 444 5566',
    whatsapp: '+17814445566',
    website: '',
    workingHours: { en: '11:00 AM - 12:00 AM', ar: '11:00 صباحاً - 12:00 منتصف الليل' },
    membershipExpiryDate: '2026-07-15',
    gallery: [
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=600&h=400',
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=600&h=400'
    ],
    rating: 4.9,
    reviewsCount: 46
  },
  {
    id: 'biz-drahmed',
    ownerId: 'owner-drahmed',
    name: 'Dr. Ahmed Family Clinic',
    logoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200&h=200',
    coverUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1200&h=400',
    description: {
      en: 'Experienced pediatrician and family consultant offering medical diagnoses, diagnostic checkups, wellness guidance, and general care counseling.',
      ar: 'عيادة استشارية متخصصة للأطفال وصحة الأسرة تقدم التشخيص، الفحوصات الطبية، إرشادات الرعاية الصحية والوقائية لكل أفراد المجتمع.'
    },
    categoryId: 'cat-doctor',
    subcategory: { en: 'Doctor', ar: 'طبيب استشاري' },
    address: 'Al-Harithiya, Doctors Complex',
    city: 'New York',
    area: 'Al-Harithiya',
    isVerified: true,
    status: 'active',
    phone: '+1 790 333 4455',
    whatsapp: '+17903334455',
    website: '',
    workingHours: { en: '3:00 PM - 9:00 PM', ar: '3:00 مساءً - 9:00 مساءً' },
    membershipExpiryDate: '2026-09-05',
    gallery: [
      'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600&h=400'
    ],
    rating: 4.6,
    reviewsCount: 19
  },
  {
    id: 'biz-baitalkitab',
    ownerId: 'owner-baitalkitab',
    name: 'Bait Al-Kitab Bookstore',
    logoUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=200&h=200',
    coverUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=1200&h=400',
    description: {
      en: 'Vast collection of academic journals, Islamic jurisprudence, historical references, and community publications available for order and local delivery.',
      ar: 'مجموعة واسعة من الكتب الأكاديمية والكتب الإسلامية والتحقيقات التاريخية والمنشورات المجتمعية متاحة للشراء وللتوصيل المحلي.'
    },
    categoryId: 'cat-books',
    subcategory: { en: 'Bookstore', ar: 'مكتبة ودار نشر' },
    address: 'Sidrat Street, Near Imam Hussain Shrine',
    city: 'Chicago',
    area: 'Near Holy Area',
    isVerified: true,
    status: 'active',
    phone: '+1 782 555 6677',
    whatsapp: '+17825556677',
    website: 'https://baitalkitab.iq',
    workingHours: { en: '9:00 AM - 10:00 PM', ar: '9:00 صباحاً - 10:00 مساءً' },
    membershipExpiryDate: '2026-06-30',
    gallery: [
      'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=600&h=400'
    ],
    rating: 4.9,
    reviewsCount: 31
  },
  // ── New businesses (BRD coverage expansion) ─────────────────
  {
    id: 'biz-basra-clean',
    ownerId: 'owner-basraclean',
    name: 'Al-Zahra Cleaning Services',
    logoUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=200&h=200',
    coverUrl: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&q=80&w=1200&h=400',
    description: {
      en: 'Professional residential and commercial deep-cleaning services, sofa steam-cleaning, carpet washing, and post-construction sanitization in Basra.',
      ar: 'خدمات تنظيف منزلية وتجارية احترافية، تنظيف الأرائك بالبخار، غسيل السجاد، والتعقيم ما بعد البناء في البصرة.'
    },
    categoryId: 'cat-cleaning',
    subcategory: { en: 'Cleaning Service', ar: 'خدمات تنظيف' },
    address: 'Al-Ashar District, Corniche Road',
    city: 'Houston',
    area: 'Al-Ashar',
    isVerified: true,
    status: 'active',
    phone: '+1 776 111 2233',
    whatsapp: '+17761112233',
    website: '',
    workingHours: { en: '8:00 AM - 6:00 PM', ar: '8:00 صباحاً - 6:00 مساءً' },
    membershipExpiryDate: '2026-09-30',
    gallery: [
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=600&h=400',
      'https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&q=80&w=600&h=400'
    ],
    rating: 4.7,
    reviewsCount: 12
  },
  {
    id: 'biz-erbil-restaurant',
    ownerId: 'owner-erbilrest',
    name: 'Kurdistan Grills & Meze',
    logoUrl: 'https://images.unsplash.com/photo-1530554764233-e79e16c91d08?auto=format&fit=crop&q=80&w=200&h=200',
    coverUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1200&h=400',
    description: {
      en: 'Authentic Kurdish and Iraqi grills, mezze platters, and family dining with Shia-halal standards. Popular for community gatherings in Erbil.',
      ar: 'مشاوي كردية وعراقية أصيلة، ومازات طازجة، وتجمعات عائلية بمستوى حلال شيعي. خيار مميز لتجمعات مجتمعنا في أربيل.'
    },
    categoryId: 'cat-restaurant',
    subcategory: { en: 'Restaurant', ar: 'مطعم عائلي' },
    address: 'Sami Abdul Rahman Park, Erbil City',
    city: 'Dearborn',
    area: 'City Centre',
    isVerified: true,
    status: 'active',
    phone: '+1 313 888 9900',
    whatsapp: '+13138889900',
    website: '',
    workingHours: { en: '12:00 PM - 11:00 PM', ar: '12:00 ظهراً - 11:00 مساءً' },
    membershipExpiryDate: '2026-10-01',
    gallery: [
      'https://images.unsplash.com/photo-1530554764233-e79e16c91d08?auto=format&fit=crop&q=80&w=600&h=400',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=600&h=400'
    ],
    rating: 4.8,
    reviewsCount: 27
  },
  {
    id: 'biz-karbala-dr',
    ownerId: 'owner-karbaladdr',
    name: 'Dr. Zainab Al-Hussaini Clinic',
    logoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200&h=200',
    coverUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1200&h=400',
    description: {
      en: 'Specialist women\'s health clinic offering gynecology consultations, prenatal checkups, and general women\'s wellness services in Karbala.',
      ar: 'عيادة متخصصة بصحة المرأة تقدم استشارات أمراض النساء والتوليد، الفحوصات الدورية للحمل، والرعاية الصحية الشاملة للمرأة في كربلاء المقدسة.'
    },
    categoryId: 'cat-doctor',
    subcategory: { en: 'Women\'s Health Specialist', ar: 'أخصائية نساء وتوليد' },
    address: 'Al-Hussain Medical Complex, Karbala',
    city: 'Chicago',
    area: 'Al-Hussain District',
    isVerified: true,
    status: 'active',
    phone: '+1 783 444 7788',
    whatsapp: '+17834447788',
    website: '',
    workingHours: { en: '9:00 AM - 2:00 PM | 5:00 PM - 8:00 PM', ar: '9:00 صباحاً - 2:00 ظهراً | 5:00 مساءً - 8:00 مساءً' },
    membershipExpiryDate: '2026-11-15',
    gallery: [
      'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600&h=400'
    ],
    rating: 4.9,
    reviewsCount: 34
  },
  {
    id: 'biz-baghdad-acc',
    ownerId: 'owner-baghdadacc',
    name: 'Al-Ameen Accounting Office',
    logoUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=200&h=200',
    coverUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200&h=400',
    description: {
      en: 'Certified chartered accountancy, tax advisory, financial auditing, business registration, and payroll management for small businesses and professionals.',
      ar: 'محاسبة قانونية معتمدة، استشارات ضريبية، تدقيق مالي، تسجيل الشركات، وإدارة الرواتب للمشاريع الصغيرة والمهنيين.'
    },
    categoryId: 'cat-accountant',
    subcategory: { en: 'Accountant', ar: 'محاسب قانوني معتمد' },
    address: 'Arasat Al-Hindiya, Business Tower 3',
    city: 'New York',
    area: 'Arasat',
    isVerified: true,
    status: 'active',
    phone: '+1 770 555 8899',
    whatsapp: '+17705558899',
    website: 'https://alameenaccounting.iq',
    workingHours: { en: '9:00 AM - 5:00 PM (Sat-Thu)', ar: '9:00 صباحاً - 5:00 مساءً (السبت-الخميس)' },
    membershipExpiryDate: '2026-10-20',
    gallery: [
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=600&h=400'
    ],
    rating: 4.7,
    reviewsCount: 9
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    businessId: 'biz-alkawthar',
    userName: 'Kamil Hasan',
    rating: 5,
    comment: 'Alhamdulillah, super fresh organic fruits and wonderful Halal meat. Very respectful staff.',
    date: '2026-06-10'
  },
  {
    id: 'rev-2',
    businessId: 'biz-alkawthar',
    userName: 'Zainab Jafar',
    rating: 4.6,
    comment: 'Great service. They have rare spices that are difficult to find somewhere else.',
    date: '2026-06-12'
  },
  {
    id: 'rev-3',
    businessId: 'biz-noor',
    userName: 'Ahmad Mahdi',
    rating: 5,
    comment: 'Fast response and very clean cabling work. Safe wiring! Jazakumullah Khayr.',
    date: '2026-06-08'
  },
  {
    id: 'rev-4',
    businessId: 'biz-hussaini',
    userName: 'Murtadha Al-Karbalai',
    rating: 5,
    comment: 'The absolute best Quzi in Najaf! Extremely delicious flavor and generous portions.',
    date: '2026-06-15'
  },
  {
    id: 'rev-5',
    businessId: 'biz-basra-clean',
    userName: 'Fatima Al-Basri',
    rating: 4.8,
    comment: 'Excellent deep cleaning service! Very professional team, left the house spotless.',
    date: '2026-06-20'
  },
  {
    id: 'rev-6',
    businessId: 'biz-karbala-dr',
    userName: 'Umm Hassan',
    rating: 5,
    comment: 'Dr. Zainab is very professional and compassionate. Highly recommend for all sisters.',
    date: '2026-06-18'
  }
];

export const INITIAL_PAYMENTS: PaymentRecord[] = [
  {
    id: 'pay-1',
    businessId: 'biz-alkawthar',
    amount: 50,
    date: '2026-06-15',
    status: 'success',
    refNo: 'TXN-7348912'
  },
  {
    id: 'pay-2',
    businessId: 'biz-noor',
    amount: 50,
    date: '2026-06-11',
    status: 'success',
    refNo: 'TXN-8291047'
  },
  {
    id: 'pay-3',
    businessId: 'biz-fatima',
    amount: 50,
    date: '2026-06-01',
    status: 'success',
    refNo: 'TXN-1029486'
  },
  {
    id: 'pay-4',
    businessId: 'biz-hussaini',
    amount: 50,
    date: '2026-06-15',
    status: 'success',
    refNo: 'TXN-6571932'
  },
  {
    id: 'pay-5',
    businessId: 'biz-basra-clean',
    amount: 50,
    date: '2026-06-18',
    status: 'success',
    refNo: 'TXN-9012345'
  },
  {
    id: 'pay-6',
    businessId: 'biz-erbil-restaurant',
    amount: 50,
    date: '2026-06-20',
    status: 'success',
    refNo: 'TXN-3456789'
  },
  {
    id: 'pay-7',
    businessId: 'biz-karbala-dr',
    amount: 50,
    date: '2026-06-22',
    status: 'success',
    refNo: 'TXN-5678901'
  },
  {
    id: 'pay-8',
    businessId: 'biz-baghdad-acc',
    amount: 50,
    date: '2026-06-25',
    status: 'success',
    refNo: 'TXN-7890123'
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    businessId: 'biz-alkawthar',
    name: { en: 'Organic Honey', ar: 'عسل عضوي' },
    description: { en: 'Pure natural honey from local farms.', ar: 'عسل طبيعي نقي من المزارع المحلية.' },
    price: 25.0,
    imageUrl: 'https://images.unsplash.com/photo-1587049352847-4d4b1ed7fa33?auto=format&fit=crop&q=80&w=400&h=400',
    inStock: true
  },
  {
    id: 'prod-2',
    businessId: 'biz-alkawthar',
    name: { en: 'Premium Dates', ar: 'تمور فاخرة' },
    description: { en: 'High-quality Ajwa dates.', ar: 'تمور عجوة عالية الجودة.' },
    price: 15.0,
    imageUrl: 'https://images.unsplash.com/photo-1593504049359-74330189a345?auto=format&fit=crop&q=80&w=400&h=400',
    inStock: true
  },
  // --- Start of mock business products ---
  {
    id: "p1",
    businessId: 'business-businessshiadirectorycom',
    name: { en: "Premium Linen Kurta", ar: "Premium Linen Kurta" },
    description: { en: "A premium linen kurta.", ar: "A premium linen kurta." },
    price: 45,
    inStock: true,
    imageUrl: "https://via.placeholder.com/150"
  },
  {
    id: "p2",
    businessId: 'business-businessshiadirectorycom',
    name: { en: "Casual Cotton Shirt", ar: "Casual Cotton Shirt" },
    description: { en: "A casual cotton shirt.", ar: "A casual cotton shirt." },
    price: 35,
    inStock: true,
    imageUrl: "https://via.placeholder.com/150"
  },
  {
    id: "p3",
    businessId: 'business-businessshiadirectorycom',
    name: { en: "Embroidered Traditional Wear", ar: "Embroidered Traditional Wear" },
    description: { en: "Embroidered traditional wear.", ar: "Embroidered traditional wear." },
    price: 75,
    inStock: false,
    imageUrl: "https://via.placeholder.com/150"
  }
  // --- End of mock business products ---
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1',
    businessId: 'biz-alkawthar',
    customerName: 'Ali Reza',
    customerPhone: '+1 555 0192',
    items: [{ productId: 'prod-1', quantity: 2, priceAtPurchase: 25.0 }],
    totalAmount: 50.0,
    status: 'pending',
    date: '2026-07-02'
  },
  {
    id: 'ord-2',
    businessId: 'biz-alkawthar',
    customerName: 'Fatima Hassan',
    customerPhone: '+1 555 8374',
    items: [{ productId: 'prod-2', quantity: 1, priceAtPurchase: 15.0 }],
    totalAmount: 15.0,
    status: 'processing',
    date: '2026-07-03'
  },
  {
    id: 'ord-3',
    businessId: 'biz-alkawthar',
    customerName: 'Muhammad Abbas',
    customerPhone: '+1 555 2291',
    items: [{ productId: 'prod-1', quantity: 1, priceAtPurchase: 25.0 }, { productId: 'prod-2', quantity: 3, priceAtPurchase: 15.0 }],
    totalAmount: 70.0,
    status: 'delivered',
    date: '2026-06-25'
  }
];

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  UserProfile, Business, BusinessStatus, Category, Review,
  PaymentRecord, AppNotification, UserRole, Product, Order, Job, JobCategory,
} from '../types';
import {
  INITIAL_CATEGORIES, INITIAL_BUSINESSES, INITIAL_REVIEWS,
  INITIAL_PAYMENTS, INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_JOBS, INITIAL_HIRING_ACTIVE,
} from '../data/mockData';

// ── API helpers ────────────────────────────────────────────────────────────

/** Map a Supabase profiles_directory row → Business shape the UI expects */
const mapDirectoryProfile = (p: Record<string, unknown>): Business => ({
  id:                   String(p.id ?? ''),
  // Use email as ownerId so it matches currentUser.email across auth systems
  ownerId:              String(p.email ?? ''),
  name:                 String(p.businessName ?? ''),
  logoUrl:              String(p.imageUrl ?? ''),
  coverUrl:             String(p.coverUrl ?? ''),
  description:          { en: String(p.description ?? ''), ar: '' },
  categoryId:           String(p.category ?? '').toLowerCase().replace(/ /g, '-'),
  subcategory:          { en: String(p.category ?? ''), ar: '' },
  address:              String(p.address ?? ''),
  city:                 (String(p.city || 'New York')) as Business['city'],
  area:                 String(p.area ?? ''),
  isVerified:           Boolean(p.isVerified),
  status:               (p.subscriptionStatus === 'suspended' ? 'suspended' : 'active') as BusinessStatus,
  phone:                String(p.phone ?? ''),
  whatsapp:             String(p.whatsapp ?? ''),
  website:              String(p.website ?? ''),
  workingHours:         { en: String(p.workingHours ?? ''), ar: '' },
  membershipExpiryDate: String(p.membershipExpiry ?? ''),
  gallery:              [],
  rating:               Number(p.rating ?? 0),
  reviewsCount:         Number(p.reviewsCount ?? 0),
});

/** Map a Supabase jobs_board row → Job shape the UI expects */
const mapApiJob = (j: Record<string, unknown>): Job => ({
  id:               String(j.id ?? ''),
  businessId:       String(j.businessId ?? ''),
  businessName:     String(j.businessName ?? ''),
  businessLogoUrl:  String(j.businessLogoUrl ?? ''),
  title:            String(j.title ?? ''),
  category:         String(j.category ?? 'Others') as JobCategory,
  requirements:     String(j.requirements ?? ''),
  salaryMin:        Number(j.salaryMin ?? 0),
  salaryMax:        Number(j.salaryMax ?? 0),
  hiringEmail:      String(j.hiringEmail ?? ''),
  postedDate:       String(j.postedDate ?? ''),
  isActive:         Boolean(j.isActive ?? true),
});

// Role name normaliser: backend may send 'business_owner'; frontend uses 'business'
const normaliseRole = (r: string): UserRole => {
  if (r === 'business_owner') return 'business';
  if (['business', 'service_provider', 'customer', 'admin'].includes(r)) return r as UserRole;
  return 'customer';
};

// ── Context type ───────────────────────────────────────────────────────────

interface DirectoryContextType {
  // Auth
  currentUser:    UserProfile | null;
  apiToken:       string | null;
  signIn:         (email: string, phone: string, role: UserRole, name?: string) => void;
  apiLogin:       (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut:        () => void;

  // i18n / theme
  language:       'en' | 'ar' | 'fa';
  setLanguage:    (lang: 'en' | 'ar' | 'fa') => void;
  theme:          'light' | 'dark' | 'system';
  setTheme:       (t: 'light' | 'dark' | 'system') => void;

  // Directory data
  categories:     Category[];
  addCategory:    (category: Category) => void;
  removeCategory: (id: string) => void;

  businesses:     Business[];
  addBusiness:    (business: Business) => void;
  updateBusiness: (updated: Business) => void;
  removeBusiness: (id: string) => void;
  refreshDirectory: () => Promise<void>;

  reviews:        Review[];
  addReview:      (review: Review) => void;

  favorites:      string[];
  toggleFavorite: (businessId: string) => void;

  payments:       PaymentRecord[];
  addPayment:     (payment: PaymentRecord) => void;

  products:       Product[];
  addProduct:     (product: Product) => void;

  orders:         Order[];
  updateOrderStatus: (id: string, status: Order['status']) => void;

  notifications:        AppNotification[];
  addNotification:      (title: string, message: string, receiverRole: UserRole | 'all') => void;
  markNotificationsAsRead: () => void;
  clearNotifications:   () => void;

  jobs:           Job[];
  addJob:         (jobData: Omit<Job, 'id' | 'postedDate'>) => void;
  updateJob:      (job: Job) => void;
  deleteJob:      (id: string) => void;

  hiringActive:   Record<string, boolean>;
  setHiringActive:(businessId: string, active: boolean) => void;
}

// ── Context & Provider ─────────────────────────────────────────────────────

const DirectoryContext = createContext<DirectoryContextType | undefined>(undefined);

export const DirectoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  // ── Persisted preferences ────────────────────────────────────────────────
  const [language, setLanguageState] = useState<'en' | 'ar' | 'fa'>(() =>
    (localStorage.getItem('shia_dir_lang') as 'en' | 'ar' | 'fa') || 'en'
  );
  const [theme, setThemeState] = useState<'light' | 'dark' | 'system'>(() =>
    (localStorage.getItem('shia_dir_theme') as 'light' | 'dark' | 'system') || 'system'
  );

  // ── Auth ─────────────────────────────────────────────────────────────────
  const [apiToken, setApiToken] = useState<string | null>(() =>
    localStorage.getItem('shia_dir_token')
  );
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('shia_dir_user');
      if (saved) return JSON.parse(saved);
    } catch { localStorage.removeItem('shia_dir_user'); }
    return null;
  });

  // ── Directory data (starts with mock; overwritten by API on mount) ────────
  const [categories, setCategories] = useState<Category[]>(() => {
    try { const s = localStorage.getItem('shia_dir_categories'); if (s) return JSON.parse(s); } catch { /**/ }
    return INITIAL_CATEGORIES;
  });

  const [businesses, setBusinesses] = useState<Business[]>(() => {
    try { const s = localStorage.getItem('shia_dir_businesses'); if (s) return JSON.parse(s); } catch { /**/ }
    return INITIAL_BUSINESSES;
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    try { const s = localStorage.getItem('shia_dir_reviews'); if (s) return JSON.parse(s); } catch { /**/ }
    return INITIAL_REVIEWS;
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    try { const s = localStorage.getItem('shia_dir_favorites'); if (s) return JSON.parse(s); } catch { /**/ }
    return [];
  });

  const [payments, setPayments] = useState<PaymentRecord[]>(() => {
    try { const s = localStorage.getItem('shia_dir_payments'); if (s) return JSON.parse(s); } catch { /**/ }
    return INITIAL_PAYMENTS;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    try { const s = localStorage.getItem('shia_dir_products'); if (s) return JSON.parse(s); } catch { /**/ }
    return INITIAL_PRODUCTS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try { const s = localStorage.getItem('shia_dir_orders'); if (s) return JSON.parse(s); } catch { /**/ }
    return INITIAL_ORDERS;
  });

  const [jobs, setJobs] = useState<Job[]>(() => {
    try { const s = localStorage.getItem('shia_dir_jobs'); if (s) return JSON.parse(s); } catch { /**/ }
    return INITIAL_JOBS;
  });

  const [hiringActive, setHiringActiveState] = useState<Record<string, boolean>>(() => {
    try { const s = localStorage.getItem('shia_dir_hiring_active'); if (s) return JSON.parse(s); } catch { /**/ }
    return INITIAL_HIRING_ACTIVE;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try { const s = localStorage.getItem('shia_dir_notifications'); if (s) return JSON.parse(s); } catch { /**/ }
    return [{
      id: 'notif-1',
      title: 'App Launched!',
      message: 'Welcome to the Ahle Bait Network (ABN) Business Directory.',
      date: '2026-06-19',
      isRead: false,
      receiverRole: 'all' as const,
    }];
  });

  // ── localStorage sync ────────────────────────────────────────────────────
  useEffect(() => { localStorage.setItem('shia_dir_user',     currentUser ? JSON.stringify(currentUser) : ''); }, [currentUser]);
  useEffect(() => { localStorage.setItem('shia_dir_lang',     language); }, [language]);
  useEffect(() => { localStorage.setItem('shia_dir_theme',    theme); }, [theme]);
  useEffect(() => { localStorage.setItem('shia_dir_categories', JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem('shia_dir_businesses', JSON.stringify(businesses)); }, [businesses]);
  useEffect(() => { localStorage.setItem('shia_dir_reviews',  JSON.stringify(reviews)); }, [reviews]);
  useEffect(() => { localStorage.setItem('shia_dir_favorites',JSON.stringify(favorites)); }, [favorites]);
  useEffect(() => { localStorage.setItem('shia_dir_payments', JSON.stringify(payments)); }, [payments]);
  useEffect(() => { localStorage.setItem('shia_dir_notifications', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('shia_dir_jobs',     JSON.stringify(jobs)); }, [jobs]);
  useEffect(() => { localStorage.setItem('shia_dir_hiring_active', JSON.stringify(hiringActive)); }, [hiringActive]);

  // ── Theme effect ─────────────────────────────────────────────────────────
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    if (theme === 'system') {
      root.classList.add(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  // ── Live API fetch on mount ───────────────────────────────────────────────
  // Fetches the Supabase-backed directory + jobs board.
  // Gracefully falls back to mock data if the backend is unreachable.
  const refreshDirectory = async (): Promise<void> => {
    try {
      const [dirRes, jobsRes] = await Promise.all([
        fetch('/api/directory'),
        fetch('/api/jobsboard'),
      ]);
      if (dirRes.ok) {
        const dirData: Record<string, unknown>[] = await dirRes.json();
        if (Array.isArray(dirData) && dirData.length > 0) {
          setBusinesses(dirData.map(mapDirectoryProfile));
          // Populate hiringActive from the profile field
          const hiring: Record<string, boolean> = {};
          dirData.forEach((p) => { hiring[String(p.id)] = Boolean(p.hiringActive); });
          setHiringActiveState((prev) => ({ ...prev, ...hiring }));
        }
      }
      if (jobsRes.ok) {
        const jobsData: Record<string, unknown>[] = await jobsRes.json();
        if (Array.isArray(jobsData) && jobsData.length > 0) {
          setJobs(jobsData.map(mapApiJob));
        }
      }
    } catch {
      console.warn('[ABN Directory] Backend not reachable — using cached/mock data.');
    }
  };

  const fetchDoneRef = useRef(false);
  useEffect(() => {
    if (fetchDoneRef.current) return;
    fetchDoneRef.current = true;
    refreshDirectory();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Subscription expiry check ─────────────────────────────────────────────
  const expiryCheckDone = useRef(false);
  useEffect(() => {
    if (expiryCheckDone.current) return;
    expiryCheckDone.current = true;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sevenDaysAhead = new Date(today);
    sevenDaysAhead.setDate(today.getDate() + 7);

    setBusinesses((prev) => prev.map((biz) => {
      if (!biz.membershipExpiryDate) return biz;
      const expiry = new Date(biz.membershipExpiryDate);
      expiry.setHours(0, 0, 0, 0);

      if (expiry < today && biz.status === 'active') {
        setNotifications((pn) => [{
          id: `notif-exp-${biz.id}-${Date.now()}`,
          title: 'Subscription Expired',
          message: `${biz.name} membership has expired and has been suspended.`,
          date: today.toISOString().split('T')[0],
          isRead: false,
          receiverRole: 'business' as const,
        }, ...pn]);
        return { ...biz, status: 'suspended' as const };
      }
      if (expiry >= today && expiry <= sevenDaysAhead && biz.status === 'active') {
        setNotifications((pn) => {
          if (pn.some((n) => n.title === 'Subscription Expiring Soon' && n.message.includes(biz.name))) return pn;
          return [{
            id: `notif-warn-${biz.id}-${Date.now()}`,
            title: 'Subscription Expiring Soon',
            message: `${biz.name} expires on ${biz.membershipExpiryDate}. Please renew.`,
            date: today.toISOString().split('T')[0],
            isRead: false,
            receiverRole: 'business' as const,
          }, ...pn];
        });
      }
      return biz;
    }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auth functions ────────────────────────────────────────────────────────

  /** Real API login — calls Express backend → JWT → sets currentUser */
  const apiLogin = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Login failed.' };

      const token: string = data.token;
      const user = data.user as { id: string; email: string; phone: string; name: string; role: string; preferredLanguage?: string };

      localStorage.setItem('shia_dir_token', token);
      setApiToken(token);

      const profile: UserProfile = {
        id:                user.id,
        email:             user.email,
        phone:             user.phone || '',
        name:              user.name,
        role:              normaliseRole(user.role),
        preferredLanguage: (user.preferredLanguage as 'en' | 'ar') || 'en',
      };
      setCurrentUser(profile);
      addNotification('Login Successful', `Assalamu Alaykum, ${user.name}. Welcome back!`, normaliseRole(user.role));

      // After login, re-fetch the live directory so business matches the logged-in user
      refreshDirectory();
      return { success: true };
    } catch {
      return { success: false, error: 'Cannot reach server. Make sure the backend is running.' };
    }
  };

  /** Legacy / offline sign-in (no password — used as fallback when backend is down) */
  const signIn = (email: string, phone: string, role: UserRole, name?: string) => {
    const fallbackName = name || email.split('@')[0] || 'User';
    const stableId = `${role}-${email.replace(/[^a-z0-9]/gi, '').toLowerCase()}`;
    const newUser: UserProfile = { id: stableId, email, phone, name: fallbackName, role, preferredLanguage: language as 'en' | 'ar' };
    setCurrentUser(newUser);
    addNotification('Login Successful', `Assalamu Alaykum, ${fallbackName}. Welcome back!`, role);
  };

  const signOut = () => {
    setCurrentUser(null);
    setApiToken(null);
    localStorage.removeItem('shia_dir_token');
  };

  // ── Category helpers ──────────────────────────────────────────────────────
  const setLanguage  = (lang: 'en' | 'ar' | 'fa') => setLanguageState(lang);
  const setTheme     = (t: 'light' | 'dark' | 'system') => setThemeState(t);
  const addCategory  = (cat: Category) => setCategories((p) => [...p, cat]);
  const removeCategory = (id: string) => setCategories((p) => p.filter((c) => c.id !== id));

  // ── Business helpers ──────────────────────────────────────────────────────
  const addBusiness = (biz: Business) => {
    setBusinesses((p) => [...p, biz]);
    addNotification('New Business Listed', `${biz.name} has registered under ${biz.subcategory.en}.`, 'admin');
  };
  const updateBusiness = (updated: Business) =>
    setBusinesses((p) => p.map((b) => (b.id === updated.id ? updated : b)));
  const removeBusiness = (id: string) =>
    setBusinesses((p) => p.filter((b) => b.id !== id));

  // ── Review helpers ────────────────────────────────────────────────────────
  const addReview = (review: Review) => {
    setReviews((prevR) => {
      const updated = [review, ...prevR];
      setBusinesses((prevB) => prevB.map((biz) => {
        if (biz.id !== review.businessId) return biz;
        const bizRevs = updated.filter((r) => r.businessId === review.businessId);
        const avg = parseFloat((bizRevs.reduce((s, r) => s + r.rating, 0) / bizRevs.length).toFixed(1));
        return { ...biz, rating: avg, reviewsCount: bizRevs.length };
      }));
      return updated;
    });
  };

  // ── Favorites ─────────────────────────────────────────────────────────────
  const toggleFavorite = (businessId: string) =>
    setFavorites((p) => p.includes(businessId) ? p.filter((id) => id !== businessId) : [...p, businessId]);

  // ── Payments ──────────────────────────────────────────────────────────────
  const addPayment = (payment: PaymentRecord) => {
    setPayments((p) => [payment, ...p]);
    setBusinesses((p) => p.map((biz) => {
      if (biz.id !== payment.businessId) return biz;
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 30);
      return { ...biz, status: 'active', membershipExpiryDate: expiry.toISOString().split('T')[0] };
    }));
    const biz = businesses.find((b) => b.id === payment.businessId);
    if (biz) addNotification('Subscription Renewed ✓', `Membership for ${biz.name} renewed successfully.`, 'business');
  };

  // ── Products / Orders ─────────────────────────────────────────────────────
  const addProduct = (product: Product) => setProducts((p) => [product, ...p]);
  const updateOrderStatus = (id: string, status: Order['status']) =>
    setOrders((p) => p.map((o) => (o.id === id ? { ...o, status } : o)));

  // ── Jobs ──────────────────────────────────────────────────────────────────
  const addJob = (jobData: Omit<Job, 'id' | 'postedDate'>) => {
    const newJob: Job = { ...jobData, id: `job-${Date.now()}`, postedDate: new Date().toISOString().split('T')[0] };
    setJobs((p) => [newJob, ...p]);
  };
  const updateJob = (updated: Job) => setJobs((p) => p.map((j) => (j.id === updated.id ? updated : j)));
  const deleteJob = (id: string) => setJobs((p) => p.filter((j) => j.id !== id));

  const setHiringActive = (businessId: string, active: boolean) => {
    setHiringActiveState((p) => ({ ...p, [businessId]: active }));
    setJobs((p) => p.map((j) => (j.businessId === businessId ? { ...j, isActive: active } : j)));
  };

  // ── Notifications ─────────────────────────────────────────────────────────
  const addNotification = (title: string, message: string, receiverRole: UserRole | 'all') => {
    setNotifications((p) => [{
      id: `notif-${Date.now()}`,
      title, message,
      date: new Date().toISOString().split('T')[0],
      isRead: false,
      receiverRole,
    }, ...p]);
  };
  const markNotificationsAsRead = () => setNotifications((p) => p.map((n) => ({ ...n, isRead: true })));
  const clearNotifications = () => setNotifications([]);

  // ── Provider ──────────────────────────────────────────────────────────────
  return (
    <DirectoryContext.Provider value={{
      currentUser, apiToken, signIn, apiLogin, signOut,
      language, setLanguage, theme, setTheme,
      categories, addCategory, removeCategory,
      businesses, addBusiness, updateBusiness, removeBusiness, refreshDirectory,
      reviews, addReview,
      favorites, toggleFavorite,
      payments, addPayment,
      products, addProduct,
      orders, updateOrderStatus,
      notifications, addNotification, markNotificationsAsRead, clearNotifications,
      jobs, addJob, updateJob, deleteJob,
      hiringActive, setHiringActive,
    }}>
      {children}
    </DirectoryContext.Provider>
  );
};

export const useDirectory = () => {
  const ctx = useContext(DirectoryContext);
  if (!ctx) throw new Error('useDirectory must be used within a DirectoryProvider');
  return ctx;
};

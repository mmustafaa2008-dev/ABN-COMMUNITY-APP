import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, Business, Category, Review, PaymentRecord, AppNotification, UserRole, Product, Order } from '../types';
import { INITIAL_CATEGORIES, INITIAL_BUSINESSES, INITIAL_REVIEWS, INITIAL_PAYMENTS, INITIAL_PRODUCTS, INITIAL_ORDERS } from '../data/mockData';

interface DirectoryContextType {
  currentUser: UserProfile | null;
  language: 'en' | 'ar' | 'fa';
  setLanguage: (lang: 'en' | 'ar' | 'fa') => void;
  theme: 'light' | 'dark' | 'system';
  setTheme: (t: 'light' | 'dark' | 'system') => void;
  categories: Category[];
  addCategory: (category: Category) => void;
  removeCategory: (id: string) => void;
  businesses: Business[];
  addBusiness: (business: Business) => void;
  updateBusiness: (updated: Business) => void;
  removeBusiness: (id: string) => void;
  reviews: Review[];
  addReview: (review: Review) => void;
  favorites: string[]; // businessIds
  toggleFavorite: (businessId: string) => void;
  payments: PaymentRecord[];
  addPayment: (payment: PaymentRecord) => void;
  products: Product[];
  addProduct: (product: Product) => void;
  orders: Order[];
  updateOrderStatus: (id: string, status: Order['status']) => void;
  notifications: AppNotification[];
  addNotification: (title: string, message: string, receiverRole: UserRole | 'all') => void;
  markNotificationsAsRead: () => void;
  clearNotifications: () => void;
  signIn: (email: string, phone: string, role: UserRole, name?: string) => void;
  signOut: () => void;
}

const DirectoryContext = createContext<DirectoryContextType | undefined>(undefined);

export const DirectoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('shia_dir_user');
      if (saved) return JSON.parse(saved);
    } catch { localStorage.removeItem('shia_dir_user'); }
    return null;
  });

  const [language, setLanguageState] = useState<'en' | 'ar' | 'fa'>(() => {
    const saved = localStorage.getItem('shia_dir_lang');
    return (saved as 'en' | 'ar' | 'fa') || 'en';
  });

  const [theme, setThemeState] = useState<'light' | 'dark' | 'system'>(() => {
    const saved = localStorage.getItem('shia_dir_theme');
    return (saved as 'light' | 'dark' | 'system') || 'system';
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem('shia_dir_categories');
      if (saved) return JSON.parse(saved);
    } catch { localStorage.removeItem('shia_dir_categories'); }
    return INITIAL_CATEGORIES;
  });

  const [businesses, setBusinesses] = useState<Business[]>(() => {
    try {
      const saved = localStorage.getItem('shia_dir_businesses');
      if (saved) return JSON.parse(saved);
    } catch { localStorage.removeItem('shia_dir_businesses'); }
    return INITIAL_BUSINESSES;
  });

  // ── Subscription expiry auto-check on mount ─────────────────
  // Runs once after first render to suspend expired businesses
  // and fire 7-day advance warning notifications
  const expiryCheckDone = React.useRef(false);
  useEffect(() => {
    if (expiryCheckDone.current) return;
    expiryCheckDone.current = true;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);

    setBusinesses((prev) =>
      prev.map((biz) => {
        const expiry = new Date(biz.membershipExpiryDate);
        expiry.setHours(0, 0, 0, 0);

        if (expiry < today && biz.status === 'active') {
          // Auto-suspend expired businesses
          setNotifications((prevN) => [
            {
              id: `notif-exp-${biz.id}-${Date.now()}`,
              title: 'Subscription Expired',
              message: `${biz.name} membership has expired. The listing has been suspended. Please renew to restore visibility.`,
              date: today.toISOString().split('T')[0],
              isRead: false,
              receiverRole: 'business' as const
            },
            ...prevN
          ]);
          return { ...biz, status: 'suspended' as const };
        }

        if (expiry >= today && expiry <= sevenDaysFromNow && biz.status === 'active') {
          // Fire 7-day advance warning — only if not already notified today
          setNotifications((prevN) => {
            const alreadyNotified = prevN.some(
              (n) => n.title === 'Subscription Expiring Soon' && n.message.includes(biz.name)
            );
            if (alreadyNotified) return prevN;
            return [
              {
                id: `notif-warn-${biz.id}-${Date.now()}`,
                title: 'Subscription Expiring Soon',
                message: `${biz.name} membership expires on ${biz.membershipExpiryDate}. Please renew to avoid suspension.`,
                date: today.toISOString().split('T')[0],
                isRead: false,
                receiverRole: 'business' as const
              },
              ...prevN
            ];
          });
        }

        return biz;
      })
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [reviews, setReviews] = useState<Review[]>(() => {
    try {
      const saved = localStorage.getItem('shia_dir_reviews');
      if (saved) return JSON.parse(saved);
    } catch { localStorage.removeItem('shia_dir_reviews'); }
    return INITIAL_REVIEWS;
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('shia_dir_favorites');
      if (saved) return JSON.parse(saved);
    } catch { localStorage.removeItem('shia_dir_favorites'); }
    return [];
  });

  const [payments, setPayments] = useState<PaymentRecord[]>(() => {
    try {
      const saved = localStorage.getItem('shia_dir_payments');
      if (saved) return JSON.parse(saved);
    } catch { localStorage.removeItem('shia_dir_payments'); }
    return INITIAL_PAYMENTS;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('shia_dir_products');
      if (saved) return JSON.parse(saved);
    } catch { localStorage.removeItem('shia_dir_products'); }
    return INITIAL_PRODUCTS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('shia_dir_orders');
      if (saved) return JSON.parse(saved);
    } catch { localStorage.removeItem('shia_dir_orders'); }
    return INITIAL_ORDERS;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem('shia_dir_notifications');
      if (saved) return JSON.parse(saved);
    } catch { localStorage.removeItem('shia_dir_notifications'); }
    return [
      {
        id: 'notif-1',
        title: 'App Launched!',
        message: 'Welcome to the Shia Community Business Directory application.',
        date: '2026-06-19',
        isRead: false,
        receiverRole: 'all'
      }
    ];
  });

  // Keep localStorage in sync
  useEffect(() => {
    localStorage.setItem('shia_dir_user', currentUser ? JSON.stringify(currentUser) : '');
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('shia_dir_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('shia_dir_theme', theme);
  }, [theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('shia_dir_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('shia_dir_businesses', JSON.stringify(businesses));
  }, [businesses]);

  useEffect(() => {
    localStorage.setItem('shia_dir_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('shia_dir_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('shia_dir_payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('shia_dir_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const setLanguage = (lang: 'en' | 'ar' | 'fa') => setLanguageState(lang);
  const setTheme = (t: 'light' | 'dark' | 'system') => setThemeState(t);

  const addCategory = (cat: Category) => {
    setCategories((prev) => [...prev, cat]);
  };

  const removeCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const addBusiness = (biz: Business) => {
    setBusinesses((prev) => [...prev, biz]);
    addNotification('New Business Listed', `${biz.name} has registered under ${biz.subcategory.en}.`, 'admin');
  };

  const updateBusiness = (updated: Business) => {
    setBusinesses((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
  };

  const removeBusiness = (id: string) => {
    setBusinesses((prev) => prev.filter((b) => b.id !== id));
  };

  const addReview = (review: Review) => {
    // Use functional update to avoid stale closure — both state updates see the latest data
    setReviews((prevReviews) => {
      const updated = [review, ...prevReviews];
      // Recalculate rating from the freshly updated reviews array
      setBusinesses((prevBusinesses) =>
        prevBusinesses.map((biz) => {
          if (biz.id === review.businessId) {
            const bizReviews = updated.filter((r) => r.businessId === review.businessId);
            const totalRating = bizReviews.reduce((sum, r) => sum + r.rating, 0);
            const newAvg = parseFloat((totalRating / bizReviews.length).toFixed(1));
            return { ...biz, rating: newAvg, reviewsCount: bizReviews.length };
          }
          return biz;
        })
      );
      return updated;
    });
  };

  const toggleFavorite = (businessId: string) => {
    setFavorites((prev) =>
      prev.includes(businessId) ? prev.filter((id) => id !== businessId) : [...prev, businessId]
    );
  };

  const addPayment = (payment: PaymentRecord) => {
    setPayments((prev) => {
      const nw = [payment, ...prev];
      localStorage.setItem('shia_dir_payments', JSON.stringify(nw));
      return nw;
    });
    // Update business subscription status and expiry
    setBusinesses((prev_list) => {
      return prev_list.map((biz) => {
        if (biz.id === payment.businessId) {
          // Set expiry 30 days from now
          const now = new Date();
          now.setDate(now.getDate() + 30);
          const expiryString = now.toISOString().split('T')[0];
          return {
            ...biz,
            status: 'active',
            membershipExpiryDate: expiryString
          };
        }
        return biz;
      });
    });

    const biz = businesses.find((b) => b.id === payment.businessId);
    if (biz) {
      addNotification(
        'Subscription Renewed ✓',
        `Membership for ${biz.name} has been renewed successfully for $50/month. Thank you.`,
        'business'
      );
    }
  };

  const addProduct = (product: Product) => {
    setProducts((prev) => {
      const nw = [product, ...prev];
      localStorage.setItem('shia_dir_products', JSON.stringify(nw));
      return nw;
    });
  };

  const updateOrderStatus = (id: string, status: Order['status']) => {
    setOrders((prev) => {
      const nw = prev.map(o => o.id === id ? { ...o, status } : o);
      localStorage.setItem('shia_dir_orders', JSON.stringify(nw));
      return nw;
    });
  };


  const addNotification = (title: string, message: string, receiverRole: UserRole | 'all') => {
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      date: new Date().toISOString().split('T')[0],
      isRead: false,
      receiverRole
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const signIn = (email: string, phone: string, role: UserRole, name?: string) => {
    const fallbackName = name || email.split('@')[0] || 'User';
    // Generate a deterministic ID based on email so the same person always gets the same ID
    // This allows business owners to be correctly linked to their businesses
    const stableId = `${role}-${email.replace(/[^a-z0-9]/gi, '').toLowerCase()}`;
    const newUser: UserProfile = {
      id: stableId,
      email,
      phone,
      name: fallbackName,
      role,
      preferredLanguage: language
    };
    setCurrentUser(newUser);
    addNotification('Login Successful', `Assalamu Alaykum, ${fallbackName}. Welcome back!`, role);
  };

  const signOut = () => {
    setCurrentUser(null);
  };

  return (
    <DirectoryContext.Provider
      value={{
        currentUser,
        language,
        setLanguage,
        theme,
        setTheme,
        categories,
        addCategory,
        removeCategory,
        businesses,
        addBusiness,
        updateBusiness,
        removeBusiness,
        reviews,
        addReview,
        favorites,
        toggleFavorite,
        payments,
        addPayment,
        products,
        addProduct,
        orders,
        updateOrderStatus,
        notifications,
        addNotification,
        markNotificationsAsRead,
        clearNotifications,
        signIn,
        signOut
      }}
    >
      {children}
    </DirectoryContext.Provider>
  );
};

export const useDirectory = () => {
  const context = useContext(DirectoryContext);
  if (context === undefined) {
    throw new Error('useDirectory must be used within a DirectoryProvider');
  }
  return context;
};

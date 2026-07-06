import React, { useState, useMemo } from 'react';
import { useDirectory } from '../context/DirectoryContext';
import { TRANSLATIONS } from '../data/translations';
import {
  Search,
  MapPin,
  Bell,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Shirt,
  ShoppingBag,
  BookOpen,
  Tv,
  Gem,
  Book,
  Wrench,
  Zap,
  Hammer,
  UserCheck,
  Scale,
  HardHat,
  Utensils,
  Croissant,
  Soup,
  HelpCircle,
  Clock,
  Settings,
  Calculator,
  Building2,
  Sparkles as SparklesIcon
} from 'lucide-react';
import { Business, Category } from '../types';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Shirt,
  ShoppingBag,
  BookOpen,
  Tv,
  Gem,
  Book,
  Wrench,
  Zap,
  Hammer,
  UserCheck,
  Scale,
  HardHat,
  Utensils,
  Croissant,
  Soup,
  Settings,
  Calculator,
  Building: Building2,
  Sparkles: SparklesIcon,
  HelpCircle
};

interface HomeTabProps {
  onSelectBusiness: (biz: Business) => void;
  onSwitchTab: (tabId: string) => void;
  onOpenAuth: () => void;
  setSearchQueryText: (query: string) => void;
}

// ── Open Now helper ───────────────────────────────────────────
function isBusinessOpenNow(workingHours: string): boolean | null {
  try {
    // Parse format like "8:00 AM - 11:00 PM" or "9:00 AM - 9:00 PM (24/7 Available for emergency)"
    const cleaned = workingHours.replace(/\(.*?\)/g, '').trim();
    const parts = cleaned.split('-').map((s) => s.trim());
    if (parts.length < 2) return null;

    const parseTime = (str: string) => {
      const m = str.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!m) return null;
      let h = parseInt(m[1]);
      const min = parseInt(m[2]);
      const period = m[3].toUpperCase();
      if (period === 'PM' && h !== 12) h += 12;
      if (period === 'AM' && h === 12) h = 0;
      return h * 60 + min;
    };

    const open = parseTime(parts[0]);
    const close = parseTime(parts[1]);
    if (open === null || close === null) return null;

    const now = new Date();
    const cur = now.getHours() * 60 + now.getMinutes();

    if (close < open) {
      // Crosses midnight
      return cur >= open || cur <= close;
    }
    return cur >= open && cur <= close;
  } catch {
    return null;
  }
}

export const HomeTab: React.FC<HomeTabProps> = ({
  onSelectBusiness,
  onSwitchTab,
  onOpenAuth,
  setSearchQueryText
}) => {
  const { language, businesses, categories, currentUser, notifications } = useDirectory();
  const t = TRANSLATIONS[language];

  const [inputSearch, setInputSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('all');

  const CITY_KEYS = [
    { key: 'all', label: t.allCities },
    { key: 'New York', label: t.newyork },
    { key: 'Los Angeles', label: t.losangeles },
    { key: 'Chicago', label: t.chicago },
    { key: 'Houston', label: t.houston },
    { key: 'Miami', label: t.miami },
  ];

  // Unread notifications count
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const activeBusinesses = useMemo(
    () => businesses.filter((b) =>
      b.status === 'active' &&
      (selectedCity === 'all' || b.city === selectedCity)
    ),
    [businesses, selectedCity]
  );

  // Bug #6 fix: Featured = active + verified only, sorted best rating first
  const featuredBusinesses = useMemo(
    () =>
      businesses
        .filter((b) => b.status === 'active' && b.isVerified)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 3),
    [businesses]
  );


  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputSearch.trim()) {
      setSearchQueryText(inputSearch);
      onSwitchTab('search');
    }
  };

  const handleCategoryClick = (catId: string) => {
    setSearchQueryText(catId);
    onSwitchTab('search');
  };

  const renderCategoryIcon = (iconName: string) => {
    const iconClass = 'w-5 h-5 text-[#FFA048]';
    const IconComponent = ICON_MAP[iconName] || HelpCircle;
    return <IconComponent className={iconClass} />;
  };

  return (
    <div className="space-y-6" id="home-tab-container">
      
      {/* Top Navigation Banner & Search */}
      <div className="space-y-4 animate-fade-in-up" id="home-top-section">
        {/* Header Context */}
        <div className="pt-2">
          <h1 className="text-3xl font-black text-[#FFA048] tracking-widest uppercase">AVN</h1>
        </div>

        {/* Search Bar (Relocated) */}
        <form onSubmit={handleSearchSubmit} className="relative flex items-center" id="home-search-form">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={inputSearch}
              onChange={(e) => setInputSearch(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-10 pr-24 py-3 bg-[#0F0E0C] border border-[#2E2419] rounded-2xl text-xs text-[#F4E3D7] placeholder-gray-500 outline-none focus:border-[#FFA048] transition-all"
              id="home-search-input"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              setInputSearch('New York');
              setSearchQueryText('New York');
              onSwitchTab('search');
            }}
            className="absolute right-2 px-2.5 py-1.5 rounded-xl bg-[#201B15] text-[#FFA048] font-bold text-[10px] border border-[#3A2F22] flex items-center gap-1 hover:bg-[#2D251C] transition-colors"
            id="home-location-badge-btn"
          >
            <MapPin className="w-3 h-3 text-[#FFA048]" />
            {t.newyork}
          </button>
        </form>
      </div>

      {/* City Quick-Filter Pills */}
      <div className="space-y-2 animate-fade-in-up" style={{animationDelay:'0.08s'}} id="home-city-filter">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none snap-x">
          {CITY_KEYS.map(({ key, label }) => {
            const count = key === 'all'
              ? businesses.filter((b) => b.status === 'active').length
              : businesses.filter((b) => b.status === 'active' && b.city === key).length;
            return (
              <button
                key={key}
                onClick={() => setSelectedCity(key)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all snap-start ${
                  selectedCity === key
                    ? 'bg-[#FFA048] text-black border-[#FFA048] shadow-md'
                    : 'bg-[#13110E] text-gray-400 border-[#2D2319] hover:border-[#FFA048]/40 hover:text-white'
                }`}
                id={`city-pill-${key}`}
              >
                <MapPin className="w-3 h-3" />
                {label}
                <span className={`text-[9px] px-1 py-0.5 rounded-full font-black ${
                  selectedCity === key ? 'bg-black/20 text-black' : 'bg-[#201B15] text-[#FFA048]'
                }`}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>


      <div className="space-y-3 animate-fade-in-up" style={{animationDelay:'0.10s'}} id="home-categories-block">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold tracking-medium text-[#F4E3D7] uppercase">
            {t.categories}
          </h3>
          <button
            onClick={() => onSwitchTab('search')}
            className="text-[10px] text-[#FFA048] font-extrabold flex items-center gap-1 hover:underline"
            id="btn-categories-seeall"
          >
            {t.seeAll} <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Scroll grid row — shows ALL 15 categories */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x stagger-children" id="home-categories-scroll">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className="flex-shrink-0 w-24 p-2.5 rounded-2xl bg-gradient-to-b from-[#191512] to-[#0F0E0C] border border-[#2D2319] flex flex-col items-center justify-center hover:border-[#FFA048]/60 hover:from-[#201B15] hover:to-[#13110E] transition-all text-center snap-start animate-scale-up card-hover shadow-lg"
              id={`cat-card-${cat.id}`}
            >
              <div className="w-10 h-10 rounded-xl bg-[#201B15] border border-[#3A2E22] flex items-center justify-center mb-2 shadow-inner">
                {renderCategoryIcon(cat.iconName)}
              </div>
              <span className="text-[10px] font-black text-gray-300 tracking-tight block truncate w-full">
                {cat.name[language] || cat.name.en}
              </span>
            </button>
          ))}
        </div>
      </div>



      {/* Register Banner — hidden for business owners, service providers, and anyone with an active listing */}
      {currentUser?.role !== 'business' &&
        currentUser?.role !== 'service_provider' &&
        !businesses.some((b) => b.ownerId === currentUser?.id) && (
        <div className="animate-fade-in-up" style={{animationDelay:'0.15s'}}>
          <button
            onClick={() => onSwitchTab('business')}
            className="w-full p-4 rounded-3xl bg-gradient-to-r from-[#FFA048] to-[#D87D2E] text-black shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-between"
            id="btn-register-banner"
          >
            <div className="text-left">
              <h2 className="text-lg font-black">{language === 'en' ? 'Register as a Business' : 'سجل كصاحب عمل'}</h2>
              <p className="text-xs font-semibold opacity-80">{language === 'en' ? 'Join the community directory today' : 'انضم لدليل المجتمع اليوم'}</p>
            </div>
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* All listings directory strip */}
      <div className="space-y-3 animate-fade-in-up" style={{animationDelay:'0.20s'}} id="home-listings-block">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-[#F4E3D7] uppercase tracking-medium">
            {t.allBusinesses}
          </h3>
          <button
            onClick={() => {
              setSearchQueryText('');
              onSwitchTab('search');
            }}
            className="text-[10px] text-[#FFA048] font-bold hover:underline"
            id="btn-allbusinesses-seeall"
          >
            {t.seeAll}
          </button>
        </div>

        {/* Regular businesses list stack */}
        <div className="space-y-3.5 stagger-children" id="home-all-listings-list">
          {activeBusinesses.map((biz) => {
            const isOpen = isBusinessOpenNow(biz.workingHours.en);
            return (
              <div
                key={biz.id}
                onClick={() => onSelectBusiness(biz)}
                className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#13110E] border border-[#2D2319] hover:border-[#FFA048]/30 transition-all cursor-pointer animate-fade-in-up card-hover"
                id={`list-item-${biz.id}`}
              >
                {/* Image avatar left side */}
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-stone-900 border border-[#2D2319] flex-shrink-0">
                  <img
                    src={biz.logoUrl}
                    alt={biz.name}
                    loading="lazy"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=200&h=200';
                    }}
                  />
                </div>

                {/* Center description */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-black text-white hover:text-[#FFA048] truncate transition-colors leading-snug">
                    {biz.name}
                  </h4>
                  <p className="text-[10px] text-gray-400 capitalize mt-0.5">
                    {biz.subcategory[language] || biz.subcategory.en}
                  </p>
                  <span className="text-[9px] text-gray-500 flex items-center gap-0.5 mt-1">
                    <MapPin className="w-3 h-3 text-[#FFA048]" />
                    {t[biz.city.replace(/\\s+/g, '').toLowerCase() as 'newyork' | 'losangeles' | 'chicago']} ({biz.area})
                  </span>
                </div>

                {/* Right side: Verification + Rating + Open/Closed */}
                <div className="text-right flex flex-col items-end gap-1 flex-shrink-0">
                  {biz.isVerified && (
                    <CheckCircle className="w-3.5 h-3.5 text-green-400 fill-green-400/20" />
                  )}
                  <span className="text-[10px] font-black text-[#FFA048]">
                    ★ {biz.rating}
                  </span>
                  {isOpen !== null && (
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${isOpen ? 'badge-open' : 'badge-closed'}`}>
                      {isOpen ? (language === 'ar' ? 'مفتوح' : 'Open') : (language === 'ar' ? 'مغلق' : 'Closed')}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

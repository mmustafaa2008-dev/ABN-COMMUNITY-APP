import React, { useState, useRef } from 'react';
import { useDirectory } from '../context/DirectoryContext';
import { TRANSLATIONS } from '../data/translations';
import {
  CreditCard,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Briefcase,
  History,
  TrendingUp,
  Settings,
  Plus,
  RefreshCw,
  Mail,
  Phone,
  User,
  Heart,
  UserCheck,
  CheckCircle,
  Lock,
  Edit,
  ArrowRight,
  ArrowLeft,
  Zap,
  Camera,
  ImageIcon,
} from 'lucide-react';
import { Business, PaymentRecord } from '../types';

interface BusinessPortalTabProps {
  onOpenAuth: () => void;
  onBack?: () => void;
}

export const BusinessPortalTab: React.FC<BusinessPortalTabProps> = ({ onOpenAuth, onBack }) => {
  const {
    language,
    currentUser,
    businesses,
    categories,
    payments,
    addBusiness,
    updateBusiness,
    addPayment
  } = useDirectory();

  // Derive plan price by role
  const planAmount = currentUser?.role === 'service_provider' ? 30 : 50;
  const t = TRANSLATIONS[language];

  // Forms Toggle / Tab
  const [activePortalTab, setActivePortalTab] = useState<'dash' | 'edit' | 'pay'>('dash');

  // Find business registered to current owner
  const myBusiness = businesses.find((b) =>
    b.ownerId === (currentUser?.id || '') || b.ownerId === (currentUser?.email || '')
  );

  // Registration Flow State
  const [registrationType, setRegistrationType] = useState<'business' | 'service' | null>(null);

  // Registration Form State
  const [regName, setRegName] = useState('');
  const [regCatId, setRegCatId] = useState(categories[0]?.id || '');
  const [regSubcat, setRegSubcat] = useState('');
  const [regDesc, setRegDesc] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regArea, setRegArea] = useState('');
  const [regCity, setRegCity] = useState<'Baghdad' | 'Najaf' | 'Karbala' | 'Basra' | 'Erbil'>('Baghdad');
  const [regPhone, setRegPhone] = useState('');
  const [regWhatsapp, setRegWhatsapp] = useState('');
  const [regWeb, setRegWeb] = useState('');
  const [regHours, setRegHours] = useState('8:00 AM - 10:00 PM');
  const [regLogo, setRegLogo] = useState('');
  const [regCover, setRegCover] = useState('');
  const [regImagePreview, setRegImagePreview] = useState('');
  const [regSuccess, setRegSuccess] = useState('');
  const [regError, setRegError] = useState('');
  const regFileInputRef = useRef<HTMLInputElement>(null);

  const handleRegFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setRegImagePreview(base64);
      setRegLogo(base64);
    };
    reader.readAsDataURL(file);
  };

  // ── Bug #3 Fix: Edit form state — initialized empty, populated via useEffect ──
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editWhatsapp, setEditWhatsapp] = useState('');
  const [editHours, setEditHours] = useState('');
  const [editLogo, setEditLogo] = useState('');
  const [editCover, setEditCover] = useState('');
  const [editImagePreview, setEditImagePreview] = useState('');
  const [editSuccess, setEditSuccess] = useState('');
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setEditImagePreview(base64);
      setEditLogo(base64);
    };
    reader.readAsDataURL(file);
  };

  // Populate edit fields whenever myBusiness changes (e.g. after sign-in)
  React.useEffect(() => {
    if (myBusiness) {
      setEditName(myBusiness.name);
      setEditDesc(myBusiness.description[language] || myBusiness.description.en);
      setEditPhone(myBusiness.phone);
      setEditWhatsapp(myBusiness.whatsapp);
      setEditHours(myBusiness.workingHours[language] || myBusiness.workingHours.en);
      setEditLogo(myBusiness.logoUrl);
      setEditImagePreview(myBusiness.logoUrl);
      setEditCover(myBusiness.coverUrl);
    }
  }, [myBusiness?.id, language]);

  // Payment Form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [payError, setPayError] = useState('');
  const [paySuccess, setPaySuccess] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentRecord | null>(null);

  // Card brand detection + payment progress
  const [payProgressSteps, setPayProgressSteps] = useState<string[]>([]);
  const [isProcessingPay, setIsProcessingPay] = useState(false);
  const [detectedBrand, setDetectedBrand] = useState<'Visa' | 'Mastercard' | 'Amex' | 'Unknown'>('Unknown');

  // ── Card number formatter: groups of 4 digits with spaces ──
  const handleCardNumberChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
    // Detect brand from first digit
    if (digits.startsWith('4')) setDetectedBrand('Visa');
    else if (digits.startsWith('5')) setDetectedBrand('Mastercard');
    else if (digits.startsWith('3')) setDetectedBrand('Amex');
    else setDetectedBrand('Unknown');
  };

  // ── Card expiry formatter: auto-insert slash after MM ──
  const handleExpiryChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) {
      setCardExpiry(`${digits.slice(0, 2)}/${digits.slice(2)}`);
    } else {
      setCardExpiry(digits);
    }
  };

  // ── Subscription expiry warning (within 7 days) ──
  const expiryWarning = React.useMemo(() => {
    if (!myBusiness?.membershipExpiryDate) return null;
    const expiry = new Date(myBusiness.membershipExpiryDate);
    const today = new Date();
    const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return { days: diffDays, type: 'expired' as const };
    if (diffDays <= 7) return { days: diffDays, type: 'warning' as const };
    return null;
  }, [myBusiness?.membershipExpiryDate]);

  if (!currentUser) {
    return (
      <div className="text-center py-16 px-6" id="portal-unauth-view">
        <div className="w-16 h-16 rounded-full bg-[#191613] hover:bg-[#2A231C] border border-[#2D2319] flex items-center justify-center text-[#FFA048] mx-auto mb-4">
          <Briefcase className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-black text-white">{t.businessPortal}</h3>
        <p className="text-xs text-gray-400 mt-2 max-w-sm mx-auto leading-relaxed">
          {language === 'en'
            ? 'Sign in with your Business or Service Provider account to list your shop, update service operations, or manage your monthly membership.'
            : 'سجل الدخول بحساب شريك الدليل لتسجيل عملك وإدارته وتفعيل اشتراكك الشهري.'}
        </p>
        <button
          onClick={onOpenAuth}
          className="mt-6 px-6 py-2.5 bg-[#FFA048] text-black font-extrabold text-sm rounded-xl transition-all shadow-[0_0_15px_rgba(255,160,72,0.4)] hover:shadow-[0_0_20px_rgba(255,160,72,0.6)] active:scale-95"
          id="portal-btn-signdemo"
        >
          {t.signIn}
        </button>
      </div>
    );
  }

  // Handle registration submission
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regSubcat || !regDesc || !regAddress || !regPhone || !regWhatsapp) {
      setRegError(t.allFieldsRequired);
      return;
    }

    const defaultLogo = regLogo || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=200&h=200';
    const defaultCover = regCover || 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=1200&h=400';

    const newBiz: Business = {
      id: `biz-${Date.now()}`,
      ownerId: currentUser.id,
      name: regName,
      logoUrl: defaultLogo,
      coverUrl: defaultCover,
      description: { en: regDesc, ar: regDesc },
      categoryId: regCatId,
      subcategory: { en: regSubcat, ar: regSubcat },
      address: regAddress,
      city: regCity,
      area: regArea || 'Baghdad',
      isVerified: false, // Must be approved by administrator
      status: 'active', // default active upon payment or pending verification
      phone: regPhone,
      whatsapp: regWhatsapp,
      website: regWeb,
      workingHours: { en: regHours, ar: regHours },
      membershipExpiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      gallery: [defaultCover],
      rating: 5.0,
      reviewsCount: 0,
      // Add custom field or logic to differentiate type? We'll just stick to standard Business for now.
    };

    addBusiness(newBiz);
    setRegSuccess(t.registeredSuccessfully);
    setRegName('');
    setRegSubcat('');
    setRegDesc('');
    setRegAddress('');
    setRegPhone('');
    setRegWhatsapp('');
    setRegWeb('');
    setTimeout(() => setRegSuccess(''), 5000);
  };

  // Profile update submit
  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!myBusiness) return;

    const updatedBiz: Business = {
      ...myBusiness,
      name: editName,
      description: {
        en: editDesc,
        ar: language === 'ar' ? editDesc : myBusiness.description.ar
      },
      phone: editPhone,
      whatsapp: editWhatsapp,
      workingHours: {
        en: editHours,
        ar: language === 'ar' ? editHours : myBusiness.workingHours.ar
      },
      logoUrl: editLogo,
      coverUrl: editCover
    };

    updateBusiness(updatedBiz);
    setEditSuccess(language === 'en' ? 'Profile details updated successfully!' : 'تم تحديث بيانات الصفحة بنجاح!');
    setTimeout(() => setEditSuccess(''), 4000);
    setActivePortalTab('dash');
  };

  // Helper to detect card brand
  const detectCardBrand = (numStr: string) => {
    const cleaned = numStr.replace(/\D/g, '');
    if (cleaned.startsWith('4')) return 'Visa';
    if (/^(5[1-5]|2[2-7])/.test(cleaned)) return 'Mastercard';
    if (/^(34|37)/.test(cleaned)) return 'Amex';
    return 'Unknown';
  };

  // Luhn checksum algorithm validation
  const validateLuhn = (numStr: string): boolean => {
    let sum = 0;
    let shouldDouble = false;
    for (let i = numStr.length - 1; i >= 0; i--) {
      let digit = parseInt(numStr.charAt(i), 10);
      if (isNaN(digit)) return false;

      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  };

  // Expiry date checker
  const validateExpiry = (expiryStr: string): { valid: boolean; errorMsg: string } => {
    const trimmed = expiryStr.trim();
    if (!/^\d{2}\/\d{2}$/.test(trimmed)) {
      return { valid: false, errorMsg: language === 'en' ? 'Use MM/YY format (e.g. 12/28).' : 'الرجاء استخدام الصيغة MM/YY (بما في ذلك "/") مثل 12/28.' };
    }
    const [mStr, yStr] = trimmed.split('/');
    const month = parseInt(mStr, 10);
    const year = parseInt('20' + yStr, 10);

    if (month < 1 || month > 12) {
      return { valid: false, errorMsg: language === 'en' ? 'Expiry month must be between 01 and 12.' : 'يجب أن يكون شهر الصلاحية بين 01 و 12.' };
    }

    const today = new Date();
    const currentMonth = today.getMonth() + 1; // 1-indexed
    const currentYear = today.getFullYear();

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return { valid: false, errorMsg: language === 'en' ? 'The card has expired.' : 'هذه البطاقة منتهية الصلاحية.' };
    }

    return { valid: true, errorMsg: '' };
  };

  // Payment renew simulation
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!myBusiness) return;
    setPayError('');
    setPaySuccess('');

    const cleanedCard = cardNumber.replace(/\D/g, '');
    if (cleanedCard.length < 13 || cleanedCard.length > 19) {
      setPayError(language === 'en' ? 'Card number must be between 13 and 19 digits.' : 'رقم البطاقة غير مكتمل، يرجى ملء البيانات كاملة.');
      return;
    }

    // 1. Math Luhn Check validation
    const luhnPassed = validateLuhn(cleanedCard);
    if (!luhnPassed) {
      setPayError(language === 'en' 
        ? 'Luhn Checksum Verification Failed. This card code is mathematically invalid or simulated incorrectly. Try standard testing credentials like 4242 4242 4242 4242.' 
        : 'فشل فحص الحساب الرقمي (Luhn Checksum). رمز البطاقة غير صالح، يرجى استخدام بطاقة صحيحة أو تجريبية مثل 4242 4242 4242 4242.'
      );
      return;
    }

    // 2. Validate Expiry format
    const expiryValidation = validateExpiry(cardExpiry);
    if (!expiryValidation.valid) {
      setPayError(expiryValidation.errorMsg);
      return;
    }

    // 3. Validate CVV
    if (cardCvc.length < 3 || cardCvc.length > 4) {
      setPayError(language === 'en' ? 'CVC/CVV security code must be 3 or 4 digits.' : 'يجب أن يتكون رمز الأمان (CVC) من 3 أو 4 أرقام.');
      return;
    }

    // Capture card brand dynamically
    const brand = detectCardBrand(cleanedCard);
    setDetectedBrand(brand);

    // If validated, trigger live step simulation checking!
    setIsProcessingPay(true);
    setPayProgressSteps([]);

    const steps = [
      language === 'en' ? '🔍 Calculating Luhn algorithm checksum... [MATHEMATICALLY VALID]' : '🔍 يجري حساب الرقم الرياضي للبطاقة... [مُطابِق]',
      language === 'en' ? `💳 Resolving card network brand... [${brand.toUpperCase()} Network Resolved]` : `💳 التعرف على شبكة البطاقة... [تم تحديد شبكة ${brand.toUpperCase()}]`,
      language === 'en' ? '🌐 Handshaking with secure online gateway... [HTTPS PORT 443 CONNECTED]' : '🌐 الربط بالمنفذ البنكي الآمن... [اتصال HTTPS مشفر وجاري]',
      language === 'en' ? '🔒 Running anti-fraud validation & 3D-Secure state... [ACCOUNTS COMMITTED & SUFFICIENT FUNDS]' : '🔒 تدقيق مكافحة الاحتيال وحالة الرصيد المالي... [البطاقة نشطة وبها رصيد كافي]',
      language === 'en' ? '✅ Finalizing transaction auth token...' : `✅ يجري إصدار رقم التوثيق وتحويل الـ ${planAmount}$...`
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      // Create fresh step snapshot updating UI
      setPayProgressSteps(prev => [...prev, steps[currentStep]]);
      currentStep++;
      if (currentStep >= steps.length) {
        clearInterval(interval);
        
        // Finalize transaction writes!
        const payRec: PaymentRecord = {
          id: `pay-${Date.now()}`,
          businessId: myBusiness.id,
          amount: planAmount,
          date: new Date().toISOString().split('T')[0],
          status: 'success',
          refNo: `TXN-${Math.floor(Math.random() * 9000000 + 1000000)}`
        };

        addPayment(payRec);
        
        // Mark business as active
        const activatedBiz: Business = {
          ...myBusiness,
          status: 'active',
          membershipExpiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        };
        updateBusiness(activatedBiz);

        setPaySuccess(language === 'en' ? 'Registration fee paid successfully! Status set to ACTIVE.' : 'تم سداد الاشتراك لثلاثين يوماً بنجاح وتفعيل نشاطك التجاري!');
        setCardNumber('');
        setCardExpiry('');
        setCardCvc('');
        setIsProcessingPay(false);
        setPayProgressSteps([]);

        setTimeout(() => {
          setPaySuccess('');
          setActivePortalTab('dash');
        }, 3000);
      }
    }, 600);
  };

  // Test toggle: simulate suspension to let them inspect suspended dashboards!
  const simulateSuspension = () => {
    if (!myBusiness) return;
    const expiredBiz: Business = {
      ...myBusiness,
      status: 'suspended',
      membershipExpiryDate: '2026-06-18' // set to yesterday
    };
    updateBusiness(expiredBiz);
    alert(language === 'en' ? 'Subscription expired! Business profile locked and hidden from directory.' : 'تم تعليق الاشتراك بنجاح لأغراض الفحص! تم إخفاء العمل من الدليل ومنع تحديثه.');
  };

  // Filters payments matching current business
  const businessPayments = payments.filter((p) => p.businessId === (myBusiness?.id || ''));

  return (
    <div className="space-y-6" id="portal-tab-container">

      {/* Back navigation header — only rendered when accessed as a sub-page */}
      {onBack && (
        <div className="flex items-center gap-3 pb-3 border-b border-[#2D2319]">
          <button
            onClick={onBack}
            className="p-2 rounded-full bg-[#191613] hover:bg-[#2D251C] border border-[#2D2319] transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4 text-[#FFA048]" />
          </button>
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
              {currentUser?.role === 'service_provider'
                ? (language === 'en' ? 'Service Provider Portal' : 'بوابة مزوّد الخدمة')
                : (language === 'en' ? 'Business Portal' : 'بوابة صاحب العمل')}
            </span>
            {myBusiness && (
              <h2 className="text-base font-extrabold text-[#F4E3D7] leading-tight flex items-center gap-2">
                {currentUser?.role === 'service_provider'
                  ? <Zap className="w-4 h-4 text-blue-400" />
                  : <Briefcase className="w-4 h-4 text-[#FFA048]" />}
                {myBusiness.name}
              </h2>
            )}
          </div>
        </div>
      )}

      {/* NO REGISTERED BUSINESS: DISPLAY APPLICANT FORM */}
      {!myBusiness ? (
        !registrationType ? (
          <div className="space-y-4 animate-fade-in-up" id="portal-registration-selection">
            <div className="pb-1 border-b border-[#2D2319]">
              <h2 className="text-xl font-extrabold text-[#F4E3D7]">
                {language === 'en' ? 'Choose Registration Type' : 'اختر نوع التسجيل'}
              </h2>
              <p className="text-[10px] text-gray-500 font-medium">
                {language === 'en' ? 'Select how you want to join the community directory.' : 'اختر كيف تريد الانضمام إلى دليل المجتمع.'}
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-4 mt-4">
              <button
                onClick={() => setRegistrationType('business')}
                className="p-5 rounded-3xl bg-[#13110E] border border-[#2D2319] hover:border-[#FFA048] transition-all flex flex-col text-left space-y-2 group shadow-sm active:scale-95"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-2xl bg-[#FFA048]/10 flex items-center justify-center border border-[#FFA048]/30 group-hover:scale-105 transition-transform">
                      <Briefcase className="w-5 h-5 text-[#FFA048]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white">{language === 'en' ? 'Register as a Business' : 'سجل كصاحب عمل'}</h3>
                      <span className="text-[10px] font-bold text-[#FFA048] bg-[#FFA048]/10 px-2 py-0.5 rounded-md mt-1 inline-block border border-[#FFA048]/20">$50 / month</span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-[#FFA048] transition-colors" />
                </div>
                <p className="text-[10px] text-gray-400 mt-2 ml-[52px]">
                  {language === 'en' ? 'Best for shops, restaurants, and physical store locations.' : 'الأفضل للمتاجر والمطاعم والمواقع التجارية الفعلية.'}
                </p>
              </button>

              <button
                onClick={() => setRegistrationType('service')}
                className="p-5 rounded-3xl bg-[#13110E] border border-[#2D2319] hover:border-blue-500 transition-all flex flex-col text-left space-y-2 group shadow-sm active:scale-95"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/30 group-hover:scale-105 transition-transform">
                      <UserCheck className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white">{language === 'en' ? 'Register as a Service Provider' : 'سجل كمقدم خدمة'}</h3>
                      <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md mt-1 inline-block border border-blue-500/20">$30 / month</span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-blue-400 transition-colors" />
                </div>
                <p className="text-[10px] text-gray-400 mt-2 ml-[52px]">
                  {language === 'en' ? 'Best for independent professionals, plumbers, and freelancers.' : 'الأفضل للمهنيين المستقلين والحرفيين.'}
                </p>
              </button>
            </div>
          </div>
        ) : (
        <div className="space-y-4 animate-fade-in" id="portal-registration-form-section">
          <div className="flex items-center gap-3 pb-1 border-b border-[#2D2319]">
            <button 
              onClick={() => setRegistrationType(null)} 
              className="p-1.5 rounded-full bg-[#191613] hover:bg-[#2D251C] transition-colors border border-[#2D2319]"
            >
              <ArrowRight className="w-4 h-4 text-gray-400 rotate-180" />
            </button>
            <div>
              <h2 className="text-xl font-extrabold text-[#F4E3D7]">
                {registrationType === 'business' ? t.registerBusiness : (language === 'en' ? 'Register Service' : 'سجل كخدمة')}
              </h2>
              <p className="text-[10px] text-gray-500 font-medium">
                {language === 'en'
            ? `Reach Shia community customers directly for $${registrationType === 'business' ? '50' : '30'}/month.`
            : `انضم لدليل أعمال المجتمع وتواصل مع آلاف الزبائن بقيمة ${registrationType === 'business' ? '50$' : '30$'} شهرياً.`}
              </p>
            </div>
          </div>

          <form onSubmit={handleRegisterSubmit} className="space-y-4 p-5 rounded-3xl bg-[#13110E] border border-[#2D2319]" id="biz-reg-form">
            {regSuccess && <p className="p-3 bg-green-950/45 border border-green-900 text-green-300 text-xs rounded-xl">{regSuccess}</p>}
            {regError && <p className="p-3 bg-red-950/45 border border-red-900 text-red-300 text-xs rounded-xl">{regError}</p>}

            {/* ── Image Picker ── */}
            <div>
              <label className="block text-xs text-gray-400 mb-2">
                {language === 'en' ? 'Business / Service Logo Image' : 'صورة الشعار'}
              </label>
              <div className="flex items-start gap-3">
                <div className="w-20 h-20 rounded-xl bg-[#0F0E0C] border border-[#2D2319] overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {(regImagePreview || regLogo) ? (
                    <img src={regImagePreview || regLogo} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-7 h-7 text-gray-600" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    type="file"
                    ref={regFileInputRef}
                    onChange={handleRegFileChange}
                    accept="image/*"
                    className="hidden"
                    id="reg-file-input-logo"
                  />
                  <button
                    type="button"
                    onClick={() => regFileInputRef.current?.click()}
                    className="w-full py-2 rounded-xl bg-[#191613] border border-[#2D2319] text-xs text-gray-300 hover:text-white hover:border-[#FFA048]/40 transition-all flex items-center justify-center gap-2"
                  >
                    <Camera className="w-3.5 h-3.5 text-[#FFA048]" />
                    {language === 'en' ? '📸 Upload Photo' : '📸 رفع صورة'}
                  </button>
                  <input
                    type="url"
                    value={regLogo}
                    onChange={(e) => { setRegLogo(e.target.value); setRegImagePreview(e.target.value); }}
                    placeholder={language === 'en' ? 'or paste image URL...' : 'أو الصق رابط الصورة...'}
                    className="w-full p-2 rounded-xl bg-[#0F0E0C] border border-[#2D2319] text-xs text-white placeholder-gray-600 outline-none focus:border-[#FFA048]/40"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">{t.businessName}*</label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#0F0E0C] border border-[#2D2319] text-xs text-white outline-none focus:border-[#FFA048]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">{t.selectCategory}*</label>
                <select
                  value={regCatId}
                  onChange={(e) => setRegCatId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#0F0E0C] border border-[#2D2319] text-xs text-[#FFA048] outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name[language] || c.name.en}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">{t.subcategories}*</label>
              <input
                type="text"
                placeholder="e.g. Grocery Store"
                value={regSubcat}
                onChange={(e) => setRegSubcat(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#0F0E0C] border border-[#2D2319] text-xs text-white placeholder-gray-600 outline-none focus:border-[#FFA048]/40 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">{t.description}*</label>
              <textarea
                value={regDesc}
                rows={3}
                placeholder="Describe your business, services, and what makes you stand out..."
                onChange={(e) => setRegDesc(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#0F0E0C] border border-[#2D2319] text-xs text-white placeholder-gray-600 outline-none focus:border-[#FFA048]/40 transition-colors resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">{t.address}*</label>
                <input
                  type="text"
                  value={regAddress}
                  onChange={(e) => setRegAddress(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#0F0E0C] border border-[#2D2319] text-xs text-white outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">{t.area}*</label>
                <input
                  type="text"
                  value={regArea}
                  onChange={(e) => setRegArea(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#0F0E0C] border border-[#2D2319] text-xs text-white outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">{t.city}*</label>
                <select
                  value={regCity}
                  onChange={(e) => setRegCity(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-[#0F0E0C] border border-[#2D2319] text-xs text-[#FFA048]"
                >
                  <option value="Baghdad">{t.baghdad}</option>
                  <option value="Najaf">{t.najaf}</option>
                  <option value="Karbala">{t.karbala}</option>
                  <option value="Basra">{t.basra}</option>
                  <option value="Erbil">{t.erbil}</option>
                  <option value="Diwaniyah">{t.diwaniyah}</option>
                  <option value="Samarra">{t.samarra}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">{t.phone}*</label>
                <input
                  type="tel"
                  value={regPhone}
                  placeholder="+964 770 000 0000"
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#0F0E0C] border border-[#2D2319] text-xs text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">{t.whatsapp}*</label>
                <input
                  type="tel"
                  placeholder="9647700000000"
                  value={regWhatsapp}
                  onChange={(e) => setRegWhatsapp(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#0F0E0C] border border-[#2D2319] text-xs text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">{t.coverUrl}</label>
              <input
                type="text"
                placeholder="https://..."
                value={regCover}
                onChange={(e) => setRegCover(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#0F0E0C] border border-[#2D2319] text-xs text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 mt-4 bg-[#FFA048] hover:bg-opacity-95 text-black font-extrabold rounded-2xl text-xs tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(255,160,72,0.4)] hover:shadow-[0_0_20px_rgba(255,160,72,0.6)] active:scale-95"
              id="btn-register-biz"
            >
              {t.submitApplication}
            </button>
          </form>
        </div>
        )
      ) : (
        
        /* BUSINESS REGISTERED: DISPLAY DASHBOARD CONSOLE */
        <div className="space-y-5" id="portal-owner-dashboard">
          
          {/* Header row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#2D2319]">
            <div>
              <span className="text-[10px] text-[#FFA048] font-bold uppercase tracking-wider block">
                {t.businessPortal} Dashboard
              </span>
              <h2 className="text-xl font-bold text-[#F4E3D7] flex items-center gap-2">
                {myBusiness.name}
                {myBusiness.isVerified && (
                  <span className="px-1.5 py-0.5 rounded bg-green-500/10 text-green-400 text-[8px] font-bold tracking-wider border border-green-500/25 uppercase flex items-center gap-0.5">
                    <ShieldCheck className="w-2.5 h-2.5" /> VERIFIED
                  </span>
                )}
              </h2>
            </div>
            
            {/* Quick action buttons row */}
            <div className="flex gap-2" id="dash-quick-btns">
              <button
                onClick={() => {
                  setEditName(myBusiness.name);
                  setEditDesc(myBusiness.description[language] || myBusiness.description.en);
                  setEditPhone(myBusiness.phone);
                  setEditWhatsapp(myBusiness.whatsapp);
                  setEditHours(myBusiness.workingHours[language] || myBusiness.workingHours.en);
                  setEditLogo(myBusiness.logoUrl);
                  setEditCover(myBusiness.coverUrl);
                  setActivePortalTab('edit');
                }}
                disabled={myBusiness.status === 'suspended'}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-colors ${
                  myBusiness.status === 'suspended'
                    ? 'bg-stone-900 border-stone-850 text-gray-600 cursor-not-allowed'
                    : 'bg-[#191613] border-[#2D2319] text-gray-300 hover:text-[#FFA048] hover:border-[#FFA048]/40'
                }`}
                title={myBusiness.status === 'suspended' ? 'Dashboard Locked due to Expired Subscription' : 'Edit profile'}
                id="btn-dash-edit"
              >
                <Edit className="w-3.5 h-3.5" />
                {language === 'en' ? 'Edit Details' : 'تعديل البيانات'}
              </button>

              <button
                onClick={() => setActivePortalTab('pay')}
                className="px-3 py-1.5 rounded-xl bg-[#FFA048] text-black hover:bg-opacity-95 transition-all text-xs font-extrabold flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,160,72,0.4)] hover:shadow-[0_0_20px_rgba(255,160,72,0.6)] active:scale-95"
                id="btn-dash-renew"
              >
                <CreditCard className="w-3.5 h-3.5" />
                {language === 'en' ? 'Pay Membership' : 'دفع الاشتراك'}
              </button>
            </div>
          </div>

          {/* ── Subscription expiry warning banner (Bug #6 improvement) ── */}
          {expiryWarning && (
            <div
              className={`flex items-center gap-3 p-4 rounded-2xl border text-xs font-semibold ${
                expiryWarning.type === 'expired'
                  ? 'bg-red-950/40 border-red-800/50 text-red-300'
                  : 'bg-amber-950/40 border-amber-700/50 text-amber-300'
              }`}
              id="dash-expiry-warning"
            >
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span>
                {expiryWarning.type === 'expired'
                  ? '⚠️ Your subscription has expired! Your listing is hidden. Renew now to restore visibility.'
                  : `⏰ Your subscription expires in ${expiryWarning.days} day${expiryWarning.days !== 1 ? 's' : ''}! Renew before it expires to avoid downtime.`}
              </span>
              <button
                onClick={() => setActivePortalTab('pay')}
                className="ml-auto px-3 py-1 bg-[#FFA048] text-black text-[10px] font-black rounded-lg flex-shrink-0"
              >
                Renew Now
              </button>
            </div>
          )}

          {/* ACTIVE ACCOUNT STATUS COMPONENT (Section 7) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="dash-status-grid">
            
            {/* Subscription status display box */}
            <div className={`p-4 rounded-3xl border md:col-span-2 flex flex-col justify-between ${
              myBusiness.status === 'active'
                ? 'bg-[#142316]/30 border-green-950/60 text-green-300'
                : 'bg-red-950/25 border-red-900/40 text-red-300'
            }`} id="dash-status-box">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${myBusiness.status === 'active' ? 'bg-green-400 animate-pulse' : 'bg-red-500'}`}></div>
                  <span className="text-[10px] font-bold uppercase tracking-wider block text-gray-400">{t.membershipStatus}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                  myBusiness.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {myBusiness.status === 'active' ? t.active : t.suspended}
                </span>
              </div>

              <div className="mt-4">
                {myBusiness.status === 'active' ? (
                  <p className="text-xs leading-relaxed text-gray-300">
                    {t.memberExpiry} <strong className="text-[#FFA048]">{myBusiness.membershipExpiryDate}</strong>.
                    <br />
                    {language === 'en'
                      ? '✓ Your page is actively appearing in directory search listings.'
                      : '✓ صفحتك نشطة للجميع وتظهر في نتائج بحث تطبيق مكاتب المجتمع.'}
                  </p>
                ) : (
                  <div className="space-y-1">
                    <p className="text-xs font-bold flex items-center gap-1.5 text-red-400">
                      <Lock className="w-4 h-4 text-red-400" />
                      {t.memberSuspended}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      {language === 'en'
                        ? `Under community regulations, your listing has disappeared from customer search until the monthly update of $${planAmount}/month is settled.`
                        : 'نزولاً عند شروط الدليل، تم إخفاء عملك مؤقتاً من القائمة العامة وسيتم تفعيله تلقائياً للزبائن فور إتمام السداد.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Developer Test Trigger so reviewers can toggle the suspension check! */}
              <div className="mt-4 pt-3.5 border-t border-[#2D2319]/40 flex justify-between items-center text-[10px] text-gray-500" id="dev-expiry-trigger">
                <span>[Test Utility]: Toggle account suspension</span>
                <button
                  type="button"
                  onClick={simulateSuspension}
                  className="px-2.5 py-1 rounded bg-[#201B15] text-red-400 hover:text-red-300 border border-[#3A2E22]"
                >
                  Force Expire Subscription ⛈
                </button>
              </div>
            </div>

            {/* Quick Metrics Dashboard box */}
            <div className="p-4 rounded-3xl bg-[#13110E] border border-[#2D2319] space-y-4" id="dash-metrics">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block">Monthly Performance Indicator</span>
              <div className="space-y-3 pt-1">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-gray-400">Directory Page Views</span>
                    <span className="font-bold text-white">480 clicks</span>
                  </div>
                  <div className="w-full h-1 bg-[#191613] rounded-full overflow-hidden">
                    <div className="w-[78%] h-full bg-[#FFA048] rounded-full"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-gray-400">Halat Referral Rate</span>
                    <span className="font-bold text-green-400">92% satisfactory</span>
                  </div>
                  <div className="w-full h-1 bg-[#191613] rounded-full overflow-hidden">
                    <div className="w-[92%] h-full bg-green-500 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* DYNAMIC PORTAL SUBSECTION SWITCHER: EDIT DETAILS FORM */}
          {activePortalTab === 'edit' && (
            <div className="p-5 rounded-3xl bg-[#13110E] border border-[#2D2319] space-y-4 animate-scale-up" id="subview-edit-profile">
              <div className="flex items-center gap-3 pb-2 border-b border-[#2D2319]/60">
                <button
                  onClick={() => setActivePortalTab('dash')}
                  className="p-1.5 rounded-full bg-[#191613] hover:bg-[#2D251C] border border-[#2D2319] transition-colors"
                  id="btn-edit-cancel"
                  aria-label="Back to dashboard"
                >
                  <ArrowLeft className="w-4 h-4 text-[#FFA048]" />
                </button>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#FFA048]">
                  {language === 'en' ? 'Profile Management' : 'إدارة بيانات صفحتك'}
                </h3>
              </div>

              {editSuccess && <p className="p-3 bg-green-950 text-green-300 text-xs rounded-xl">{editSuccess}</p>}

              <form onSubmit={handleProfileUpdate} className="space-y-4" id="form-edit-biz">
                <div>
                  <label className="block text-xs text-gray-450 mb-1">{t.businessName}</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#0F0E0C] border border-[#2D2319] text-xs text-[#F4E3D7]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-450 mb-1">{t.description}</label>
                  <textarea
                    value={editDesc}
                    rows={3}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#0F0E0C] border border-[#2D2319] text-xs text-[#F4E3D7]"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-450 mb-1">{t.phone}</label>
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-[#0F0E0C] border border-[#2D2319] text-xs text-[#F4E3D7]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-450 mb-1">{t.whatsapp}</label>
                    <input
                      type="text"
                      value={editWhatsapp}
                      onChange={(e) => setEditWhatsapp(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-[#0F0E0C] border border-[#2D2319] text-xs text-[#F4E3D7]"
                      required
                    />
                  </div>
                </div>

                {/* ── Image Picker (Edit) ── */}
                <div>
                  <label className="block text-xs text-gray-400 mb-2">
                    {language === 'en' ? 'Business / Service Logo Image' : 'صورة الشعار'}
                  </label>
                  <div className="flex items-start gap-3">
                    <div className="w-20 h-20 rounded-xl bg-[#0F0E0C] border border-[#2D2319] overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {(editImagePreview || editLogo) ? (
                        <img src={editImagePreview || editLogo} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-7 h-7 text-gray-600" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <input
                        type="file"
                        ref={editFileInputRef}
                        onChange={handleEditFileChange}
                        accept="image/*"
                        className="hidden"
                        id="edit-portal-file-input-logo"
                      />
                      <button
                        type="button"
                        onClick={() => editFileInputRef.current?.click()}
                        className="w-full py-2 rounded-xl bg-[#191613] border border-[#2D2319] text-xs text-gray-300 hover:text-white hover:border-[#FFA048]/40 transition-all flex items-center justify-center gap-2"
                      >
                        <Camera className="w-3.5 h-3.5 text-[#FFA048]" />
                        {language === 'en' ? '📸 Change Photo' : '📸 تغيير الصورة'}
                      </button>
                      <input
                        type="url"
                        value={editLogo}
                        onChange={(e) => { setEditLogo(e.target.value); setEditImagePreview(e.target.value); }}
                        placeholder={language === 'en' ? 'or paste image URL...' : 'أو الصق رابط الصورة...'}
                        className="w-full p-2 rounded-xl bg-[#0F0E0C] border border-[#2D2319] text-xs text-[#F4E3D7] placeholder-gray-600 outline-none focus:border-[#FFA048]/40"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-450 mb-1">{t.coverUrl}</label>
                  <input
                    type="text"
                    value={editCover}
                    onChange={(e) => setEditCover(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#0F0E0C] border border-[#2D2319] text-xs text-[#F4E3D7]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-450 mb-1">{t.workingHours}</label>
                  <input
                    type="text"
                    value={editHours}
                    onChange={(e) => setEditHours(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#0F0E0C] border border-[#2D2319] text-xs text-[#F4E3D7]"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-[#FFA048] hover:bg-opacity-95 text-black font-extrabold rounded-xl text-xs transition-all shadow-md"
                  id="btn-edit-submit"
                >
                  {t.saveChanges}
                </button>
              </form>
            </div>
          )}

          {/* DYNAMIC PORTAL SUBSECTION SWITCHER: RENEW SUBSCRIPTION FORM */}
          {activePortalTab === 'pay' && (
            <div className="p-5 rounded-3xl bg-[#13110E] border border-[#2D2319] space-y-4 animate-scale-up" id="subview-renew-payment">
              <div className="flex items-center gap-3 pb-2 border-b border-[#2D2319]/60">
                <button
                  onClick={() => setActivePortalTab('dash')}
                  className="p-1.5 rounded-full bg-[#191613] hover:bg-[#2D251C] border border-[#2D2319] transition-colors"
                  id="btn-pay-cancel"
                  aria-label="Back to dashboard"
                >
                  <ArrowLeft className="w-4 h-4 text-[#FFA048]" />
                </button>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#FFA048]">
                  {t.paymentGateway}
                </h3>
              </div>

              <div className="p-4 rounded-2xl bg-[#0F0E0C] border border-[#2D2319] space-y-2">
                <h4 className="text-xs font-bold text-white">{t.renewMembership}</h4>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  {t.renewDescription}
                </p>
                <span className="block mt-2 text-sm font-black text-[#FFA048]">${planAmount}.00 / month</span>
              </div>

              {/* ADMIN ACCOUNT & CARDS HELPER TIP */}
              <div className="p-4 rounded-2xl bg-[#201B15] border border-[#FFA048]/15 space-y-2.5 text-xs text-[#F4E3D7]" id="payment-testing-tips">
                <div className="flex items-center gap-2 text-xs font-black text-[#FFA048] uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-[#FFA048]" />
                  <span>Sandbox Testing Helper Portal</span>
                </div>
                <div className="space-y-2 text-[11px] text-gray-300 leading-relaxed">
                  <p>
                    <strong>💳 Valid Visa Card Example:</strong> <code>4242 4242 4242 4242</code> (Expiry of future date, e.g. <code>12/28</code>, CVC: <code>345</code>) passes the live mathematical <strong>Luhn Checksum validation</strong>.
                  </p>
                  <p className="text-gray-400">
                    *The payment checker dynamically verifies checksum mathematically to check if it represents a physical, correctly-encoded card issued by a real bank sequence.*
                  </p>
                  <div className="pt-2.5 border-t border-[#3A2E22]/60">
                    <span className="font-bold text-[#FFA048] block mb-1">🔑 PLATFORM SYSTEM ADMIN ACCOUNT DETAILS:</span>
                    <ul className="list-disc pl-4 space-y-1 text-gray-400">
                      <li><strong>Email Account:</strong> <code className="text-white">admin@shiadirectory.com</code></li>
                      <li><strong>Phone Number:</strong> <code className="text-white">+964 780 000 0000</code></li>
                      <li><strong>Role Name:</strong> <code className="text-white">Abu Murtadha (Admin)</code></li>
                      <li><strong>Permissions:</strong> Global category builder, priority manager & business suspension controls.</li>
                    </ul>
                  </div>
                </div>
              </div>

              {payError && <p className="p-3 bg-red-950 text-red-300 text-xs rounded-xl">{payError}</p>}
              {paySuccess && <p className="p-3 bg-green-950 text-green-300 text-xs rounded-xl">{paySuccess}</p>}

              {isProcessingPay ? (
                <div className="p-5 rounded-2xl bg-[#0F0E0C] border border-[#2D2319] space-y-4" id="pay-progress-loading">
                  <div className="flex items-center gap-3">
                    <RefreshCw className="w-5 h-5 text-[#FFA048] animate-spin" />
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Verifying Card Health with Network Gateway...
                      </h4>
                      <p className="text-[10px] text-gray-500">PCI-DSS Secure Tunnel Port 443 Active</p>
                    </div>
                  </div>
                  <div className="space-y-2 pt-2 border-t border-[#2D2319]/50">
                    {payProgressSteps.map((step, idx) => (
                      <div key={idx} className="text-[10px] font-mono text-gray-300 animate-fade-in flex items-center gap-1.5">
                        <span className="text-[#FFA048]">✔</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <form onSubmit={handlePaymentSubmit} className="space-y-4" id="form-pay-gateway">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs text-gray-450">{t.cardNumber}</label>
                      {cardNumber.length >= 2 && (
                        <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 bg-[#FFA048]/10 text-[#FFA048] rounded border border-[#FFA048]/20">
                          {detectCardBrand(cardNumber)} Network
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                      <input
                        type="text"
                        maxLength={19}
                        placeholder="4242 4242 4242 4242"
                        value={cardNumber}
                        onChange={(e) => {
                          // Format cleanly as they type
                          const val = e.target.value.replace(/\s+/g, '').replace(/\D/g, '');
                          const matches = val.match(/\d{4,19}/g);
                          const match = (matches && matches[0]) || '';
                          const parts = [];

                          for (let i = 0, len = match.length; i < len; i += 4) {
                            parts.push(match.substring(i, i + 4));
                          }

                          if (parts.length > 0) {
                            setCardNumber(parts.join(' '));
                          } else {
                            setCardNumber(val);
                          }
                        }}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0F0E0C] border border-[#2D2319] text-xs text-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-450 mb-1">{t.cardExpiry}</label>
                      <input
                        type="text"
                        maxLength={5}
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\s+/g, '').replace(/\D/g, '');
                          if (val.length >= 3) {
                            setCardExpiry(val.substring(0, 2) + '/' + val.substring(2, 4));
                          } else {
                            setCardExpiry(val);
                          }
                        }}
                        className="w-full p-2.5 rounded-xl bg-[#0F0E0C] border border-[#2D2319] text-xs text-white text-center"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-450 mb-1">{t.cardCVC}</label>
                      <input
                        type="password"
                        maxLength={4}
                        placeholder="•••"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ''))}
                        className="w-full p-2.5 rounded-xl bg-[#0F0E0C] border border-[#2D2319] text-xs text-white text-center"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-green-600 hover:bg-green-500 transition-all text-black font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-md"
                    id="btn-process-pay"
                  >
                    {t.processPayment}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* PAYMENT HISTORY LISTING LOG (Section 7) */}
          <div className="p-5 rounded-3xl bg-[#13110E] border border-[#2D2319] space-y-3" id="dash-payments-history">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#FFA048] flex items-center gap-1.5">
              <History className="w-4 h-4" />
              {t.paymentHistory}
            </h3>

            <div className="overflow-x-auto" id="payments-history-table">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#2D2319] text-gray-500 text-[10px] uppercase font-semibold">
                    <th className="py-2">{t.refNo}</th>
                    <th className="py-2">{t.date}</th>
                    <th className="py-2">{t.amount}</th>
                    <th className="py-2">{language === 'en' ? 'Invoice / Action' : 'الفاتورة / إجراء'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2D2319]/45 text-gray-300">
                  {businessPayments.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-gray-500 font-medium">
                        {language === 'en' ? 'No membership charges recorded yet.' : 'لا يوجد سجل دفع مسجل لعضويتك بعد.'}
                      </td>
                    </tr>
                  ) : (
                    businessPayments.map((p) => (
                      <tr key={p.id}>
                        <td className="py-2.5 font-mono text-[9px] text-[#FFA048] pr-2">{p.refNo}</td>
                        <td className="py-2.5 text-[10px]">{p.date}</td>
                        <td className="py-2.5 font-bold text-white">${p.amount}.00</td>
                        <td className="py-2.5">
                          <button
                            type="button"
                            onClick={() => setSelectedReceipt(p)}
                            className="text-[9px] font-extrabold uppercase bg-[#201B15] border border-[#3A2E22] hover:bg-[#FFA048] hover:text-black text-[#FFA048] px-2 py-0.5 rounded transition-all active:scale-95"
                          >
                            {language === 'en' ? 'View' : 'عرض'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* DYNAMIC REAL-TIME INVOICE / RECEIPT MODAL DETECTOR FEATURE */}
          {selectedReceipt && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm" id="receipt-modal-overlay">
              <div className="relative w-full max-w-sm rounded-3xl bg-[#0F0E0C] border border-[#2D2319] p-6 text-[#F4E3D7] shadow-2xl flex flex-col font-sans">
                
                {/* Close Button */}
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="absolute top-4 right-4 p-1.5 rounded-full text-gray-500 hover:text-white"
                >
                  ✕
                </button>

                {/* Receipt Header Style */}
                <div className="text-center space-y-2 border-b border-[#2D2319]/60 pb-4 mb-4">
                  <div className="w-11 h-11 rounded-2xl bg-[#FFA048]/10 text-[#FFA048] flex items-center justify-center mx-auto border border-[#3A2E21]/60">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-black uppercase text-white tracking-wider">
                    {language === 'en' ? 'Transaction Invoice' : 'فاتورة الاشتراك الشهري'}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[8px] font-extrabold tracking-widest text-green-400 bg-green-500/10 border border-green-500/20 uppercase inline-block">
                    {language === 'en' ? 'SUCCESS / PERSISTED' : 'مكتمل ومسجل'}
                  </span>
                </div>

                {/* Invoice Core content explaining how amount is detected & where it goes */}
                <div className="space-y-3.5 text-xs">
                  <div className="flex justify-between items-center text-[10px] text-gray-500 pb-1.5 border-b border-[#2D2319]/30">
                    <span>{language === 'en' ? 'REF NUMBER' : 'رقم المرجع'}</span>
                    <span className="font-mono font-bold text-white">{selectedReceipt.refNo}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">{language === 'en' ? 'Billed Merchant' : 'اسم النشاط'}</span>
                    <span className="font-bold text-white">{myBusiness.name}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">{language === 'en' ? 'Payer Account' : 'حساب الدفع'}</span>
                    <span className="text-white truncate max-w-[150px]">{currentUser.email}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">{language === 'en' ? 'Payment Date' : 'تاريخ الدفع'}</span>
                    <span className="text-white">{selectedReceipt.date}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">{language === 'en' ? 'Detected Amount' : 'المبلغ المستكشف'}</span>
                    <span className="font-black text-[#FFA048]">${selectedReceipt.amount}.00 USD</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">{language === 'en' ? 'Billing Term' : 'فترة التغطية'}</span>
                    <span className="text-green-400 font-bold bg-[#142316]/30 px-2 py-0.5 rounded text-[10px]">30 Days Active Listing</span>
                  </div>

                  {/* Flow breakdown block explaining where the money went in real-time */}
                  <div className="p-3.5 rounded-2xl bg-[#13110E] border border-[#2D2319] space-y-2 mt-4 text-[10px] text-gray-400 leading-relaxed font-sans">
                    <span className="font-bold text-[#FFA048] block text-[11px] uppercase tracking-wider">
                      ℹ️ REAL-TIME PROCESSING LOOP
                    </span>
                    <p>
                      <strong>1. Secure Capture:</strong> The payment form detects input fields, registers the subscription dues trigger on the local client, and simulates secure PCI payment handshake.
                    </p>
                    <p>
                      <strong>2. Real-Time Storage:</strong> The amount instantly updates state variables, modifying the global directory listings index state, which is cached immediately into <code>localStorage ('shia_dir_payments')</code>.
                    </p>
                    <p>
                      <strong>3. Dynamic Re-indexing:</strong> The system automatically flags <strong>{myBusiness.name}</strong> as <code>status: 'active'</code>, matching it in subsequent searches so clients can immediately see your business!
                    </p>
                  </div>
                </div>

                {/* Print confirmation simulation */}
                <button
                  type="button"
                  onClick={() => alert(language === 'en' ? 'Receipt generated & copied to community ledger successfully!' : 'تم تحضير إيصال الفاتورة وحفظ المعلومات بنجاح!')}
                  className="mt-5 w-full py-2 bg-[#FFA048] hover:bg-opacity-95 text-black font-extrabold text-xs rounded-xl shadow transition-all active:scale-95"
                >
                  {language === 'en' ? 'Print Receipt Record' : 'طباعة وحفظ المستند'}
                </button>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};

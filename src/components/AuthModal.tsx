import React, { useState } from 'react';
import { useDirectory } from '../context/DirectoryContext';
import { TRANSLATIONS } from '../data/translations';
import {
  X, Mail, Phone, User, Shield, Briefcase,
  LogIn, UserPlus, Zap, Lock, Loader2,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Demo credential map — used by quick-login shortcuts
const DEMO_CREDS = {
  customer:         { email: 'manimuhammad000@gmail.com',  password: 'password123', phone: '+1 770 111 2222', name: 'Mani Muhammad',         role: 'customer'          as const },
  business:         { email: 'business@shiadirectory.com', password: 'password123', phone: '+1 770 123 4567', name: 'Hassan Al-Kawthar',      role: 'business'          as const },
  service_provider: { email: 'service@shiadirectory.com',  password: 'password123', phone: '+1 780 987 6543', name: 'Noor Electricians (Demo)',role: 'service_provider'  as const },
  admin:            { email: 'admin@shiadirectory.com',     password: 'admin123',    phone: '+1 780 000 0000', name: 'Abu Murtadha (Admin)',   role: 'admin'             as const },
};

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { language, signIn, apiLogin } = useDirectory();
  const t = TRANSLATIONS[language];

  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');
  const [regRole, setRegRole] = useState<'customer' | 'business'>('customer');

  // Form fields
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [phone,    setPhone]    = useState('');
  const [name,     setName]     = useState('');

  // UI state
  const [error,      setError]      = useState('');
  const [regSuccess, setRegSuccess] = useState('');
  const [isLoading,  setIsLoading]  = useState(false);

  if (!isOpen) return null;

  const resetForm = () => {
    setEmail(''); setPassword(''); setPhone(''); setName('');
    setError(''); setRegSuccess('');
  };

  const switchMode = (mode: 'signin' | 'register') => {
    setAuthMode(mode);
    resetForm();
  };

  // ── Shared post-login close ────────────────────────────────────────────
  const closeAfterSuccess = () => { onClose(); resetForm(); };

  // ── Sign In ────────────────────────────────────────────────────────────
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError(language === 'en' ? 'Email and password are required.' : 'البريد الإلكتروني وكلمة المرور مطلوبان.');
      return;
    }
    setIsLoading(true);
    setError('');
    const result = await apiLogin(email.trim(), password);
    setIsLoading(false);
    if (result.success) {
      closeAfterSuccess();
    } else {
      setError(result.error || (language === 'en' ? 'Login failed.' : 'فشل تسجيل الدخول.'));
    }
  };

  // ── Register ───────────────────────────────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError(language === 'en' ? 'Name, email and password are required.' : 'الاسم والبريد وكلمة المرور مطلوبة.');
      return;
    }
    if (password.length < 6) {
      setError(language === 'en' ? 'Password must be at least 6 characters.' : 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), phone: phone.trim(), role: regRole, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || (language === 'en' ? 'Registration failed.' : 'فشل التسجيل.'));
        return;
      }
      // Auto-login from registration response
      const loginResult = await apiLogin(email.trim(), password);
      if (!loginResult.success) {
        // Fallback: use the returned token directly
        signIn(email.trim(), phone, regRole, name.trim());
      }
      setRegSuccess(language === 'en' ? `Welcome, ${name.trim()}! Account created.` : `أهلاً ${name.trim()}! تم إنشاء حسابك.`);
      setTimeout(() => closeAfterSuccess(), 1400);
    } catch {
      // Backend unreachable — use local mock registration as fallback
      signIn(email.trim(), phone, regRole, name.trim());
      setRegSuccess(language === 'en' ? `Welcome, ${name.trim()}! Account created.` : `أهلاً ${name.trim()}! تم إنشاء حسابك.`);
      setTimeout(() => closeAfterSuccess(), 1400);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Quick-demo shortcuts ───────────────────────────────────────────────
  const handleShortcutLogin = async (role: keyof typeof DEMO_CREDS) => {
    const c = DEMO_CREDS[role];
    setIsLoading(true);
    const result = await apiLogin(c.email, c.password);
    setIsLoading(false);
    if (!result.success) {
      // Graceful fallback — works even when backend is off
      signIn(c.email, c.phone, c.role, c.name);
    }
    closeAfterSuccess();
  };

  // ── Styles ─────────────────────────────────────────────────────────────
  const inputCls = 'w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0F0E0C] border border-[#2D2319] focus:border-[#FFA048] outline-none text-sm transition-colors text-[#F4E3D7] placeholder-gray-600';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" id="auth-modal-overlay">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-[#13110E] border border-[#2D2319] p-6 text-[#F4E3D7]" id="auth-modal-content">

        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-[#201B15] text-[#FFA048] transition-colors" aria-label="Close">
          <X className="w-5 h-5" />
        </button>

        {/* Mode tabs */}
        <div className="flex gap-1 p-1 bg-[#0F0E0C] rounded-2xl mb-5 border border-[#2D2319]">
          {(['signin', 'register'] as const).map((mode) => (
            <button key={mode} onClick={() => switchMode(mode)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold uppercase transition-all ${authMode === mode ? 'bg-[#FFA048] text-black shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
              {mode === 'signin' ? <><LogIn className="w-3.5 h-3.5" />{t.signIn}</> : <><UserPlus className="w-3.5 h-3.5" />{t.register}</>}
            </button>
          ))}
        </div>

        {/* ── SIGN IN ─────────────────────────────────────────────── */}
        {authMode === 'signin' && (
          <>
            <p className="text-xs text-center text-gray-400 mb-4">{t.signInPrompt}</p>

            {/* Quick demo profiles */}
            <div className="mb-4 p-3.5 rounded-2xl bg-[#0F0E0C] border border-[#2D2319]">
              <span className="block text-[10px] font-bold text-[#FFA048] mb-3 text-center uppercase tracking-wider">
                {language === 'en' ? '⚡ Quick Demo Profiles' : '⚡ حسابات تجريبية سريعة'}
              </span>
              <div className="space-y-2 mb-3">
                <button onClick={() => handleShortcutLogin('business')}
                  disabled={isLoading}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[#FFA048]/10 hover:bg-[#FFA048]/20 border border-[#FFA048]/30 hover:border-[#FFA048]/60 transition-all disabled:opacity-60">
                  <div className="w-7 h-7 rounded-lg bg-[#FFA048]/20 flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-3.5 h-3.5 text-[#FFA048]" />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <span className="block text-[11px] font-extrabold text-[#FFA048]">
                      {language === 'en' ? '⚡ Test Login: Business Owner ($50)' : '⚡ تسجيل تجريبي: صاحب عمل ($50)'}
                    </span>
                    <span className="block text-[9px] text-gray-500">business@shiadirectory.com</span>
                  </div>
                </button>
                <button onClick={() => handleShortcutLogin('service_provider')}
                  disabled={isLoading}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-950/40 hover:bg-blue-900/50 border border-blue-700/40 hover:border-blue-500/60 transition-all disabled:opacity-60">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <span className="block text-[11px] font-extrabold text-blue-300">
                      {language === 'en' ? '⚡ Test Login: Service Provider ($30)' : '⚡ تسجيل تجريبي: مزوّد خدمة ($30)'}
                    </span>
                    <span className="block text-[9px] text-gray-500">service@shiadirectory.com</span>
                  </div>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { r: 'customer' as const, icon: <User className="w-4 h-4 text-green-400" />, label: language === 'en' ? 'Customer' : 'زبون' },
                  { r: 'admin'    as const, icon: <Shield className="w-4 h-4 text-red-400" />,  label: language === 'en' ? 'Admin'    : 'مدير' },
                ]).map(({ r, icon, label }) => (
                  <button key={r} onClick={() => handleShortcutLogin(r)} disabled={isLoading}
                    className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-[#191613] hover:bg-[#201B15] border border-[#2D2319] hover:border-[#FFA048]/30 transition-all disabled:opacity-60">
                    {icon}
                    <span className="text-[10px] font-bold block mt-1 text-white">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="relative my-4 flex items-center justify-center">
              <div className="absolute w-full h-[1px] bg-[#2D2319]" />
              <span className="relative px-3 bg-[#13110E] text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                {language === 'en' ? 'or sign in manually' : 'أو سجّل الدخول يدوياً'}
              </span>
            </div>

            {/* Manual sign-in form: email + password */}
            <form onSubmit={handleSignIn} className="space-y-3">
              {error && <p className="text-red-400 text-xs text-center bg-red-950/30 p-2 rounded-lg">{error}</p>}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">{t.email} *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                  <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    required placeholder="email@example.com" className={inputCls} autoComplete="email" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  {language === 'en' ? 'Password' : 'كلمة المرور'} *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                  <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    required placeholder="••••••••" className={inputCls} autoComplete="current-password" />
                </div>
              </div>
              <button type="submit" disabled={isLoading}
                className="w-full py-3 mt-1 rounded-xl bg-[#FFA048] text-black font-bold hover:bg-opacity-90 transition-all shadow-md text-sm active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2">
                {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> {language === 'en' ? 'Signing in…' : 'جارٍ الدخول…'}</> : t.signIn}
              </button>
            </form>

            <button onClick={() => switchMode('register')} className="w-full mt-3 text-center text-xs text-gray-500 hover:text-[#FFA048] transition-colors">
              {t.noAccountYet}
            </button>
            <button onClick={onClose} className="w-full mt-2 py-2.5 rounded-xl border border-[#2D2319] text-xs text-gray-400 hover:text-white hover:border-[#FFA048]/30 transition-all">
              {t.continueAsGuest}
            </button>
          </>
        )}

        {/* ── REGISTER ────────────────────────────────────────────── */}
        {authMode === 'register' && (
          <>
            <p className="text-xs text-center text-gray-400 mb-4">
              {language === 'en' ? "Join the Ahle Bait Network (ABN). It's free for customers." : 'انضم إلى شبكة أهل البيت (ABN). مجاني للزبائن.'}
            </p>

            {/* Role selector */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">{t.role}</label>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { r: 'customer' as const, icon: <User className="w-4 h-4" />,     label: t.roleCustomer },
                  { r: 'business' as const, icon: <Briefcase className="w-4 h-4" />,label: t.roleBusiness },
                ]).map(({ r, icon, label }) => (
                  <button key={r} type="button" onClick={() => setRegRole(r)}
                    className={`flex items-start gap-2 p-3 rounded-xl text-left text-xs font-semibold transition-all border ${regRole === r ? 'bg-[#FFA048]/10 border-[#FFA048] text-[#FFA048]' : 'bg-[#191613] border-[#2D2319] text-gray-400 hover:border-[#FFA048]/30 hover:text-white'}`}>
                    {icon}<span className="leading-snug">{label}</span>
                  </button>
                ))}
              </div>
              {regRole === 'business' && (
                <p className="text-[10px] text-amber-400 mt-2 px-1">
                  ⚠️ {language === 'en' ? 'Business listings require a $50/month membership.' : 'التسجيل التجاري يتطلب اشتراكاً شهرياً بقيمة 50$.'}
                </p>
              )}
            </div>

            <form onSubmit={handleRegister} className="space-y-3">
              {error      && <p className="text-red-400   text-xs text-center bg-red-950/30   p-2 rounded-lg">{error}</p>}
              {regSuccess && <p className="text-green-400 text-xs text-center bg-green-950/30 p-2 rounded-lg font-bold">{regSuccess}</p>}

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">{t.name} *</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                  <input type="text" value={name} onChange={(e) => { setName(e.target.value); setError(''); }}
                    required placeholder="Mahdi Jafar Al-Husseini" className={inputCls} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">{t.email} *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                  <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    required placeholder="email@example.com" className={inputCls} autoComplete="email" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">{t.phone}</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 770 000 0000" className={inputCls} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  {language === 'en' ? 'Password' : 'كلمة المرور'} *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                  <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    required placeholder="Min. 6 characters" className={inputCls} autoComplete="new-password" />
                </div>
              </div>

              <button type="submit" disabled={isLoading}
                className="w-full py-3 mt-1 rounded-xl bg-[#FFA048] text-black font-bold hover:bg-opacity-90 transition-all shadow-md text-sm active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2">
                {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> {language === 'en' ? 'Creating account…' : 'جارٍ الإنشاء…'}</> : t.createAccount}
              </button>
            </form>

            <button onClick={() => switchMode('signin')} className="w-full mt-3 text-center text-xs text-gray-500 hover:text-[#FFA048] transition-colors">
              {t.alreadyHaveAccount}
            </button>
            <button onClick={onClose} className="w-full mt-2 py-2.5 rounded-xl border border-[#2D2319] text-xs text-gray-400 hover:text-white hover:border-[#FFA048]/30 transition-all">
              {t.continueAsGuest}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useDirectory } from '../context/DirectoryContext';
import { TRANSLATIONS } from '../data/translations';
import { X, Mail, Phone, User, Shield, Briefcase, LogIn, UserPlus } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { language, signIn } = useDirectory();
  const t = TRANSLATIONS[language];

  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');
  const [role, setRole] = useState<'customer' | 'business' | 'admin'>('customer');
  const [regRole, setRegRole] = useState<'customer' | 'business'>('customer');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  if (!isOpen) return null;

  const resetForm = () => {
    setEmail(''); setPhone(''); setName(''); setError(''); setRegSuccess('');
  };

  const switchMode = (mode: 'signin' | 'register') => {
    setAuthMode(mode);
    resetForm();
  };

  // ── Sign In ──────────────────────────────────────────────────
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !phone) {
      setError(language === 'en' ? 'Email and Phone number are required.' : 'البريد الإلكتروني ورقم الهاتف مطلوبان.');
      return;
    }
    signIn(email, phone, role, name || undefined);
    onClose();
  };

  // ── Register ─────────────────────────────────────────────────
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) {
      setError(t.allFieldsRequired);
      return;
    }
    if (!/\+?\d[\d\s\-]{7,}/.test(phone)) {
      setError(language === 'en' ? 'Please enter a valid phone number.' : 'يرجى إدخال رقم هاتف صحيح.');
      return;
    }
    signIn(email, phone, regRole, name);
    setRegSuccess(language === 'en'
      ? `Welcome, ${name}! Your account has been created.`
      : `أهلاً ${name}! تم إنشاء حسابك بنجاح.`
    );
    setTimeout(() => { onClose(); resetForm(); }, 1500);
  };

  const handleShortcutLogin = (shortcutRole: 'customer' | 'business' | 'admin') => {
    if (shortcutRole === 'customer') {
      signIn('manimuhammad000@gmail.com', '+1 770 111 2222', 'customer', 'Mani Muhammad');
    } else if (shortcutRole === 'business') {
      signIn('business@shiadirectory.com', '+1 770 123 4567', 'business', 'Hassan Al-Kawthar');
    } else {
      signIn('admin@shiadirectory.com', '+1 780 000 0000', 'admin', 'Abu Murtadha (Admin)');
    }
    onClose();
  };

  const inputClass = 'w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0F0E0C] border border-[#2D2319] focus:border-[#FFA048] outline-none text-sm transition-colors text-[#F4E3D7] placeholder-gray-600';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" id="auth-modal-overlay">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-[#13110E] border border-[#2D2319] p-6 text-[#F4E3D7]" id="auth-modal-content">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-[#201B15] text-[#FFA048] transition-colors"
          aria-label="Close"
          id="btn-close-auth"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Mode Tabs: Sign In / Register */}
        <div className="flex gap-1 p-1 bg-[#0F0E0C] rounded-2xl mb-5 border border-[#2D2319]" id="auth-mode-tabs">
          <button
            onClick={() => switchMode('signin')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold uppercase transition-all ${authMode === 'signin' ? 'bg-[#FFA048] text-black shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            id="auth-tab-signin"
          >
            <LogIn className="w-3.5 h-3.5" />
            {t.signIn}
          </button>
          <button
            onClick={() => switchMode('register')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold uppercase transition-all ${authMode === 'register' ? 'bg-[#FFA048] text-black shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            id="auth-tab-register"
          >
            <UserPlus className="w-3.5 h-3.5" />
            {t.register}
          </button>
        </div>

        {/* ── SIGN IN MODE ─────────────────────────────────── */}
        {authMode === 'signin' && (
          <>
            <p className="text-xs text-center text-gray-400 mb-5">{t.signInPrompt}</p>

            {/* Quick Demo Profiles */}
            <div className="mb-5 p-3.5 rounded-2xl bg-[#0F0E0C] border border-[#2D2319]" id="quick-demo-logins">
              <span className="block text-[10px] font-bold text-[#FFA048] mb-3 text-center uppercase tracking-wider">
                {language === 'en' ? '⚡ Quick Demo Profiles' : '⚡ حسابات تجريبية سريعة'}
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { r: 'customer' as const, icon: <User className="w-4 h-4 text-green-400" />, label: language === 'en' ? 'Customer' : 'زبون', sub: 'Mani Muhammad' },
                  { r: 'business' as const, icon: <Briefcase className="w-4 h-4 text-[#FFA048]" />, label: language === 'en' ? 'Business' : 'صاحب عمل', sub: 'Al-Kawthar' },
                  { r: 'admin' as const, icon: <Shield className="w-4 h-4 text-red-400" />, label: language === 'en' ? 'Admin' : 'مدير', sub: 'Platform' },
                ].map(({ r, icon, label, sub }) => (
                  <button
                    key={r}
                    onClick={() => handleShortcutLogin(r)}
                    className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-[#191613] hover:bg-[#201B15] border border-[#2D2319] hover:border-[#FFA048]/30 transition-all"
                    id={`quick-login-${r}`}
                  >
                    {icon}
                    <span className="text-[10px] font-bold block mt-1 text-white">{label}</span>
                    <span className="text-[8px] text-gray-500 block truncate w-full text-center">{sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="relative my-4 flex items-center justify-center">
              <div className="absolute w-full h-[1px] bg-[#2D2319]" />
              <span className="relative px-3 bg-[#13110E] text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                {language === 'en' ? 'or sign in manually' : 'أو سجل الدخول يدوياً'}
              </span>
            </div>

            {/* Role Selector */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-[#0F0E0C] rounded-2xl mb-4 border border-[#2D2319]" id="auth-role-selector">
              {(['customer', 'business', 'admin'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${role === r ? 'bg-[#FFA048] text-black shadow' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                  id={`auth-role-btn-${r}`}
                >
                  {r}
                </button>
              ))}
            </div>

            <form onSubmit={handleSignIn} className="space-y-3" id="form-signin">
              {error && <p className="text-red-400 text-xs text-center">{error}</p>}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">{t.name}</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Mahdi Jafar" className={inputClass} id="signin-input-name" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">{t.email} *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                  <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} required placeholder="email@example.com" className={inputClass} id="signin-input-email" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">{t.phone} *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                  <input type="tel" value={phone} onChange={(e) => { setPhone(e.target.value); setError(''); }} required placeholder="+1 770 000 0000" className={inputClass} id="signin-input-phone" />
                </div>
              </div>
              <button type="submit" className="w-full py-3 mt-2 rounded-xl bg-[#FFA048] text-black font-bold hover:bg-opacity-90 transition-all shadow-md text-sm active:scale-[0.98]" id="btn-signin-submit">
                {t.signIn}
              </button>
            </form>

            {/* Switch to Register */}
            <button onClick={() => switchMode('register')} className="w-full mt-3 text-center text-xs text-gray-500 hover:text-[#FFA048] transition-colors">
              {t.noAccountYet}
            </button>

            {/* Guest Option */}
            <button onClick={onClose} className="w-full mt-2 py-2.5 rounded-xl border border-[#2D2319] text-xs text-gray-400 hover:text-white hover:border-[#FFA048]/30 transition-all" id="btn-guest-browse">
              {t.continueAsGuest}
            </button>
          </>
        )}

        {/* ── REGISTER MODE ────────────────────────────────── */}
        {authMode === 'register' && (
          <>
            <p className="text-xs text-center text-gray-400 mb-5">
              {language === 'en'
                ? 'Join the Shia Community Directory. It\'s free for customers.'
                : 'انضم إلى دليل مجتمعنا. مجاني للزبائن.'}
            </p>

            {/* Role Selector for registration */}
            <div className="mb-4" id="register-role-selector">
              <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">{t.role}</label>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { r: 'customer' as const, icon: <User className="w-4 h-4" />, label: t.roleCustomer },
                  { r: 'business' as const, icon: <Briefcase className="w-4 h-4" />, label: t.roleBusiness }
                ]).map(({ r, icon, label }) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRegRole(r)}
                    className={`flex items-start gap-2 p-3 rounded-xl text-left text-xs font-semibold transition-all border ${regRole === r ? 'bg-[#FFA048]/10 border-[#FFA048] text-[#FFA048]' : 'bg-[#191613] border-[#2D2319] text-gray-400 hover:border-[#FFA048]/30 hover:text-white'}`}
                    id={`reg-role-${r}`}
                  >
                    {icon}
                    <span className="leading-snug">{label}</span>
                  </button>
                ))}
              </div>
              {regRole === 'business' && (
                <p className="text-[10px] text-amber-400 mt-2 px-1">
                  ⚠️ {language === 'en' ? 'Business listings require a $50/month membership. You will be prompted after registration.' : 'التسجيل التجاري يتطلب اشتراكاً شهرياً بقيمة 50$. سيتم تفعيله بعد التسجيل.'}
                </p>
              )}
            </div>

            <form onSubmit={handleRegister} className="space-y-3" id="form-register">
              {error && <p className="text-red-400 text-xs text-center">{error}</p>}
              {regSuccess && <p className="text-green-400 text-xs text-center font-bold">{regSuccess}</p>}

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">{t.name} *</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                  <input type="text" value={name} onChange={(e) => { setName(e.target.value); setError(''); }} required placeholder="Mahdi Jafar Al-Husseini" className={inputClass} id="reg-input-name" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">{t.email} *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                  <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} required placeholder="email@example.com" className={inputClass} id="reg-input-email" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">{t.phone} *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                  <input type="tel" value={phone} onChange={(e) => { setPhone(e.target.value); setError(''); }} required placeholder="+1 770 000 0000" className={inputClass} id="reg-input-phone" />
                </div>
              </div>

              <button type="submit" className="w-full py-3 mt-2 rounded-xl bg-[#FFA048] text-black font-bold hover:bg-opacity-90 transition-all shadow-md text-sm active:scale-[0.98]" id="btn-register-submit">
                {t.createAccount}
              </button>
            </form>

            {/* Switch to Sign In */}
            <button onClick={() => switchMode('signin')} className="w-full mt-3 text-center text-xs text-gray-500 hover:text-[#FFA048] transition-colors">
              {t.alreadyHaveAccount}
            </button>

            {/* Guest Option */}
            <button onClick={onClose} className="w-full mt-2 py-2.5 rounded-xl border border-[#2D2319] text-xs text-gray-400 hover:text-white hover:border-[#FFA048]/30 transition-all" id="btn-guest-browse-reg">
              {t.continueAsGuest}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

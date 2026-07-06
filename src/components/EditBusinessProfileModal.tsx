import React, { useState, useRef } from 'react';
import { useDirectory } from '../context/DirectoryContext';
import { TRANSLATIONS } from '../data/translations';
import { Business } from '../types';
import { ArrowRight, Camera, ImageIcon } from 'lucide-react';

interface EditBusinessProfileModalProps {
  business: Business;
  onClose: () => void;
}

export const EditBusinessProfileModal: React.FC<EditBusinessProfileModalProps> = ({ business, onClose }) => {
  const { language, categories, updateBusiness } = useDirectory();
  const t = TRANSLATIONS[language];

  const [name, setName] = useState(business.name);
  const [categoryId, setCategoryId] = useState(business.categoryId);
  const [subcatEn, setSubcatEn] = useState(business.subcategory.en || '');
  const [descEn, setDescEn] = useState(business.description.en || '');
  const [address, setAddress] = useState(business.address || '');
  const [area, setArea] = useState(business.area || '');
  const [city, setCity] = useState(business.city || 'Baghdad');
  const [phone, setPhone] = useState(business.phone || '');
  const [whatsapp, setWhatsapp] = useState(business.whatsapp || '');
  const [hoursEn, setHoursEn] = useState(business.workingHours.en || '');
  const [logoUrl, setLogoUrl] = useState(business.logoUrl || '');
  const [coverUrl, setCoverUrl] = useState(business.coverUrl || '');
  const [imagePreview, setImagePreview] = useState(business.logoUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      setLogoUrl(base64);
    };
    reader.readAsDataURL(file);
  };

  const [success, setSuccess] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedBiz: Business = {
      ...business,
      name,
      categoryId,
      subcategory: {
        en: subcatEn,
        ar: subcatEn,
        fa: business.subcategory.fa || subcatEn
      },
      description: {
        en: descEn,
        ar: descEn,
        fa: business.description.fa || descEn
      },
      address,
      area,
      city: city as any,
      phone,
      whatsapp,
      workingHours: {
        en: hoursEn,
        ar: hoursEn,
        fa: business.workingHours.fa || hoursEn
      },
      logoUrl,
      coverUrl
    };

    updateBusiness(updatedBiz);
    setSuccess(language === 'en' ? 'Profile updated successfully!' : 'تم تحديث البيانات بنجاح!');
    
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="space-y-4 animate-fade-in" id="portal-edit-form-section">
      <div className="flex items-center justify-between pb-2 border-b border-[#2D2319]/60">
        <div className="flex items-center gap-3">
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full bg-[#191613] hover:bg-[#2D251C] transition-colors border border-[#2D2319]"
          >
            <ArrowRight className="w-4 h-4 text-gray-400 rotate-180" />
          </button>
          <div>
            <h2 className="text-xl font-extrabold text-[#F4E3D7]">
              {language === 'en' ? 'Edit Business Profile' : 'تعديل بيانات العمل'}
            </h2>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 p-5 rounded-3xl bg-[#13110E] border border-[#2D2319]" id="biz-edit-form">
        {success && <p className="p-3 bg-green-950/45 border border-green-900 text-green-300 text-xs rounded-xl">{success}</p>}

        {/* ── Image Picker ── */}
        <div>
          <label className="block text-xs text-gray-400 mb-2">
            {language === 'en' ? 'Business / Service Logo Image' : 'صورة الشعار'}
          </label>
          <div className="flex items-start gap-3">
            <div className="w-20 h-20 rounded-xl bg-[#0F0E0C] border border-[#2D2319] overflow-hidden flex-shrink-0 flex items-center justify-center">
              {(imagePreview || logoUrl) ? (
                <img src={imagePreview || logoUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="w-7 h-7 text-gray-600" />
              )}
            </div>
            <div className="flex-1 space-y-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
                id="edit-file-input-logo"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2 rounded-xl bg-[#191613] border border-[#2D2319] text-xs text-gray-300 hover:text-white hover:border-[#FFA048]/40 transition-all flex items-center justify-center gap-2"
              >
                <Camera className="w-3.5 h-3.5 text-[#FFA048]" />
                {language === 'en' ? '📸 Change Photo' : '📸 تغيير الصورة'}
              </button>
              <input
                type="url"
                value={logoUrl}
                onChange={(e) => { setLogoUrl(e.target.value); setImagePreview(e.target.value); }}
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
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-[#0F0E0C] border border-[#2D2319] text-xs text-white outline-none focus:border-[#FFA048]"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">{t.selectCategory}*</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
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
            value={subcatEn}
            onChange={(e) => setSubcatEn(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-[#0F0E0C] border border-[#2D2319] text-xs text-white outline-none focus:border-[#FFA048]/40 transition-colors"
            required
          />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">{t.description}*</label>
          <textarea
            value={descEn}
            rows={3}
            onChange={(e) => setDescEn(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-[#0F0E0C] border border-[#2D2319] text-xs text-white outline-none focus:border-[#FFA048]/40 transition-colors resize-none"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">{t.address}*</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-[#0F0E0C] border border-[#2D2319] text-xs text-white outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">{t.area}*</label>
            <input
              type="text"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-[#0F0E0C] border border-[#2D2319] text-xs text-white outline-none"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">{t.city}*</label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value as any)}
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
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-[#0F0E0C] border border-[#2D2319] text-xs text-white outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">{t.whatsapp}</label>
            <input
              type="text"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-[#0F0E0C] border border-[#2D2319] text-xs text-white outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">{t.workingHours}*</label>
          <input
            type="text"
            value={hoursEn}
            onChange={(e) => setHoursEn(e.target.value)}
            placeholder="e.g. 9:00 AM – 9:00 PM"
            className="w-full p-2.5 rounded-xl bg-[#0F0E0C] border border-[#2D2319] text-xs text-white outline-none focus:border-[#FFA048]/40 transition-colors"
            required
          />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">{t.coverUrl}</label>
          <input
            type="text"
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-[#0F0E0C] border border-[#2D2319] text-xs text-white outline-none"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-[#FFA048] hover:bg-opacity-95 text-black font-extrabold rounded-xl text-xs transition-all shadow-md mt-4"
        >
          {language === 'en' ? 'Save Changes' : 'حفظ التعديلات'}
        </button>
      </form>
    </div>
  );
};

import { useState } from 'react';
import { api } from '../api';

export default function SmartFormModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1);
  const [need, setNeed] = useState(''); // RENT, BUY, CONSIGN
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [form, setForm] = useState({
    name: '',
    phone: '',
    message: '',
    videoUrl: '',
    image: null,
    imageName: '',
    mimeType: ''
  });

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Kích thước file không được vượt quá 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, image: reader.result, imageName: file.name, mimeType: file.type });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const typeText = need === 'RENT' ? 'Cần Thuê' : need === 'BUY' ? 'Cần Mua' : 'Ký Gửi';
      await api('submitInquiry', {
        customerName: form.name,
        customerPhone: form.phone,
        note: `[${typeText}] ${form.message}${form.videoUrl ? `\n[Video]: ${form.videoUrl}` : ''}`,
        propertyId: 'SMART_FORM',
        image: form.image,
        imageName: form.imageName,
        mimeType: form.mimeType
      });
      setSuccess(true);
    } catch (err) {
      alert('Có lỗi xảy ra: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setNeed('');
    setForm({ name: '', phone: '', message: '', videoUrl: '', image: null, imageName: '', mimeType: '' });
    setSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl relative">
        
        {/* Close Button */}
        <button onClick={handleClose} className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-red-500 font-bold transition-colors z-10">
          ✕
        </button>

        {success ? (
          <div className="p-10 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-4xl mb-4 animate-bounce">
              ✓
            </div>
            <h3 className="text-2xl font-extrabold text-slate-800 mb-2">Thành công!</h3>
            <p className="text-slate-500 font-medium mb-8">Chúng tôi đã tiếp nhận yêu cầu của bạn. Đội ngũ chuyên viên sẽ liên hệ lại trong thời gian sớm nhất.</p>
            <button onClick={handleClose} className="px-8 py-3 bg-teal-500 text-white font-bold rounded-xl hover:bg-teal-600 transition-colors shadow-lg shadow-teal-500/30 w-full">
              Hoàn tất
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-8 pt-8 pb-6 bg-gradient-to-br from-teal-500 to-teal-400 text-white relative">
              <h2 className="text-2xl font-extrabold mb-1 relative z-10">Cổng Tư Vấn Thông Minh</h2>
              <p className="text-teal-50 font-medium opacity-90 text-sm relative z-10">Hệ thống môi giới Bất Động Sản hàng đầu Đà Nẵng</p>
              <div className="absolute right-0 top-0 text-9xl opacity-10">🏢</div>
            </div>

            {/* Progress Bar */}
            <div className="flex h-1 bg-slate-100">
              <div className={`h-full bg-teal-500 transition-all duration-300 ${step === 1 ? 'w-1/2' : 'w-full'}`}></div>
            </div>

            <div className="p-8">
              {step === 1 && (
                <div className="animate-fade-in">
                  <h3 className="text-lg font-bold text-slate-800 mb-6 text-center">Bạn đang quan tâm đến dịch vụ nào?</h3>
                  
                  <div className="flex flex-col gap-4">
                    <button 
                      onClick={() => { setNeed('BUY'); setStep(2); }}
                      className="flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-100 hover:border-teal-500 hover:bg-teal-50 transition-all group text-left"
                    >
                      <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🏡</div>
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-lg">Tôi muốn Mua</h4>
                        <p className="text-slate-500 text-sm font-medium">Tìm mua mặt bằng, đất nền, nhà kho...</p>
                      </div>
                    </button>

                    <button 
                      onClick={() => { setNeed('RENT'); setStep(2); }}
                      className="flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-100 hover:border-teal-500 hover:bg-teal-50 transition-all group text-left"
                    >
                      <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🔑</div>
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-lg">Tôi muốn Thuê</h4>
                        <p className="text-slate-500 text-sm font-medium">Tìm thuê mặt bằng kinh doanh, kho bãi...</p>
                      </div>
                    </button>

                    <button 
                      onClick={() => { setNeed('CONSIGN'); setStep(2); }}
                      className="flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-100 hover:border-teal-500 hover:bg-teal-50 transition-all group text-left"
                    >
                      <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🤝</div>
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-lg">Tôi muốn Ký Gửi</h4>
                        <p className="text-slate-500 text-sm font-medium">Giao bán/Cho thuê Bất Động Sản của bạn</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <form onSubmit={handleSubmit} className="animate-fade-in space-y-5">
                  <div className="flex items-center gap-3 mb-6">
                    <button type="button" onClick={() => setStep(1)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors font-bold">←</button>
                    <h3 className="text-lg font-bold text-slate-800">
                      {need === 'BUY' ? 'Thông tin nhu cầu Mua' : need === 'RENT' ? 'Thông tin nhu cầu Thuê' : 'Thông tin BĐS Ký Gửi'}
                    </h3>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Họ và Tên *</label>
                    <input type="text" required value={form.name} onChange={e=>setForm({...form, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 font-medium text-slate-800 transition-all" placeholder="Nhập tên của bạn" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Số Điện Thoại (Zalo) *</label>
                    <input type="tel" required value={form.phone} onChange={e=>setForm({...form, phone: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 font-medium text-slate-800 transition-all" placeholder="0987.xxx.xxx" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Mô tả chi tiết *</label>
                    <textarea required value={form.message} onChange={e=>setForm({...form, message: e.target.value})} rows="4" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 font-medium text-slate-800 transition-all" placeholder={need === 'CONSIGN' ? 'Mô tả vị trí, diện tích, giá mong muốn...' : 'Mô tả nhu cầu, khu vực, tầm tài chính của bạn...'}></textarea>
                  </div>
                  {need === 'CONSIGN' && (
                    <>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Link Video (Youtube/Tiktok - Tùy chọn)</label>
                        <input type="text" value={form.videoUrl} onChange={e=>setForm({...form, videoUrl: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 font-medium text-slate-800 transition-all" placeholder="Dán link video mặt bằng của bạn..." />
                      </div>
                      <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Tải ảnh mặt bằng (Tùy chọn)</label>
                      <input type="file" accept="image/*" onChange={handleFileChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 font-medium text-slate-800 transition-all text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100" />
                      {form.image && <p className="text-xs text-teal-600 mt-2 font-medium">Đã chọn ảnh: {form.imageName}</p>}
                    </div>
                    </>
                  )}

                  <button type="submit" disabled={loading} className="w-full mt-4 flex justify-center py-3.5 px-4 rounded-xl shadow-lg shadow-teal-500/30 text-base font-bold text-white bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-600 hover:to-teal-500 focus:outline-none hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50">
                    {loading ? 'Đang gửi...' : 'Gửi Yêu Cầu Chuyên Viên'}
                  </button>
                </form>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

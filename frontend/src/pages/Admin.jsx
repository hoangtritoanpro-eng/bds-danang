import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, fmtCurrency, getImgUrl } from '../api';

export default function Admin() {
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [user, setUser] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Dashboard Data
  const [properties, setProperties] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  
  // Tabs: dashboard, properties, inquiries
  const [activeTab, setActiveTab] = useState('dashboard');

  // Add/Edit Property Form
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    Type: 'RENT', DistrictID: '', Street: '', Price: '', Area: '', 
    Images: '', Amenities: '', Description: '', ContactPhone: '', Status: 'AVAILABLE', Video: ''
  });
  const [postTemplate, setPostTemplate] = useState('');
  const [postTemplateImages, setPostTemplateImages] = useState('');

  // Add/Edit District Form
  const [showAddDist, setShowAddDist] = useState(false);
  const [editingDistId, setEditingDistId] = useState(null);
  const [formDist, setFormDist] = useState({ Name: '', CoverImage: '' });

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    api('login', { pin }, email)
      .then(data => {
        setUser(data);
        setError('');
        fetchAdminData(data.email);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  const fetchAdminData = (userEmail = user?.email) => {
    if (!userEmail) return;
    api('getAdminData', {}, userEmail)
      .then(data => {
        setDistricts(data.districts || []);
        setProperties(data.properties || []);
        setInquiries(data.inquiries || []);
      })
      .catch(err => console.error(err));
  };

  const handleImagePaste = async (e) => {
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    for (const item of items) {
      if (item.type.indexOf('image') === 0) {
        e.preventDefault();
        const file = item.getAsFile();
        uploadFileToDrive(file, (url) => {
          const currentImages = form.Images ? form.Images.trim() : '';
          const newImages = currentImages ? currentImages + ', ' + url : url;
          setForm({ ...form, Images: newImages });
        });
        break;
      }
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      uploadFileToDrive(file, (url) => {
        const currentImages = form.Images ? form.Images.trim() : '';
        const newImages = currentImages ? currentImages + ', ' + url : url;
        setForm({ ...form, Images: newImages });
      });
    }
  };

  const handleDistImagePaste = async (e) => {
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    for (const item of items) {
      if (item.type.indexOf('image') === 0) {
        e.preventDefault();
        const file = item.getAsFile();
        uploadFileToDrive(file, (url) => {
          setFormDist({ ...formDist, CoverImage: url });
        });
        break;
      }
    }
  };

  const handleDistImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      uploadFileToDrive(file, (url) => {
        setFormDist({ ...formDist, CoverImage: url });
      });
    }
  };

  const uploadFileToDrive = (file, onSuccess) => {
    if (file.size > 5 * 1024 * 1024) {
      alert("Kích thước file không được vượt quá 5MB");
      return;
    }
    setLoading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      api('uploadImage', { image: reader.result, mimeType: file.type }, user.email)
        .then(res => onSuccess(res.url))
        .catch(err => alert("Lỗi tải ảnh lên: " + err.message))
        .finally(() => setLoading(false));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProperty = (e) => {
    e.preventDefault();
    setLoading(true);
    
    const payload = {
      type: form.Type,
      districtId: form.DistrictID,
      street: form.Street,
      price: form.Price,
      area: form.Area,
      images: form.Images,
      amenities: form.Amenities,
      description: form.Description,
      contactPhone: form.ContactPhone,
      status: form.Status,
      video: form.Video
    };

    if (editingId) {
      payload.propertyId = editingId;
      api('editProperty', payload, user.email)
        .then(() => {
          setShowAdd(false);
          setEditingId(null);
          fetchAdminData();
          setForm({ Type: 'RENT', DistrictID: '', Street: '', Price: '', Area: '', Images: '', Amenities: '', Description: '', ContactPhone: '', Status: 'AVAILABLE', Video: '' });
        })
        .catch(err => alert("Lỗi: " + err.message))
        .finally(() => setLoading(false));
    } else {
      api('addProperty', payload, user.email)
        .then(() => {
          setShowAdd(false);
          fetchAdminData();
          setForm({ Type: 'RENT', DistrictID: '', Street: '', Price: '', Area: '', Images: '', Amenities: '', Description: '', ContactPhone: '', Status: 'AVAILABLE', Video: '' });
        })
        .catch(err => alert("Lỗi: " + err.message))
        .finally(() => setLoading(false));
    }
  };

  const handleEditProperty = (p) => {
    setForm({
      Type: p.Type || 'RENT', DistrictID: p.DistrictID || '', Street: p.Street || '', Price: p.Price || '', Area: p.Area || '',
      Images: p.Images || '', Amenities: p.Amenities || '', Description: p.Description || '', ContactPhone: p.ContactPhone || '', Status: p.Status || 'AVAILABLE', Video: p.Video || ''
    });
    setEditingId(p.PropertyID);
    setShowAdd(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteProperty = (propertyId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa mặt bằng này không?")) return;
    api('deleteProperty', { propertyId }, user.email)
      .then(() => fetchAdminData())
      .catch(err => alert("Lỗi xóa: " + err.message));
  };

  const handleTogglePropertyStatus = (p) => {
    const newStatus = p.Status === 'AVAILABLE' ? 'SOLD' : 'AVAILABLE';
    api('editProperty', { propertyId: p.PropertyID, status: newStatus }, user.email)
      .then(() => fetchAdminData())
      .catch(err => alert("Lỗi cập nhật: " + err.message));
  };

  const handleUpdateInquiryStatus = (inquiryId, status) => {
    api('updateInquiryStatus', { inquiryId, status }, user.email)
      .then(() => fetchAdminData())
      .catch(err => alert("Lỗi cập nhật trạng thái: " + err.message));
  };

  const handleDeleteInquiry = (inquiryId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa yêu cầu liên hệ này không?")) return;
    api('deleteInquiry', { inquiryId }, user.email)
      .then(() => fetchAdminData())
      .catch(err => alert("Lỗi xóa: " + err.message));
  };

  const handleSaveDistrict = (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = { name: formDist.Name, coverImage: formDist.CoverImage };
    if (editingDistId) {
      payload.districtId = editingDistId;
      api('editDistrict', payload, user.email)
        .then(() => { setShowAddDist(false); setEditingDistId(null); fetchAdminData(); setFormDist({ Name: '', CoverImage: '' }); })
        .catch(err => alert("Lỗi: " + err.message))
        .finally(() => setLoading(false));
    } else {
      api('addDistrict', payload, user.email)
        .then(() => { setShowAddDist(false); fetchAdminData(); setFormDist({ Name: '', CoverImage: '' }); })
        .catch(err => alert("Lỗi: " + err.message))
        .finally(() => setLoading(false));
    }
  };

  const handleEditDistrict = (d) => {
    setFormDist({ Name: d.Name || '', CoverImage: d.CoverImage || '' });
    setEditingDistId(d.DistrictID);
    setShowAddDist(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteDistrict = (districtId) => {
    if (properties.some(p => p.DistrictID === districtId)) {
      alert("Không thể xóa quận này vì đang có mặt bằng thuộc quận này!");
      return;
    }
    if (!window.confirm("Bạn có chắc chắn muốn xóa quận này không?")) return;
    api('deleteDistrict', { districtId }, user.email)
      .then(() => fetchAdminData())
      .catch(err => alert("Lỗi xóa: " + err.message));
  };

  const handleGeneratePost = () => {
    const distName = districts.find(d => d.DistrictID === form.DistrictID)?.Name || '[Chưa chọn quận]';
    const typeText = form.Type === 'RENT' ? 'CHO THUÊ' : 'BÁN';
    const priceText = fmtCurrency(form.Price);
    
    const text = `🔥 CHÍNH CHỦ ${typeText} MẶT BẰNG - SIÊU VỊ TRÍ ĐÀ NẴNG 🔥

📍 Địa chỉ: ${form.Street}, ${distName}, TP. Đà Nẵng
📐 Diện tích: ${form.Area || '--'} m²
💰 Giá ${typeText.toLowerCase()}: ${priceText}${form.Type === 'RENT' ? '/tháng' : ''}

✨ Ưu điểm & Tiện ích:
${form.Amenities ? form.Amenities.split(',').map(a => `- ${a.trim()}`).join('\n') : '- Vị trí đắc địa, giao thông thuận tiện.'}

📝 Thông tin thêm:
${form.Description || 'Mặt bằng đẹp, phù hợp kinh doanh đa ngành nghề.'}

☎️ Liên hệ ngay: ${form.ContactPhone || '[Số điện thoại]'} (Zalo/Call)
🏢 Vinh BĐS - Kho bãi Đà Nẵng
🌎 Hệ thống môi giới, mua bán và cho thuê chuyên nghiệp.`;
    
    setPostTemplate(text);
    setPostTemplateImages(form.Images || '');
  };

  const handleCopyText = (text, callback) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => callback(true)).catch(() => fallbackCopy(text, callback));
    } else {
      fallbackCopy(text, callback);
    }
  };

  const fallbackCopy = (text, callback) => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      callback(successful);
    } catch (err) {
      callback(false);
    }
  };

  const handleOpenApp = (appName) => {
    handleCopyText(postTemplate, (success) => {
      if (success) {
        alert(`Đã copy nội dung bài đăng!\n\nHệ thống sẽ mở ${appName}. Bạn chỉ cần DÁN (Paste) nội dung vào bài viết nhé!`);
        if (appName === 'Facebook') {
          window.location.href = 'https://www.facebook.com/';
        } else if (appName === 'Zalo') {
          window.location.href = 'https://chat.zalo.me/';
        }
      } else {
        alert('Trình duyệt chặn tự động copy. Vui lòng bôi đen và copy thủ công!');
      }
    });
  };

  const handleLogout = () => setUser(null);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f0fdfa] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white/80 backdrop-blur-md rounded-3xl shadow-xl shadow-teal-900/10 p-10 border border-white">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-slate-800">Admin Đăng Nhập</h2>
            <p className="text-slate-500 mt-2 font-medium">Hệ thống quản lý BĐS Đà Nẵng</p>
          </div>
          
          {error && <div className="bg-red-50/80 border border-red-100 text-red-600 p-4 rounded-2xl mb-6 text-center font-medium text-sm animate-fade-in">{error}</div>}
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
              <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium text-slate-800" placeholder="admin@bds.com" />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Mã PIN</label>
              <input type="password" required value={pin} onChange={e=>setPin(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium text-slate-800" placeholder="••••" />
            </div>
            <button type="submit" disabled={loading} className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-2xl shadow-lg shadow-teal-500/30 text-base font-bold text-white bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-600 hover:to-teal-500 focus:outline-none hover:-translate-y-0.5 transition-all active:scale-95">
              {loading ? 'Đang xác thực...' : 'Đăng nhập ngay'}
            </button>
          </form>
          <div className="mt-6 text-center">
             <Link to="/" className="text-sm font-bold text-teal-600 hover:text-teal-700 transition-colors">← Quay lại Trang Chủ</Link>
          </div>
        </div>
      </div>
    );
  }

  const statRent = properties.filter(p => p.Type === 'RENT').length;
  const statBuy = properties.filter(p => p.Type === 'BUY').length;

  return (
    <div className="min-h-screen bg-[#ccfbf1] flex font-sans relative">
      
      {/* Post Template Modal */}
      {postTemplate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-extrabold text-slate-800">📝 Mẫu Bài Đăng FB / Zalo</h3>
              <button onClick={() => {setPostTemplate(''); setPostTemplateImages('');}} className="text-slate-400 hover:text-red-500 font-bold transition-colors text-3xl leading-none">&times;</button>
            </div>
            <div className="p-6 overflow-y-auto">
              {postTemplateImages && (
                <div className="mb-4">
                  <p className="text-xs text-slate-500 font-medium mb-2 italic">💡 Mẹo: Nhấn giữ (trên điện thoại) hoặc chuột phải (trên máy tính) vào từng ảnh để tải về máy trước khi đăng Facebook/Zalo.</p>
                  <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                    {postTemplateImages.split(',').map((img, idx) => (
                      img.trim() && <img key={idx} src={getImgUrl(img.trim())} alt="Property" className="h-40 w-40 object-cover rounded-xl shadow-sm flex-shrink-0 border border-slate-200" />
                    ))}
                  </div>
                </div>
              )}
              <textarea 
                value={postTemplate}
                onChange={(e) => setPostTemplate(e.target.value)}
                className="w-full h-80 p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 font-medium text-slate-700 whitespace-pre-wrap leading-relaxed"
              ></textarea>
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 flex-wrap">
              <button onClick={() => {setPostTemplate(''); setPostTemplateImages('');}} className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors">Đóng</button>
              <button onClick={() => handleCopyText(postTemplate, s => alert(s ? 'Đã copy bài đăng vào khay nhớ tạm!' : 'Lỗi copy thủ công!'))} className="px-6 py-2.5 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-colors shadow-lg shadow-slate-900/30 flex items-center gap-2">
                <span>📋</span> Copy
              </button>
              <button onClick={() => handleOpenApp('Facebook')} className="px-6 py-2.5 bg-[#1877F2] text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 flex items-center gap-2">
                <span>📘</span> Đăng Facebook
              </button>
              <button onClick={() => handleOpenApp('Zalo')} className="px-6 py-2.5 bg-[#0068ff] text-white font-bold rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30 flex items-center gap-2">
                <span className="bg-white text-[#0068ff] text-[10px] w-5 h-5 flex items-center justify-center rounded font-black">Z</span> Đăng Zalo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className="w-64 bg-white hidden md:flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10 sticky top-0 h-screen">
        <div className="p-6 bg-gradient-to-br from-teal-500 to-teal-400">
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <span className="text-2xl">🏢</span> Quản lý BĐS
          </h2>
          <p className="text-teal-100 text-sm font-medium mt-1 opacity-90">Hệ thống trung tâm</p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition-colors ${activeTab === 'dashboard' ? 'bg-teal-50 text-teal-700 border border-teal-100' : 'text-slate-500 hover:bg-slate-50'}`}>
            <span>📊</span> Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('properties')}
            className={`w-full px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition-colors ${activeTab === 'properties' ? 'bg-teal-50 text-teal-700 border border-teal-100' : 'text-slate-500 hover:bg-slate-50'}`}>
            <span>🏠</span> Quản lý mặt bằng
          </button>
          <button 
            onClick={() => setActiveTab('districts')}
            className={`w-full px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition-colors ${activeTab === 'districts' ? 'bg-teal-50 text-teal-700 border border-teal-100' : 'text-slate-500 hover:bg-slate-50'}`}>
            <span>🗺️</span> Quản lý quận huyện
          </button>
          <button 
            onClick={() => setActiveTab('inquiries')}
            className={`w-full px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition-colors ${activeTab === 'inquiries' ? 'bg-teal-50 text-teal-700 border border-teal-100' : 'text-slate-500 hover:bg-slate-50'}`}>
            <span>📞</span> Yêu cầu liên hệ
            {inquiries.filter(i => i.Status === 'NEW').length > 0 && (
              <span className="ml-auto bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{inquiries.filter(i => i.Status === 'NEW').length}</span>
            )}
          </button>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-lg">
                {(user.name || 'A').charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="font-bold text-slate-800 text-sm truncate">{user.name}</p>
                <p className="text-xs text-slate-500 font-medium truncate">{user.role}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="w-full py-2 bg-white border border-red-200 text-red-500 rounded-xl font-bold text-sm hover:bg-red-50 transition-colors">
              Đăng xuất
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE BOTTOM NAV */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200 flex justify-around items-center p-2 pb-safe z-[90] shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center gap-1 p-2 w-full ${activeTab === 'dashboard' ? 'text-teal-600' : 'text-slate-400 hover:text-slate-600'}`}>
          <span className="text-xl">📊</span>
          <span className="text-[10px] font-bold">Thống kê</span>
        </button>
        <button onClick={() => setActiveTab('properties')} className={`flex flex-col items-center gap-1 p-2 w-full ${activeTab === 'properties' ? 'text-teal-600' : 'text-slate-400 hover:text-slate-600'}`}>
          <span className="text-xl">🏠</span>
          <span className="text-[10px] font-bold">Mặt bằng</span>
        </button>
        <button onClick={() => setActiveTab('districts')} className={`flex flex-col items-center gap-1 p-2 w-full ${activeTab === 'districts' ? 'text-teal-600' : 'text-slate-400 hover:text-slate-600'}`}>
          <span className="text-xl">🗺️</span>
          <span className="text-[10px] font-bold">Quận</span>
        </button>
        <button onClick={() => setActiveTab('inquiries')} className={`flex flex-col items-center gap-1 p-2 w-full relative ${activeTab === 'inquiries' ? 'text-teal-600' : 'text-slate-400 hover:text-slate-600'}`}>
          <span className="text-xl">📞</span>
          <span className="text-[10px] font-bold">Yêu cầu</span>
          {inquiries.filter(i => i.Status === 'NEW').length > 0 && (
            <span className="absolute top-1 right-2 bg-red-500 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full border border-white font-bold">{inquiries.filter(i => i.Status === 'NEW').length}</span>
          )}
        </button>
      </nav>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen pb-28 md:pb-8 animate-fade-in">
        
        {/* Header Mobile & Intro */}
        <div className="mb-8">
          <div className="md:hidden flex justify-between items-center mb-6 bg-white p-4 rounded-2xl shadow-sm">
            <h2 className="text-xl font-extrabold text-teal-600">🏢 Admin BĐS</h2>
            <button onClick={handleLogout} className="text-red-500 font-bold text-sm bg-red-50 px-3 py-1.5 rounded-lg">Đăng xuất</button>
          </div>
          <h1 className="text-3xl font-extrabold text-teal-900 flex items-center gap-3">
            {activeTab === 'dashboard' && <><span className="text-3xl">📊</span> Dashboard</>}
            {activeTab === 'properties' && <><span className="text-3xl">🏠</span> Quản lý mặt bằng</>}
            {activeTab === 'districts' && <><span className="text-3xl">🗺️</span> Quản lý quận huyện</>}
            {activeTab === 'inquiries' && <><span className="text-3xl">📞</span> Yêu cầu liên hệ</>}
          </h1>
          <p className="text-teal-800 font-medium mt-2">Xin chào, <strong className="font-extrabold">{user.name}</strong>! Đây là tổng quan công việc hôm nay.</p>
        </div>

        {activeTab === 'dashboard' && (
          <>
            {/* Dashboard Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
              <div className="bg-gradient-to-br from-teal-500 to-teal-400 p-6 rounded-3xl shadow-lg shadow-teal-500/20 text-white relative overflow-hidden group hover:-translate-y-1 transition-transform">
                <div className="relative z-10">
                  <p className="text-teal-50 font-medium mb-1">Tổng Mặt Bằng</p>
                  <h3 className="text-4xl font-black">{properties.length}</h3>
                </div>
                <div className="absolute -bottom-4 -right-4 text-8xl opacity-20 transform group-hover:scale-110 transition-transform">🏢</div>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-400 p-6 rounded-3xl shadow-lg shadow-emerald-500/20 text-white relative overflow-hidden group hover:-translate-y-1 transition-transform">
                <div className="relative z-10">
                  <p className="text-emerald-50 font-medium mb-1">Cho Thuê</p>
                  <h3 className="text-4xl font-black">{statRent}</h3>
                </div>
                <div className="absolute -bottom-4 -right-4 text-8xl opacity-20 transform group-hover:scale-110 transition-transform">🔑</div>
              </div>

              <div className="bg-gradient-to-br from-cyan-500 to-cyan-400 p-6 rounded-3xl shadow-lg shadow-cyan-500/20 text-white relative overflow-hidden group hover:-translate-y-1 transition-transform">
                <div className="relative z-10">
                  <p className="text-cyan-50 font-medium mb-1">Mua Bán</p>
                  <h3 className="text-4xl font-black">{statBuy}</h3>
                </div>
                <div className="absolute -bottom-4 -right-4 text-8xl opacity-20 transform group-hover:scale-110 transition-transform">💰</div>
              </div>

              <div className="bg-gradient-to-br from-indigo-500 to-indigo-400 p-6 rounded-3xl shadow-lg shadow-indigo-500/20 text-white relative overflow-hidden group hover:-translate-y-1 transition-transform">
                <div className="relative z-10">
                  <p className="text-indigo-50 font-medium mb-1">Yêu Cầu Mới</p>
                  <h3 className="text-4xl font-black">{inquiries.filter(i => i.Status === 'NEW').length}</h3>
                </div>
                <div className="absolute -bottom-4 -right-4 text-8xl opacity-20 transform group-hover:scale-110 transition-transform">📬</div>
              </div>
            </div>
            
            <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-sm border border-white p-6 md:p-8 text-center text-slate-500 flex flex-col items-center justify-center min-h-[300px]">
              <div className="text-6xl mb-4">🚀</div>
              <h2 className="text-xl font-bold text-slate-700 mb-2">Hệ thống đang hoạt động ổn định</h2>
              <p>Hãy chọn các chức năng bên menu trái để thao tác quản lý.</p>
            </div>
          </>
        )}

        {activeTab === 'properties' && (
          <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-sm border border-white p-6 md:p-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <h2 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
                <span className="text-teal-500">📋</span> Danh sách mặt bằng
              </h2>
              <button onClick={() => {
                setShowAdd(!showAdd);
                if (showAdd) setEditingId(null);
                setForm({ Type: 'RENT', DistrictID: '', Street: '', Price: '', Area: '', Images: '', Amenities: '', Description: '', ContactPhone: '', Status: 'AVAILABLE', Video: '' });
              }} className="bg-teal-50 text-teal-600 px-5 py-2.5 rounded-xl font-bold hover:bg-teal-100 transition-colors flex items-center gap-2">
                {showAdd ? 'Hủy' : '+ Thêm mặt bằng mới'}
              </button>
            </div>

            {showAdd && (
              <div className="bg-slate-50 p-6 rounded-3xl mb-8 border border-slate-100 animate-slide-up">
                <h3 className="text-xl font-bold text-slate-800 mb-6">{editingId ? 'Cập nhật mặt bằng' : 'Thêm mặt bằng mới'}</h3>
                <form onSubmit={handleSaveProperty} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Quận/Huyện *</label>
                    <select required value={form.DistrictID} onChange={e=>setForm({...form, DistrictID: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium">
                      <option value="">-- Chọn Quận --</option>
                      {districts.map(d => <option key={d.DistrictID} value={d.DistrictID}>{d.Name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Tên đường / Địa chỉ *</label>
                    <input type="text" required value={form.Street} onChange={e=>setForm({...form, Street: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Loại hình</label>
                    <select value={form.Type} onChange={e=>setForm({...form, Type: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium">
                      <option value="RENT">Cho thuê</option>
                      <option value="BUY">Mua bán</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Giá (VNĐ) *</label>
                    <input type="number" required value={form.Price} onChange={e=>setForm({...form, Price: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Diện tích (m²)</label>
                    <input type="number" value={form.Area} onChange={e=>setForm({...form, Area: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Số điện thoại liên hệ *</label>
                    <input type="tel" required value={form.ContactPhone} onChange={e=>setForm({...form, ContactPhone: e.target.value})} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Tiện ích (cách nhau bởi dấu phẩy)</label>
                    <input type="text" value={form.Amenities} onChange={e=>setForm({...form, Amenities: e.target.value})} placeholder="Vỉa hè rộng, Có chỗ để xe máy..." className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Link Ảnh (cách nhau bởi dấu phẩy)</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={form.Images} 
                        onChange={e=>setForm({...form, Images: e.target.value})} 
                        onPaste={handleImagePaste}
                        placeholder="Paste ảnh trực tiếp (Ctrl+V) hoặc nhập URL..." 
                        className="flex-1 w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium" 
                      />
                      <label className="cursor-pointer bg-teal-50 text-teal-600 px-4 py-2.5 rounded-xl font-bold hover:bg-teal-100 transition-colors flex items-center justify-center whitespace-nowrap shadow-sm border border-teal-100">
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        📸 Tải Ảnh
                      </label>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Link Video (Youtube/Tiktok/Drive)</label>
                    <input type="text" value={form.Video} onChange={e=>setForm({...form, Video: e.target.value})} placeholder="VD: https://www.youtube.com/watch?v=..." className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Mô tả</label>
                    <textarea value={form.Description} onChange={e=>setForm({...form, Description: e.target.value})} rows="3" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium"></textarea>
                  </div>
                  <div className="md:col-span-2 flex justify-between mt-2 flex-wrap gap-4">
                    <button type="button" onClick={handleGeneratePost} className="bg-[#0068ff] text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-600 transition-all flex items-center gap-2 hover:-translate-y-0.5">
                      <span className="text-lg">📝</span> Tạo bài đăng FB/Zalo
                    </button>
                    <button type="submit" disabled={loading} className="bg-teal-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-teal-500/30 hover:bg-teal-600 disabled:opacity-50 hover:-translate-y-0.5 transition-all">
                      {loading ? 'Đang lưu...' : 'Lưu mặt bằng'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider">Mã MB</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider">Thông tin</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider">Giá / Loại</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider">Trạng thái</th>
                    <th className="px-6 py-4 text-right text-xs font-black text-slate-400 uppercase tracking-wider">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {properties.map(p => (
                    <tr key={p.PropertyID} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-500">{p.PropertyID}</td>
                      <td className="px-6 py-4 text-sm text-slate-900">
                        <div className="font-extrabold text-slate-800">{p.Street}</div>
                        <div className="text-slate-500 text-xs font-medium mt-0.5">📍 {districts.find(d => d.DistrictID === p.DistrictID)?.Name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-black text-teal-600">{fmtCurrency(p.Price)}</div>
                        <div className="text-xs font-bold text-slate-400 mt-1">{p.Type === 'RENT' ? 'Cho Thuê' : 'Mua Bán'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button 
                          onClick={() => handleTogglePropertyStatus(p)}
                          className={`px-3 py-1 inline-flex text-xs font-bold rounded-full transition-colors hover:opacity-80 ${p.Status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}
                          title="Click để đổi trạng thái"
                        >
                          {p.Status === 'AVAILABLE' ? 'ĐANG TRỐNG' : 'ĐÃ BÁN/THUÊ'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => handleEditProperty(p)} className="text-teal-600 hover:text-teal-800 font-bold bg-teal-50 px-3 py-1.5 rounded-lg transition-colors mr-2">Sửa</button>
                        <button onClick={() => handleDeleteProperty(p.PropertyID)} className="text-red-500 hover:text-red-700 font-bold bg-red-50 px-3 py-1.5 rounded-lg transition-colors">Xóa</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {properties.length === 0 && (
                <div className="p-12 text-center">
                  <div className="text-4xl mb-4 opacity-30">📭</div>
                  <div className="text-slate-500 font-medium">Chưa có dữ liệu mặt bằng</div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'districts' && (
          <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-sm border border-white p-6 md:p-8 animate-fade-in">
            <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
              <h2 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
                <span className="text-teal-500">🗺️</span> Quản lý quận huyện
              </h2>
              <button 
                onClick={() => { setShowAddDist(!showAddDist); setEditingDistId(null); setFormDist({ Name: '', CoverImage: '' }); }}
                className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2.5 px-6 rounded-xl transition-colors shadow-lg shadow-teal-500/30 active:scale-95"
              >
                {showAddDist ? 'Hủy' : '+ Thêm quận mới'}
              </button>
            </div>

            {showAddDist && (
              <form onSubmit={handleSaveDistrict} className="mb-8 p-6 bg-slate-50 border border-slate-100 rounded-2xl animate-fade-in">
                <h3 className="text-xl font-bold text-slate-800 mb-6">{editingDistId ? 'Sửa thông tin quận' : 'Thêm quận mới'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Tên quận <span className="text-red-500">*</span></label>
                    <input type="text" required value={formDist.Name} onChange={e=>setFormDist({...formDist, Name: e.target.value})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium text-slate-800" placeholder="VD: Liên Chiểu" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Link ảnh Google Drive <span className="text-red-500">*</span></label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        required 
                        value={formDist.CoverImage} 
                        onChange={e=>setFormDist({...formDist, CoverImage: e.target.value})} 
                        onPaste={handleDistImagePaste}
                        className="flex-1 w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium text-slate-800" 
                        placeholder="Paste ảnh trực tiếp (Ctrl+V) hoặc nhập URL..." 
                      />
                      <label className="cursor-pointer bg-teal-50 text-teal-600 px-4 py-3 rounded-xl font-bold hover:bg-teal-100 transition-colors flex items-center justify-center whitespace-nowrap shadow-sm border border-teal-100">
                        <input type="file" accept="image/*" onChange={handleDistImageUpload} className="hidden" />
                        📸 Tải Ảnh
                      </label>
                    </div>
                  </div>
                </div>
                <div className="mt-8 flex justify-end gap-3">
                  <button type="button" onClick={() => setShowAddDist(false)} className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors">Hủy</button>
                  <button type="submit" disabled={loading} className="px-6 py-2.5 bg-teal-500 text-white font-bold rounded-xl hover:bg-teal-600 transition-colors shadow-lg shadow-teal-500/30">
                    {loading ? 'Đang lưu...' : 'Lưu quận'}
                  </button>
                </div>
              </form>
            )}

            <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider">Mã Quận</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider">Tên Quận</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider">Hình ảnh</th>
                    <th className="px-6 py-4 text-right text-xs font-black text-slate-400 uppercase tracking-wider">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {districts.map(d => (
                    <tr key={d.DistrictID} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-700">{d.DistrictID}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800">{d.Name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <a href={d.CoverImage} target="_blank" rel="noreferrer" className="text-teal-600 hover:underline">Xem ảnh</a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => handleEditDistrict(d)} className="text-teal-600 hover:text-teal-800 font-bold bg-teal-50 px-3 py-1.5 rounded-lg transition-colors mr-2">Sửa</button>
                        <button onClick={() => handleDeleteDistrict(d.DistrictID)} className="text-red-500 hover:text-red-700 font-bold bg-red-50 px-3 py-1.5 rounded-lg transition-colors">Xóa</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'inquiries' && (
          <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-sm border border-white p-6 md:p-8 animate-fade-in">
            <h2 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2 mb-8">
              <span className="text-teal-500">📞</span> Quản lý yêu cầu liên hệ
            </h2>

            <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider">Ngày gửi</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider">Khách hàng</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider">Mặt bằng QT</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-wider">Ghi chú</th>
                    <th className="px-6 py-4 text-right text-xs font-black text-slate-400 uppercase tracking-wider">Trạng thái</th>
                    <th className="px-6 py-4 text-right text-xs font-black text-slate-400 uppercase tracking-wider">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inquiries.map(i => {
                    const prop = properties.find(p => p.PropertyID === i.PropertyID);
                    return (
                      <tr key={i.InquiryID} className={`transition-colors ${i.Status === 'NEW' ? 'bg-teal-50/50 hover:bg-teal-50' : 'hover:bg-slate-50'}`}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-500">
                          {new Date(i.Date || i.CreatedAt || new Date()).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="font-extrabold text-slate-800">{i.CustomerName}</div>
                          <div className="text-slate-600 font-medium mt-0.5">📞 {String(i.CustomerPhone).startsWith('0') ? i.CustomerPhone : '0' + i.CustomerPhone}</div>
                        </td>
                        <td className="px-6 py-4 text-sm max-w-[200px] truncate text-slate-600 font-medium">
                          {prop ? <a href={`/property/${prop.PropertyID}`} target="_blank" className="text-teal-600 hover:underline">{prop.Street}</a> : i.PropertyID}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 max-w-[200px] truncate" title={i.Note}>
                          {i.Note || <span className="text-slate-300 italic">Không có</span>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <select 
                            value={i.Status} 
                            onChange={(e) => handleUpdateInquiryStatus(i.InquiryID, e.target.value)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold outline-none cursor-pointer border ${i.Status === 'NEW' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}
                          >
                            <option value="NEW">MỚI CHỜ XỬ LÝ</option>
                            <option value="DONE">ĐÃ LIÊN HỆ</option>
                            <option value="PROCESSED">ĐÃ XỬ LÝ XONG</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button onClick={() => handleDeleteInquiry(i.InquiryID)} className="text-red-500 hover:text-red-700 font-bold bg-red-50 px-3 py-1.5 rounded-lg transition-colors">Xóa</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {inquiries.length === 0 && (
                <div className="p-12 text-center">
                  <div className="text-4xl mb-4 opacity-30">📭</div>
                  <div className="text-slate-500 font-medium">Chưa có yêu cầu liên hệ nào</div>
                </div>
              )}
            </div>
          </div>
        )}

      </main>

    </div>
  );
}

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, getImgUrl } from '../api';
import PropertyCard from '../components/PropertyCard';
import { useRecentViews } from '../hooks/useRecentViews';


export default function Home() {
  const navigate = useNavigate();
  const [districts, setDistricts] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const { recentViews } = useRecentViews();
  
  // States cho Bộ Lọc Nâng Cao
  const [filterType, setFilterType] = useState('ALL');
  const [filterPrice, setFilterPrice] = useState('ALL');
  const [filterArea, setFilterArea] = useState('ALL');

  // CTA States
  const [ctaName, setCtaName] = useState('');
  const [ctaPhone, setCtaPhone] = useState('');
  const [ctaStatus, setCtaStatus] = useState('IDLE');

  const handleCtaSubmit = (e) => {
    e.preventDefault();
    if (!ctaName || !ctaPhone) return;
    setCtaStatus('LOADING');
    api('submitInquiry', { customerName: ctaName, customerPhone: ctaPhone, note: 'Đăng ký nhận thông tin từ trang chủ' })
      .then(() => {
        setCtaStatus('SUCCESS');
        setCtaName('');
        setCtaPhone('');
        setTimeout(() => setCtaStatus('IDLE'), 3000);
      })
      .catch(() => setCtaStatus('ERROR'));
  };

  useEffect(() => {
    api('getPublicData')
      .then(data => {
        setDistricts(data?.districts || []);
        setProperties(data?.properties || []);
      })
      .catch(err => console.error("API Error:", err))
      .finally(() => setLoading(false));
  }, []);

  const getCount = (districtId) => {
    return properties.filter(p => p.DistrictID === districtId).length;
  };

  const handleSearch = () => {
    if (q.trim()) navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 md:py-16 px-4 text-center">
        {/* Background gradient with pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-600 via-teal-500 to-teal-400 opacity-90 z-0"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 z-0"></div>
        
        <div className="relative z-10 animate-slide-up">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight drop-shadow-md">
            Khám Phá Không Gian <br className="hidden md:block"/> Kinh Doanh Lý Tưởng
          </h1>
          

          <p className="text-lg md:text-xl text-teal-50 mb-10 max-w-2xl mx-auto font-medium drop-shadow">
            Hàng trăm mặt bằng vị trí đắc địa tại Đà Nẵng đang chờ bạn. Nhanh chóng, uy tín, chính xác.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto bg-white/90 backdrop-blur-md rounded-full p-2 flex shadow-2xl shadow-teal-900/20 border border-white/50">
            <input 
              type="text" 
              placeholder="Nhập tên đường, khu vực..." 
              value={q}
              onChange={e => setQ(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="flex-1 px-6 py-3 rounded-l-full outline-none text-slate-700 bg-transparent font-medium" 
            />
            <button 
              onClick={handleSearch}
              className="bg-teal-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-teal-700 hover:shadow-teal-600/50 transition-all hover:scale-105 active:scale-95"
            >
              Tìm Kiếm
            </button>
          </div>

          {/* Trending Keywords */}
          <div className="mt-6 flex flex-wrap justify-center items-center gap-3 text-sm font-medium">
            <span className="text-teal-100">Xu hướng tìm kiếm:</span>
            {['Mặt bằng Hải Châu', 'Nhà kho Liên Chiểu', 'Mặt bằng giá rẻ', 'Cho thuê Sơn Trà'].map((k, i) => (
              <button 
                key={i} 
                onClick={() => { setQ(k); navigate(`/search?q=${encodeURIComponent(k)}`); }} 
                className="text-white bg-white/10 hover:bg-white/20 px-4 py-1.5 rounded-full border border-white/20 transition-all hover:scale-105 active:scale-95 shadow-sm backdrop-blur-sm"
              >
                {k}
              </button>
            ))}
          </div>

        </div>
      </section>

      {loading ? (
        <div className="flex justify-center items-center py-32">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-teal-100 border-t-teal-500"></div>
        </div>
      ) : (
        <>
          {/* Districts Grid */}
          <section className="container mx-auto px-4 py-20 w-full animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-800">Quận Nổi Bật</h2>
                <p className="text-slate-500 mt-2 font-medium">Lọc mặt bằng theo các quận trung tâm</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-[220px]">
              {districts.map((d) => (
                <Link key={d.DistrictID} to={`/district/${d.DistrictID}`} className="group relative rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl hover:shadow-teal-900/10 transition-all duration-300 hover:-translate-y-1">
                  <img 
                    src={getImgUrl((!d.CoverImage || d.CoverImage.includes('example.com')) ? 'https://images.unsplash.com/photo-1559592413-7cecaed4b5fc?w=500&q=80' : d.CoverImage)} 
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1559592413-7cecaed4b5fc?w=500&q=80'; }}
                    alt={d.Name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent group-hover:from-slate-900/95 transition-all duration-300"></div>
                  <div className="absolute bottom-0 left-0 p-5 w-full">
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-2 group-hover:text-teal-300 transition-colors">{d.Name}</h3>
                    <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full font-medium border border-white/20 shadow-sm">
                      {getCount(d.DistrictID)} mặt bằng
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Featured Properties */}
          <section className="container mx-auto px-4 pb-24 w-full animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-800">Mặt Bằng Phù Hợp</h2>
                <p className="text-slate-500 mt-2 font-medium">Kết quả mới nhất dựa theo nhu cầu của bạn</p>
              </div>
              
              {/* Advanced Filter Bar Moved Here */}
              <div className="flex flex-wrap gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                <select value={filterType} onChange={e=>setFilterType(e.target.value)} className="bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl outline-none font-medium text-sm border-none hover:bg-slate-100 cursor-pointer transition-colors focus:ring-2 focus:ring-teal-500/20">
                  <option value="ALL">Loại hình</option>
                  <option value="RENT">Cho thuê</option>
                  <option value="SALE">Bán</option>
                </select>
                
                <select value={filterPrice} onChange={e=>setFilterPrice(e.target.value)} className="bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl outline-none font-medium text-sm border-none hover:bg-slate-100 cursor-pointer transition-colors focus:ring-2 focus:ring-teal-500/20">
                  <option value="ALL">Mức giá</option>
                  <option value="<10">Dưới 10 Triệu</option>
                  <option value="10-20">10 - 20 Triệu</option>
                  <option value=">20">Trên 20 Triệu</option>
                </select>
                
                <select value={filterArea} onChange={e=>setFilterArea(e.target.value)} className="bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl outline-none font-medium text-sm border-none hover:bg-slate-100 cursor-pointer transition-colors focus:ring-2 focus:ring-teal-500/20">
                  <option value="ALL">Diện tích</option>
                  <option value="<50">Dưới 50 m²</option>
                  <option value="50-100">50 - 100 m²</option>
                  <option value=">100">Trên 100 m²</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {(() => {
                let filtered = properties;
                if (filterType !== 'ALL') {
                  filtered = filtered.filter(p => p.Type === filterType);
                }
                if (filterPrice !== 'ALL') {
                  filtered = filtered.filter(p => {
                    const price = p.Price;
                    if (filterPrice === '<10') return price < 10000000;
                    if (filterPrice === '10-20') return price >= 10000000 && price <= 20000000;
                    if (filterPrice === '>20') return price > 20000000;
                    return true;
                  });
                }
                if (filterArea !== 'ALL') {
                  filtered = filtered.filter(p => {
                    const area = parseFloat(p.Area);
                    if (filterArea === '<50') return area < 50;
                    if (filterArea === '50-100') return area >= 50 && area <= 100;
                    if (filterArea === '>100') return area > 100;
                    return true;
                  });
                }
                
                if (filtered.length === 0) {
                  return (
                    <div className="col-span-1 md:col-span-3 text-center text-slate-500 py-16 bg-white rounded-3xl shadow-sm border border-slate-100 border-dashed">
                      <p className="text-xl font-medium">Không tìm thấy mặt bằng nào phù hợp với bộ lọc.</p>
                    </div>
                  );
                }

                return filtered.slice(0, 6).map(p => {
                  const distName = districts.find(d => d.DistrictID === p.DistrictID)?.Name || '';
                  return <PropertyCard key={p.PropertyID} property={p} districtName={distName} />;
                });
              })()}
            </div>
            
            <div className="mt-12 flex justify-center">
              <Link to="/search" className="bg-white border-2 border-teal-600 text-teal-600 px-10 py-3.5 rounded-full font-bold hover:bg-teal-50 hover:shadow-lg transition-all hover:-translate-y-1">
                Xem Tất Cả Mặt Bằng →
              </Link>
            </div>
          </section>

          {/* Đã xem gần đây (Recently Viewed) */}
          {recentViews.length > 0 && (
            <section className="container mx-auto px-4 pb-24 w-full animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="flex justify-between items-end mb-10">
                <div>
                  <h2 className="text-3xl font-extrabold text-slate-800">Đã xem gần đây</h2>
                  <p className="text-slate-500 mt-2 font-medium">Các mặt bằng bạn vừa quan tâm</p>
                </div>
              </div>
              <div className="flex overflow-x-auto gap-6 pb-6 custom-scrollbar">
                {recentViews.map(p => {
                  const distName = districts.find(d => d.DistrictID === p.DistrictID)?.Name || '';
                  return (
                    <div key={p.PropertyID} className="min-w-[300px] max-w-[350px] shrink-0">
                      <PropertyCard property={p} districtName={distName} />
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* CTA Section */}
          <section className="container mx-auto px-4 pb-24 w-full animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="bg-gradient-to-br from-teal-600 to-teal-800 rounded-[3rem] p-10 md:p-16 text-center text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-400/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>
              
              <div className="relative z-10 max-w-2xl mx-auto">
                <h2 className="text-3xl md:text-5xl font-black mb-6 leading-tight">Nhận thông tin mặt bằng mới nhất & Phù hợp nhất</h2>
                <p className="text-teal-100 text-lg mb-10 font-medium">Để lại thông tin, đội ngũ tư vấn chuyên nghiệp của chúng tôi sẽ liên hệ lại ngay để hỗ trợ bạn tìm kiếm mặt bằng ưng ý.</p>
                
                <form onSubmit={handleCtaSubmit} className="flex flex-col sm:flex-row gap-4 justify-center">
                  <input 
                    type="text" 
                    placeholder="Tên của bạn" 
                    required
                    value={ctaName}
                    onChange={e => setCtaName(e.target.value)}
                    className="px-6 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-teal-200 outline-none focus:bg-white/20 focus:border-white focus:ring-4 focus:ring-white/10 transition-all font-medium sm:w-1/3"
                  />
                  <input 
                    type="tel" 
                    placeholder="Số điện thoại" 
                    required
                    value={ctaPhone}
                    onChange={e => setCtaPhone(e.target.value)}
                    className="px-6 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-teal-200 outline-none focus:bg-white/20 focus:border-white focus:ring-4 focus:ring-white/10 transition-all font-medium sm:w-1/3"
                  />
                  <button 
                    type="submit" 
                    disabled={ctaStatus === 'LOADING' || ctaStatus === 'SUCCESS'}
                    className="px-8 py-4 rounded-2xl bg-white text-teal-700 font-bold hover:bg-teal-50 hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-70 disabled:hover:scale-100"
                  >
                    {ctaStatus === 'LOADING' ? 'Đang gửi...' : ctaStatus === 'SUCCESS' ? '✓ Đã gửi' : 'Yêu cầu tư vấn'}
                  </button>
                </form>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

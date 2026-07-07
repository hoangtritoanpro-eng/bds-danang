import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, fmtCurrency, getImgUrl } from '../api';

export default function District() {
  const { id } = useParams();
  const [district, setDistrict] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('getPublicData')
      .then(data => {
        const d = data?.districts?.find(x => x.DistrictID === id);
        setDistrict(d);
        const p = data?.properties?.filter(x => x.DistrictID === id) || [];
        setProperties(p);
      })
      .catch(err => console.error("API Error:", err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32 min-h-[60vh]">
        <div className="animate-spin rounded-full h-14 w-14 border-4 border-teal-100 border-t-teal-500"></div>
      </div>
    );
  }

  if (!district) {
    return (
      <div className="py-32 text-center bg-[#f8fafc] min-h-[60vh]">
        <div className="text-5xl mb-4 opacity-40">😢</div>
        <p className="text-xl text-slate-500 font-medium">Không tìm thấy Quận/Huyện này.</p>
        <Link to="/" className="inline-block mt-6 text-teal-600 font-bold hover:underline">← Quay lại trang chủ</Link>
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-20 animate-fade-in">
      {/* Cover Header */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden">
        <img 
          src={getImgUrl((!district.CoverImage || district.CoverImage.includes('example.com')) ? 'https://images.unsplash.com/photo-1559592413-7cecaed4b5fc?w=1200&q=80' : district.CoverImage)} 
          onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1559592413-7cecaed4b5fc?w=1200&q=80'; }}
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full p-8">
          <div className="container mx-auto">
            <Link to="/" className="text-teal-300 font-bold hover:text-white transition-colors mb-2 inline-block">← Quay lại trang chủ</Link>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-md">Khu vực {district.Name}</h1>
            <p className="text-slate-300 mt-2 font-medium">{properties.length} mặt bằng đang chờ bạn</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-12 animate-slide-up">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {properties.map(p => {
            const images = p.Images ? p.Images.split(',') : [];
            const mainImage = images[0] || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&q=80';
            
            return (
              <Link to={`/property/${p.PropertyID}`} key={p.PropertyID} className="group bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-slate-100 overflow-hidden flex flex-col">
                <div className="h-60 relative overflow-hidden">
                  <img 
                    src={getImgUrl(mainImage)} 
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&q=80'; }}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-teal-700 text-xs font-black px-3 py-1.5 rounded-full shadow-sm">
                    {p.Type === 'RENT' ? 'CHO THUÊ' : 'BÁN'}
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-grow relative">
                  <div className="absolute -top-6 right-6 bg-teal-500 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg font-bold border-4 border-white group-hover:scale-110 transition-transform">
                    HOT
                  </div>
                  <h3 className="font-extrabold text-xl text-slate-800 line-clamp-1 mb-1 group-hover:text-teal-600 transition-colors">{p.Street}</h3>
                  <p className="text-slate-500 font-medium mb-3">📍 {district.Name}</p>
                  
                  <div className="text-teal-600 font-black text-2xl mb-4">
                    {fmtCurrency(p.Price)} {p.Type === 'RENT' ? <span className="text-sm font-medium text-slate-400">/tháng</span> : ''}
                  </div>
                  <div className="flex gap-3 mb-2">
                    <div className="bg-slate-50 text-slate-600 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 border border-slate-100">
                      📏 {p.Area}m²
                    </div>
                    <div className="bg-slate-50 text-slate-600 px-3 py-1.5 rounded-lg text-sm font-medium flex-1 line-clamp-1 border border-slate-100">
                      ✨ {p.Amenities}
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
        
        {properties.length === 0 && (
          <div className="bg-white p-16 rounded-[2rem] text-center shadow-sm mt-6 border border-slate-100 border-dashed">
            <div className="text-5xl mb-4 opacity-40">📭</div>
            <p className="text-slate-500 font-medium text-lg">Hiện chưa có mặt bằng nào tại khu vực này.</p>
          </div>
        )}
      </div>
    </div>
  );
}

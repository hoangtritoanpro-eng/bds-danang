import { Link } from 'react-router-dom';
import { fmtCurrency, getImgUrl } from '../api';
import { useFavorites } from '../hooks/useFavorites';

export default function PropertyCard({ property: p, districtName }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const images = p.Images ? p.Images.split(',') : [];
  const mainImage = images[0] || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&q=80';
  const fav = isFavorite(p.PropertyID);
  
  // Fake viewer count based on ID to keep it stable and fix NaN
  const idStr = String(p.PropertyID || '');
  const numMatch = idStr.match(/\d+/);
  const num = numMatch ? parseInt(numMatch[0], 10) : 0;
  const viewers = (num % 6) + 3;
  
  // Mock IsFeatured since we don't have it in backend yet
  const isFeatured = num % 4 === 0;

  return (
    <div className="group bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(20,184,166,0.15)] transition-all duration-500 hover:-translate-y-2 border border-slate-100 overflow-hidden flex flex-col relative">
      <div className="h-48 relative overflow-hidden">
        <img 
          src={getImgUrl(mainImage)} 
          onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&q=80'; }}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
          alt={p.Street}
        />
        <div className="absolute top-3 left-3 flex flex-col gap-2 items-start z-10">
          <div className="bg-white/90 backdrop-blur-sm text-teal-700 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
            {p.Type === 'RENT' ? 'CHO THUÊ' : 'BÁN'}
          </div>
          {p.Status === 'RENTED' && (
            <div className="bg-slate-800/90 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
              ĐÃ CHO THUÊ
            </div>
          )}
          {isFeatured && (
            <div className="bg-amber-400/90 backdrop-blur-sm text-amber-950 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1 shadow-amber-500/20">
              ⭐ NỔI BẬT
            </div>
          )}
        </div>

        {/* Cảnh báo đám đông (FOMO) */}
        <div className="absolute bottom-3 left-3 bg-rose-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1 animate-pulse">
          🔥 Đang có {viewers} người xem
        </div>
        
        {/* Nút Yêu Thích */}
        <button 
          onClick={(e) => { e.preventDefault(); toggleFavorite(p); }}
          className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm w-8 h-8 flex items-center justify-center rounded-full shadow-sm hover:scale-110 transition-transform z-10"
        >
          <span className={`text-base ${fav ? 'text-rose-500' : 'text-slate-300'}`}>
            {fav ? '❤️' : '🤍'}
          </span>
        </button>
      </div>
      <div className="p-4 flex flex-col flex-grow relative">
        <h3 className="font-bold text-lg text-slate-800 line-clamp-1 mb-1 group-hover:text-teal-600 transition-colors pr-8">{p.Street}</h3>
        <p className="text-slate-500 text-sm font-medium mb-2">📍 {districtName}</p>
        
        <div className="text-teal-600 font-bold text-xl mb-3">
          {fmtCurrency(p.Price)} {p.Type === 'RENT' ? <span className="text-xs font-medium text-slate-400">/tháng</span> : ''}
        </div>
        
        <div className="flex gap-2 mb-4">
          <div className="bg-slate-50 text-slate-600 px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 border border-slate-100 shrink-0">
            📏 {p.Area}m²
          </div>
          <div className="bg-slate-50 text-slate-600 px-2.5 py-1 rounded-lg text-xs font-medium flex-1 line-clamp-1 border border-slate-100" title={p.Amenities}>
            ✨ {p.Amenities || 'Đang cập nhật'}
          </div>
        </div>
        
        <Link to={`/property/${p.PropertyID}`} className="mt-auto block text-center w-full bg-slate-50 hover:bg-teal-50 text-teal-600 font-semibold text-sm transition-colors py-2.5 rounded-xl">
          Xem chi tiết
        </Link>
      </div>
    </div>
  );
}

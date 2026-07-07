import { Link } from 'react-router-dom';
import PropertyCard from '../components/PropertyCard';
import { useFavorites } from '../hooks/useFavorites';

export default function Favorites() {
  const { favorites } = useFavorites();

  return (
    <div className="min-h-screen bg-[#f8fafc] py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center gap-4 mb-10">
          <Link to="/" className="text-teal-600 font-bold hover:text-teal-700">← Quay lại</Link>
          <h1 className="text-3xl font-extrabold text-slate-800">Mặt bằng Yêu Thích ({favorites.length})</h1>
        </div>

        {favorites.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-100">
            <span className="text-6xl mb-4 block">🤍</span>
            <h2 className="text-2xl font-bold text-slate-700 mb-2">Chưa có mặt bằng nào</h2>
            <p className="text-slate-500 mb-6 font-medium">Bạn hãy bấm vào biểu tượng trái tim trên các mặt bằng để lưu lại nhé.</p>
            <Link to="/" className="inline-block px-8 py-3 bg-teal-600 text-white rounded-full font-bold hover:bg-teal-700 transition-colors">
              Khám phá ngay
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {favorites.map(p => (
              <PropertyCard key={p.PropertyID} property={p} districtName="Đã lưu" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, fmtCurrency, getImgUrl } from '../api';
import PropertyCard from '../components/PropertyCard';
import LoanCalculator from '../components/LoanCalculator';
import SmartFormModal from '../components/SmartFormModal';
import { useRecentViews } from '../hooks/useRecentViews';

export default function PropertyDetail() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [district, setDistrict] = useState(null);
  const [allDistricts, setAllDistricts] = useState([]);
  const [relatedProps, setRelatedProps] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { addRecentView } = useRecentViews();

  // Form liên hệ (SmartFormModal state)
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Media Viewer state
  const [selectedImg, setSelectedImg] = useState(null);

  useEffect(() => {
    api('getPublicData')
      .then(data => {
        const p = data?.properties?.find(x => x.PropertyID === id);
        setProperty(p);
        if (p) {
          const d = data?.districts?.find(x => x.DistrictID === p.DistrictID);
          setDistrict(d);
          setAllDistricts(data?.districts || []);
          
          // Ghi nhận đã xem
          addRecentView(p);
          
          // Lọc danh sách tương tự (cùng quận, khác ID hiện tại)
          const related = data?.properties?.filter(x => x.DistrictID === p.DistrictID && x.PropertyID !== p.PropertyID).slice(0, 4);
          setRelatedProps(related || []);
        }
      })
      .catch(err => console.error("API Error:", err))
      .finally(() => setLoading(false));
  }, [id]);

  // Handle SmartFormModal open
  const openModal = () => setIsModalOpen(true);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32 min-h-[60vh] bg-[#f8fafc]">
        <div className="animate-spin rounded-full h-14 w-14 border-4 border-teal-100 border-t-teal-500"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="py-32 text-center bg-[#f8fafc] min-h-[60vh]">
        <div className="text-5xl mb-4 opacity-40">😢</div>
        <p className="text-xl text-slate-500 font-medium">Không tìm thấy thông tin mặt bằng.</p>
        <Link to="/" className="inline-block mt-6 text-teal-600 font-bold hover:underline">← Quay lại trang chủ</Link>
      </div>
    );
  }

  const images = property.Images ? property.Images.split(',') : ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=1000&q=80'];

  return (
    <div className="bg-[#f8fafc] min-h-screen py-10 animate-fade-in">
      <div className="container mx-auto px-4">
        <Link to={`/district/${property.DistrictID}`} className="text-teal-600 font-bold hover:underline mb-8 inline-flex items-center gap-2">
          <span>←</span> Quay lại danh sách
        </Link>
        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Cột trái: Ảnh và Thông tin */}
          <div className="xl:col-span-2 space-y-8 animate-slide-up">
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
              {/* MASONRY GALLERY (Giống Sky-Line) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4 md:p-6 bg-slate-50">
                <div className="md:col-span-2 lg:col-span-2 row-span-2 relative rounded-3xl overflow-hidden group shadow-md border border-slate-100">
                  <img 
                    src={getImgUrl(images[0] || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80')} 
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80'; }}
                    className="w-full h-[300px] md:h-[450px] object-cover transition-transform duration-700 group-hover:scale-105 cursor-pointer" alt="Ảnh chính" 
                    onClick={() => setSelectedImg(images[0])}
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-teal-700 text-sm font-black px-4 py-2 rounded-full shadow-lg border border-white/20">
                    {property.Type === 'RENT' ? 'CHO THUÊ' : 'BÁN'}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300"></div>
                </div>
                {images.slice(1, 3).map((img, i) => (
                  <div key={i} className="hidden md:block relative rounded-3xl overflow-hidden group h-[220px] shadow-md border border-slate-100">
                    <img 
                      src={getImgUrl(img)} 
                      onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&q=80'; }}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 cursor-pointer" 
                      onClick={() => setSelectedImg(img)}
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center justify-center text-white">
                      <span className="text-3xl bg-white/20 backdrop-blur-sm w-12 h-12 flex items-center justify-center rounded-full">🔍</span>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Thư viện ảnh đầy đủ */}
              {images.length > 1 && (
                <div className="flex overflow-x-auto gap-4 p-6 bg-slate-50 border-t border-slate-100 custom-scrollbar">
                  {images.map((img, i) => (
                    <div key={i} className="relative group shrink-0">
                      <img 
                        src={getImgUrl(img)} 
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&q=80'; }}
                        className="h-28 w-40 object-cover rounded-2xl cursor-pointer transition-all duration-300 border-[3px] border-transparent hover:border-teal-500 shadow-sm" 
                        onClick={() => setSelectedImg(img)}
                      />
                      <div className="absolute inset-0 bg-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none border-[3px] border-teal-500"></div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="p-8 md:p-10">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 leading-tight mb-2">
                      {property.Type === 'RENT' ? 'Cho Thuê' : 'Bán'} {property.Street}
                    </h1>
                    <p className="text-lg text-slate-500 font-medium flex items-center gap-2">
                      📍 {district?.Name}
                    </p>
                  </div>
                  <span className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap border border-emerald-200 self-start shadow-sm">
                    {property.Status || 'Đang trống'}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-y-6 gap-x-12 py-8 border-y border-slate-100 my-8 bg-slate-50/50 rounded-2xl px-8">
                  <div>
                    <p className="text-slate-400 font-medium mb-1 uppercase tracking-wider text-sm">Mức giá</p>
                    <p className="text-3xl font-black text-teal-600">{fmtCurrency(property.Price)} {property.Type === 'RENT' ? <span className="text-lg font-medium text-slate-400">/tháng</span> : ''}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium mb-1 uppercase tracking-wider text-sm">Diện tích</p>
                    <p className="text-3xl font-black text-slate-800">{property.Area}<span className="text-lg font-medium text-slate-400 ml-1">m²</span></p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium mb-1 uppercase tracking-wider text-sm">Loại hình</p>
                    <p className="text-xl font-bold text-slate-800 mt-1">{property.Type === 'RENT' ? 'Cho thuê' : 'Mua bán'}</p>
                  </div>
                </div>

                <div className="mb-10">
                  <h3 className="text-xl font-extrabold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="text-teal-500 text-2xl">✨</span> Tiện ích nổi bật
                  </h3>
                  <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl text-slate-600 font-medium leading-relaxed">
                    {property.Amenities || 'Chưa cập nhật tiện ích'}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-extrabold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="text-teal-500 text-2xl">📝</span> Mô tả chi tiết
                  </h3>
                  <div className="bg-white border border-slate-100 p-6 rounded-2xl text-slate-600 leading-relaxed whitespace-pre-wrap shadow-sm">
                    {property.Description || 'Chưa có mô tả chi tiết.'}
                  </div>
                </div>

                {property.Video && (
                  <div className="mt-10">
                    <h3 className="text-xl font-extrabold text-slate-800 mb-4 flex items-center gap-2">
                      <span className="text-teal-500 text-2xl">🎥</span> Video Giới Thiệu
                    </h3>
                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                      {(() => {
                        const match = property.Video.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
                        const embedUrl = match ? `https://www.youtube.com/embed/${match[1]}` : null;
                        
                        if (embedUrl) {
                          return (
                            <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-sm">
                              <iframe 
                                src={embedUrl} 
                                title="Video giới thiệu" 
                                className="absolute inset-0 w-full h-full border-0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowFullScreen
                              ></iframe>
                            </div>
                          );
                        }
                        
                        return (
                          <a href={property.Video} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-teal-600 hover:text-teal-700 font-bold p-4 bg-teal-50 hover:bg-teal-100 rounded-xl transition-colors border border-teal-100">
                            <span className="text-2xl">▶️</span> Bấm vào đây để xem Video
                          </a>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Cột phải: Form Liên hệ */}
          <div className="xl:col-span-1 animate-slide-up" style={{animationDelay: '100ms'}}>
            <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 p-8 sticky top-28 border border-slate-100 text-center">
              <h3 className="text-2xl font-extrabold text-slate-800 mb-2">Bạn cần thêm thông tin?</h3>
              <p className="text-slate-500 font-medium mb-6 text-sm">Chuyên viên của chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7</p>
              
              <div className="bg-teal-50 border border-teal-100 p-5 rounded-2xl mb-8 flex flex-col items-center gap-2 transition-transform hover:scale-[1.02]">
                <div className="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center text-white text-3xl shadow-lg shadow-teal-500/30 mb-2">
                  📞
                </div>
                <p className="text-sm font-bold text-teal-700/70 uppercase tracking-widest">Hotline hỗ trợ</p>
                <p className="font-black text-2xl text-teal-800">0935.788.514</p>
              </div>

              <div className="relative mb-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-slate-400 font-medium">Hoặc</span>
                </div>
              </div>
              
              <button 
                onClick={openModal}
                className="w-full bg-slate-800 hover:bg-teal-600 text-white font-bold py-5 px-6 rounded-2xl transition-all duration-300 shadow-lg shadow-slate-200 hover:shadow-teal-500/30 hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 text-lg"
              >
                Yêu cầu tư vấn ngay
              </button>
            </div>

            {/* Loan Calculator (Chỉ hiển thị cho Bán) */}
            {property.Type === 'SALE' && (
              <LoanCalculator price={property.Price} />
            )}
          </div>
        </div>
      </div>

      {/* Related Properties */}
      {relatedProps.length > 0 && (
        <div className="container mx-auto px-4 py-16">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-800">Mặt bằng tương tự</h2>
              <p className="text-slate-500 mt-2 font-medium">Gợi ý khác cùng khu vực {district?.Name}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {relatedProps.map(p => {
              const distName = allDistricts.find(d => d.DistrictID === p.DistrictID)?.Name || '';
              return <PropertyCard key={p.PropertyID} property={p} districtName={distName} />
            })}
          </div>
        </div>
      )}

      {/* Fullscreen Image Viewer Modal */}
      {selectedImg && (
        <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in" onClick={() => setSelectedImg(null)}>
          <button className="absolute top-6 right-6 text-white/50 hover:text-white text-4xl font-light transition-colors w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 z-[210] hover:scale-110 active:scale-95">&times;</button>
          <img src={getImgUrl(selectedImg)} className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()} />
        </div>
      )}

      {/* Smart Form Modal */}
      <SmartFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

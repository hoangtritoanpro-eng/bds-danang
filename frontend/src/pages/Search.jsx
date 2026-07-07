import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api';
import PropertyCard from '../components/PropertyCard';
import { geocodeAddress } from '../utils/geocode';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet default icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Helper to generate a dummy coordinate near Da Nang based on property ID
const getDummyCoords = (idStr, districtName) => {
  const id = parseInt(idStr.replace(/\D/g, '')) || 1;
  const baseLat = 16.0544 + (id % 10) * 0.005 * (id % 2 === 0 ? 1 : -1);
  const baseLng = 108.2022 + (id % 7) * 0.005 * (id % 3 === 0 ? 1 : -1);
  return [baseLat, baseLng];
};

function ChangeMapView({ center }) {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
}

function MapUpdater({ isMapView }) {
  const map = useMap();
  useEffect(() => {
    if (isMapView) {
      setTimeout(() => {
        map.invalidateSize();
      }, 300); // Đợi CSS transition chạy xong rồi tính toán lại kích thước map
    }
  }, [isMapView, map]);
  return null;
}

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQ = searchParams.get('q') || '';
  
  const [q, setQ] = useState(initialQ);
  const [type, setType] = useState('ALL');
  
  const [properties, setProperties] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredPropId, setHoveredPropId] = useState(null);
  const [coordsMap, setCoordsMap] = useState({});
  const [isMapView, setIsMapView] = useState(false); // Mobile view toggle

  useEffect(() => {
    setLoading(true);
    api('getPublicData')
      .then(data => {
        setDistricts(data?.districts || []);
        setProperties(data?.properties || []);
      })
      .catch(err => console.error("API Error:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams({ q, type });
  };

  const filtered = properties.filter(p => {
    const term = (searchParams.get('q') || '').toLowerCase();
    const distName = (districts.find(d => d.DistrictID === p.DistrictID)?.Name || '').toLowerCase();

    const matchQ = term === '' || 
      (p.Street && p.Street.toLowerCase().includes(term)) || 
      (p.Description && p.Description.toLowerCase().includes(term)) ||
      (p.Amenities && p.Amenities.toLowerCase().includes(term)) ||
      (p.Area && p.Area.toString().toLowerCase().includes(term)) ||
      (distName && distName.includes(term));
    
    const filterType = searchParams.get('type') || 'ALL';
    const matchType = filterType === 'ALL' || p.Type === filterType;
    return matchQ && matchType;
  });

  useEffect(() => {
    // When filtered changes, attempt to load coords
    filtered.forEach(p => {
      if (coordsMap[p.PropertyID] !== undefined) return; // already loaded or null
      
      const distName = districts.find(d => d.DistrictID === p.DistrictID)?.Name || '';
      if (!distName) return;

      const address = `${p.Street}, ${distName}, Đà Nẵng, Việt Nam`;
      
      geocodeAddress(address).then(coords => {
        setCoordsMap(prev => ({...prev, [p.PropertyID]: coords}));
      }).catch(err => {
        console.error('Geocode error for', address, err);
      });
    });
  }, [filtered, districts]);

  return (
    <div className="bg-[#f8fafc] flex flex-col h-[calc(100vh-80px)] animate-fade-in overflow-hidden">
      
      {/* Filter Bar (Sticky top) */}
      <div className="bg-white px-4 py-3 shadow-sm border-b border-slate-200 z-20 shrink-0">
        <form onSubmit={handleSearch} className="container mx-auto flex flex-col md:flex-row gap-4 max-w-6xl">
          <input 
            type="text" 
            placeholder="Nhập tên đường, khu vực..." 
            value={q}
            onChange={e => setQ(e.target.value)}
            className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium text-slate-700 transition-all"
          />
          <select 
            value={type} 
            onChange={e => setType(e.target.value)}
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium text-slate-700 transition-all cursor-pointer"
          >
            <option value="ALL">Tất cả loại hình</option>
            <option value="RENT">Cho thuê</option>
            <option value="BUY">Mua bán</option>
          </select>
          <button type="submit" className="bg-teal-600 text-white px-8 py-2 rounded-xl font-bold hover:bg-teal-700 transition-all active:scale-95">
            Tìm kiếm
          </button>
        </form>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Results List (Left side) */}
        <div className={`w-full md:w-1/2 lg:w-5/12 xl:w-1/3 bg-white h-full overflow-y-auto custom-scrollbar p-4 md:p-6 z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)] ${isMapView ? 'hidden md:block' : 'block'}`}>
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-teal-100 border-t-teal-600"></div>
            </div>
          ) : (
            <>
              <p className="text-slate-500 font-medium mb-4">Tìm thấy <span className="font-extrabold text-teal-600">{filtered.length}</span> kết quả phù hợp</p>
              
              {filtered.length === 0 ? (
                <div className="bg-slate-50 p-10 rounded-2xl text-center border border-slate-100 border-dashed mt-6">
                  <div className="text-4xl mb-3 opacity-40">🔍</div>
                  <p className="text-slate-500 font-medium">Không tìm thấy mặt bằng nào.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-6 pb-20">
                  {filtered.map(p => {
                    const distName = districts.find(d => d.DistrictID === p.DistrictID)?.Name || '';
                    return (
                      <div 
                        key={p.PropertyID} 
                        onMouseEnter={() => setHoveredPropId(p.PropertyID)}
                        onMouseLeave={() => setHoveredPropId(null)}
                      >
                        <PropertyCard property={p} districtName={distName} />
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Map View (Right side) */}
        <div className={`w-full md:w-1/2 lg:w-7/12 xl:w-2/3 h-full bg-slate-100 relative z-0 ${isMapView ? 'block' : 'hidden md:block'}`}>
          <MapContainer center={[16.0544, 108.2022]} zoom={13} scrollWheelZoom={true} className="w-full h-full">
            <MapUpdater isMapView={isMapView} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filtered.map(p => {
               const distName = districts.find(d => d.DistrictID === p.DistrictID)?.Name || '';
               
               // Use real coords if available, otherwise fallback to dummy coords
               const coords = coordsMap[p.PropertyID] || getDummyCoords(p.PropertyID, distName);
               const isHovered = p.PropertyID === hoveredPropId;
               
               // Use a custom icon logic if we want to highlight hovered, but for now we just rely on Popup
               
               return (
                 <Marker 
                   key={`map-${p.PropertyID}`} 
                   position={coords}
                   zIndexOffset={isHovered ? 1000 : 0}
                 >
                   <Popup className="custom-popup">
                     <div className="font-sans min-w-[200px]">
                       <strong className="block text-teal-700 mb-1">{p.Street}</strong>
                       <span className="text-sm text-slate-500 block mb-2">{distName}</span>
                       <span className="font-bold text-slate-800">{p.Price} VNĐ</span>
                     </div>
                   </Popup>
                 </Marker>
               )
            })}
          </MapContainer>
        </div>

        {/* Mobile Map Toggle Button */}
        <div className="md:hidden absolute bottom-6 left-1/2 -translate-x-1/2 z-50">
          <button 
            onClick={() => setIsMapView(!isMapView)}
            className="bg-slate-900 text-white px-6 py-3 rounded-full font-bold shadow-2xl shadow-slate-900/50 flex items-center gap-2 active:scale-95 transition-transform border border-slate-700"
          >
            {isMapView ? '📄 Xem Danh Sách' : '🗺️ Xem Bản Đồ'}
          </button>
        </div>
      </div>
    </div>
  );
}

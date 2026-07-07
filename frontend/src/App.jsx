import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import District from './pages/District';
import PropertyDetail from './pages/PropertyDetail';
import Search from './pages/Search';
import Admin from './pages/Admin';
import Favorites from './pages/Favorites';
import SmartFormModal from './components/SmartFormModal';
import { useState } from 'react';

function App() {
  const [isSmartFormOpen, setIsSmartFormOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/district/:id" element={<District />} />
            <Route path="/property/:id" element={<PropertyDetail />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
        <Footer />
        
        {/* Floating Contact Buttons */}
        <div className="fixed bottom-6 right-6 flex flex-col items-end gap-4 z-50">
          
          <button onClick={() => setIsSmartFormOpen(true)} className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-5 py-3 rounded-full shadow-xl shadow-orange-500/40 hover:scale-105 transition-transform font-bold animate-pulse group">
            <span className="text-2xl group-hover:rotate-12 transition-transform">✨</span> Ký Gửi / Tìm MB
          </button>

          <div className="flex flex-col gap-3 items-end">
            <a href="https://zalo.me/0935788514" target="_blank" rel="noreferrer" className="w-14 h-14 bg-[#0068ff] rounded-full shadow-lg shadow-blue-500/40 flex items-center justify-center hover:scale-110 transition-transform group relative">
              <span className="text-white font-black text-2xl">Z</span>
              <span className="absolute right-16 bg-white text-slate-700 px-3 py-1 rounded-xl text-sm font-bold shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">Chat Zalo</span>
            </a>
            <a href="tel:0935788514" className="w-14 h-14 bg-teal-500 rounded-full shadow-lg shadow-teal-500/40 flex items-center justify-center hover:scale-110 transition-transform group relative">
              <span className="text-white text-2xl">📞</span>
              <span className="absolute right-16 bg-white text-slate-700 px-3 py-1 rounded-xl text-sm font-bold shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">Gọi ngay</span>
            </a>
          </div>
        </div>

        <SmartFormModal isOpen={isSmartFormOpen} onClose={() => setIsSmartFormOpen(false)} />
      </div>
    </BrowserRouter>
  );
}

export default App;

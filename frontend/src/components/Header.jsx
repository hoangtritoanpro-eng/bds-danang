import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFavorites } from '../hooks/useFavorites';

export default function Header() {
  const { favorites } = useFavorites();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-teal-100/50 shadow-sm transition-all h-20 md:h-24 flex items-center">
      <div className="container mx-auto px-4 flex justify-end items-center relative w-full">
        {/* Floating Logo Badge - Nổi bật thương hiệu */}
        <Link to="/" className="absolute top-2 md:top-2 left-4 md:left-0 bg-white p-2 md:p-2 rounded-xl md:rounded-2xl shadow-lg shadow-teal-900/10 border border-teal-50 hover:-translate-y-1 transition-all duration-300 group z-50">
          <img src="/logo.png" alt="Vinh BĐS" className="h-12 sm:h-14 md:h-16 object-contain group-hover:scale-105 transition-transform duration-300" />
        </Link>
        
        <nav className="flex gap-3 md:gap-6 items-center pl-[120px] md:pl-0">
          <Link to="/" className="hidden md:block text-slate-600 hover:text-teal-600 font-medium transition-colors">Trang chủ</Link>
          <Link to="/search" className="hidden md:block text-slate-600 hover:text-teal-600 font-medium transition-colors">Tìm kiếm</Link>
          
          {/* Hotline */}
          <div className="hidden lg:flex items-center gap-2 mr-2">
            <span className="text-2xl">📞</span>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Hotline Tư Vấn</span>
              <strong className="text-teal-700 leading-none">0935.788.514</strong>
            </div>
          </div>
          
          <Link to="/favorites" className="relative text-slate-600 hover:text-rose-500 font-medium transition-colors flex items-center">
            <span className="text-xl">❤️</span>
            {favorites.length > 0 && (
              <span className="absolute -top-2 -right-3 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
                {favorites.length}
              </span>
            )}
          </Link>

          <Link to="/admin" className="px-3 py-1.5 md:px-5 md:py-2.5 bg-teal-500 text-white rounded-full font-semibold shadow-md shadow-teal-500/30 hover:bg-teal-600 hover:-translate-y-0.5 transition-all text-sm md:text-base">
            Đăng tin
          </Link>
          
          {/* Mobile menu toggle */}
          <button 
            className="md:hidden text-2xl text-slate-600 w-8 h-8 flex items-center justify-center focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? '✕' : '☰'}
          </button>
        </nav>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-teal-100 shadow-xl py-4 px-6 flex flex-col gap-4 animate-fade-in origin-top">
          <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold text-slate-700 hover:text-teal-600">Trang chủ</Link>
          <Link to="/search" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold text-slate-700 hover:text-teal-600">Tìm kiếm</Link>
          
          <div className="flex items-center gap-3 pt-4 border-t border-slate-100 mt-2">
            <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 text-xl">
              📞
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Hotline Tư Vấn</span>
              <strong className="text-teal-700 text-lg leading-none">0935.788.514</strong>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

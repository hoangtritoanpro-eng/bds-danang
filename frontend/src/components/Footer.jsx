export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 mt-12 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 text-center md:text-left">
          
          <div className="md:col-span-1">
            <div className="mb-2 flex justify-center md:justify-start">
              <img src="/logo.png" alt="Vinh BĐS - Chuyên Kho Xưởng Đất Bãi" className="h-24 object-contain bg-white/10 p-3 rounded-2xl" />
            </div>
            <p className="text-slate-500 text-sm mt-4 leading-relaxed font-medium">
              Hệ thống tư vấn, môi giới, mua bán và cho thuê bất động sản, nhà xưởng, kho bãi chuyên nghiệp tại khu vực Đà Nẵng.
            </p>
          </div>

          <div className="md:col-span-1">
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Kết Nối</h4>
            <div className="flex flex-col gap-3 font-medium">
              <a href="https://zalo.me/0935788514" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-[#0068ff] transition-colors flex items-center justify-center md:justify-start gap-3 group">
                <span className="bg-[#0068ff] text-white text-[10px] w-6 h-6 flex items-center justify-center rounded font-black group-hover:scale-110 transition-transform">Z</span> 
                Zalo: 0935.788.514 - 0926.187.017
              </a>
              <a href="https://www.facebook.com/profile.php?id=100036434260526" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-blue-500 transition-colors flex items-center justify-center md:justify-start gap-3 group">
                <span className="text-blue-500 text-xl group-hover:scale-110 transition-transform">📘</span> 
                Facebook: Vinh BĐS Đà Nẵng
              </a>
              <a href="tel:0935788514" className="text-slate-400 hover:text-teal-400 transition-colors flex items-center justify-center md:justify-start gap-3 group">
                <span className="text-teal-500 text-xl group-hover:scale-110 transition-transform">📞</span> 
                Hotline: 0935.788.514 - 0926.187.017
              </a>
            </div>
          </div>

          <div className="md:col-span-1">
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Địa chỉ</h4>
            <div className="flex flex-col gap-3 text-slate-400 font-medium">
              <p className="flex items-center justify-center md:justify-start gap-3">
                <span className="text-red-400 text-xl">📍</span> Thái Thị Bôi, Thanh Khê, Đà Nẵng
              </p>
              <p className="flex items-center justify-center md:justify-start gap-3">
                <span className="text-amber-400 text-xl">⏰</span> Thời gian làm việc: 24/7
              </p>
            </div>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-800 text-center">
          <p className="text-sm text-slate-500 font-medium">© {new Date().getFullYear()} Vinh BĐS - Kho bãi Đà Nẵng. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

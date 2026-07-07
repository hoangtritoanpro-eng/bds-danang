import { useState, useEffect } from 'react';

export default function CountdownTimer({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = +new Date(targetDate) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    } else {
      timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    return timeLeft;
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearTimeout(timer);
  });

  return (
    <div className="flex flex-wrap justify-center items-center gap-2 md:gap-4 w-full">
      <div className="bg-white text-slate-800 rounded-xl px-3 py-2 md:px-4 md:py-3 shadow-lg min-w-[60px] md:min-w-[80px]">
        <div className="text-2xl md:text-3xl font-black">{String(timeLeft.days).padStart(2, '0')}</div>
        <div className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-500">Ngày</div>
      </div>
      <div className="text-white font-bold text-xl md:text-2xl">:</div>
      
      <div className="bg-white text-slate-800 rounded-xl px-3 py-2 md:px-4 md:py-3 shadow-lg min-w-[60px] md:min-w-[80px]">
        <div className="text-2xl md:text-3xl font-black">{String(timeLeft.hours).padStart(2, '0')}</div>
        <div className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-500">Giờ</div>
      </div>
      <div className="text-white font-bold text-xl md:text-2xl">:</div>
      
      <div className="bg-white text-slate-800 rounded-xl px-3 py-2 md:px-4 md:py-3 shadow-lg min-w-[60px] md:min-w-[80px]">
        <div className="text-2xl md:text-3xl font-black">{String(timeLeft.minutes).padStart(2, '0')}</div>
        <div className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-500">Phút</div>
      </div>
      <div className="text-white font-bold text-xl md:text-2xl">:</div>
      
      <div className="bg-white text-slate-800 rounded-xl px-3 py-2 md:px-4 md:py-3 shadow-lg min-w-[60px] md:min-w-[80px]">
        <div className="text-2xl md:text-3xl font-black text-rose-500">{String(timeLeft.seconds).padStart(2, '0')}</div>
        <div className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-rose-400">Giây</div>
      </div>
    </div>
  );
}

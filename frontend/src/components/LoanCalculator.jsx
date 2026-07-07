import { useState } from 'react';
import { fmtCurrency } from '../api';

export default function LoanCalculator({ price }) {
  const [percent, setPercent] = useState(30);
  const [years, setYears] = useState(20);
  const [interest, setInterest] = useState(8.5);

  const loanAmount = (price * (100 - percent)) / 100;
  const months = years * 12;
  const monthlyInterestRate = interest / 100 / 12;

  // Công thức tính số tiền trả góp hàng tháng (Gốc + Lãi chia đều)
  // M = P[r(1+r)^n]/[(1+r)^n - 1]
  let monthlyPayment = 0;
  if (monthlyInterestRate > 0) {
    monthlyPayment = loanAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, months)) / (Math.pow(1 + monthlyInterestRate, months) - 1);
  } else {
    monthlyPayment = loanAmount / months;
  }

  return (
    <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 mt-8">
      <h3 className="text-2xl font-extrabold text-slate-800 mb-6 flex items-center gap-3">
        <span className="text-3xl">💰</span> Ước tính vay mua nhà
      </h3>
      
      <div className="space-y-6">
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-bold text-slate-700">Trả trước ({percent}%)</label>
            <span className="text-teal-600 font-bold">{fmtCurrency((price * percent) / 100)}</span>
          </div>
          <input 
            type="range" min="10" max="90" step="5" 
            value={percent} onChange={e => setPercent(Number(e.target.value))}
            className="w-full accent-teal-500"
          />
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-bold text-slate-700">Thời hạn vay</label>
            <span className="text-teal-600 font-bold">{years} năm</span>
          </div>
          <input 
            type="range" min="1" max="35" step="1" 
            value={years} onChange={e => setYears(Number(e.target.value))}
            className="w-full accent-teal-500"
          />
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-bold text-slate-700">Lãi suất (%/năm)</label>
            <span className="text-teal-600 font-bold">{interest}%</span>
          </div>
          <input 
            type="range" min="4" max="15" step="0.1" 
            value={interest} onChange={e => setInterest(Number(e.target.value))}
            className="w-full accent-teal-500"
          />
        </div>

        <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 mt-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-500 font-medium">Cần vay:</span>
            <span className="text-slate-800 font-bold">{fmtCurrency(loanAmount)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">Trả góp mỗi tháng:</span>
            <span className="text-3xl font-black text-rose-500">{fmtCurrency(monthlyPayment)}</span>
          </div>
          <p className="text-xs text-slate-400 mt-4 text-center">* Số liệu chỉ mang tính chất tham khảo dựa trên dư nợ giảm dần</p>
        </div>
      </div>
    </div>
  );
}

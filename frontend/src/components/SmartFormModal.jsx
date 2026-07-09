import { useState } from 'react';
import { api } from '../api';
import { saveAs } from 'file-saver';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { MUA_BAN_TEMPLATE, THUE_KHO_TEMPLATE } from '../utils/contractTemplates';

export default function SmartFormModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1);
  const [need, setNeed] = useState(''); // RENT, BUY, CONSIGN, CONTRACT_CHOOSE, RENT_CONTRACT, BUY_CONTRACT
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [aiInput, setAiInput] = useState('');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [isAiParsing, setIsAiParsing] = useState(false);
  const [aiMode, setAiMode] = useState('auto');
  const [manualData, setManualData] = useState({ benA_Ten: '', benA_CMND: '', benA_DiaChi: '', benB_Ten: '', benB_CMND: '', benB_DiaChi: '', taiSan_DiaChi: '', taiSan_DienTich: '', gia_Tien: '', tien_Coc: '' });

  // General form for basic inquiries
  const [form, setForm] = useState({
    name: '',
    phone: '',
    message: '',
    videoUrl: '',
    image: null,
    imageName: '',
    mimeType: '',
  });

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Kích thước file không được vượt quá 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, image: reader.result, imageName: file.name, mimeType: file.type });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateAIContract = async () => {
    let finalInput = aiInput;
    if (aiMode === 'manual') {
      finalInput = `
        Bên A (Bán/Cho Thuê): Tên: ${manualData.benA_Ten}, CMND/MST: ${manualData.benA_CMND}, Địa chỉ: ${manualData.benA_DiaChi}.
        Bên B (Mua/Thuê): Tên: ${manualData.benB_Ten}, CMND/MST: ${manualData.benB_CMND}, Địa chỉ: ${manualData.benB_DiaChi}.
        Tài sản và giao dịch: Địa chỉ BĐS: ${manualData.taiSan_DiaChi}, Diện tích: ${manualData.taiSan_DienTich}, Giá tiền: ${manualData.gia_Tien}, Đặt cọc: ${manualData.tien_Coc}.
      `;
    }
    if (!finalInput.trim()) return;
    setIsAiParsing(true);
    
    try {
        const apiKey = apiKeyInput.trim() || import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) {
            alert("Lỗi: Vui lòng nhập Gemini API Key hoặc cấu hình trong file .env!");
            setIsAiParsing(false);
            return;
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" }); // Sử dụng bản 3.5 flash theo yêu cầu

        const template = need === 'RENT_CONTRACT' ? THUE_KHO_TEMPLATE : MUA_BAN_TEMPLATE;

        const prompt = `
        Bạn là một Luật sư chuyên nghiệp. 
        Nhiệm vụ của bạn là lấy "Thông tin khách hàng cung cấp" để điền vào các chỗ trống (.....) trong "Mẫu hợp đồng".
        
        Quy tắc bắt buộc:
        1. Giữ nguyên 100% câu chữ pháp lý của Mẫu hợp đồng, CHỈ THAY THẾ các chỗ trống (.....) bằng thông tin có thật. Nếu thông tin nào không có, hãy để nguyên (.....).
        2. Viết đúng chính tả tiếng Việt. Định dạng văn bản chuyên nghiệp như 1 văn bản hành chính pháp luật hiện nay.
        3. Format trả về phải là mã HTML thuần tuý (không bọc trong \`\`\`html).
        4. Sử dụng thẻ HTML chuẩn:
           - <p> cho mỗi đoạn văn.
           - <b> cho nội dung cần in đậm (Quốc hiệu, Tên Hợp Đồng, Tên các Bên).
           - <i> cho chữ in nghiêng (Địa danh, ngày tháng năm).
           - <div class="center"> cho Quốc hiệu, Tiêu ngữ và Tên hợp đồng.
           - Vẽ lại các bảng biểu bằng <table>, <tr>, <td> với border="1".
           - Phần ký tên ở cuối hợp đồng BẮT BUỘC dùng <table> chia 2 cột để chữ ký nằm ngang hàng nhau.
        
        [Mẫu Hợp Đồng Dạng Text]:
        ${template}

        [Thông tin khách hàng cung cấp]:
        ${finalInput}
        `;

        const result = await model.generateContent(prompt);
        let responseText = result.response.text();
        
        // Clean up markdown block if any
        let cleanHtml = responseText.replace(/```html/gi, '').replace(/```/g, '').trim();

        // Bao bọc HTML để MS Word hiểu nó là file doc
        const finalHtml = `
          <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
          <head><meta charset='utf-8'><title>Contract</title>
          <style>
            @page WordSection1 {
              size: 595.3pt 841.9pt; /* A4 */
              margin: 56.7pt 56.7pt 56.7pt 85.05pt; /* Top 2cm, Right 2cm, Bottom 2cm, Left 3cm */
              mso-header-margin: 35.4pt;
              mso-footer-margin: 35.4pt;
              mso-paper-source: 0;
            }
            div.WordSection1 { page: WordSection1; }
            body { 
              font-family: "Times New Roman", Times, serif; 
              font-size: 14pt; 
              line-height: 1.5; 
              text-align: justify;
            }
            p {
              margin-top: 6pt;
              margin-bottom: 6pt;
              text-align: justify;
              text-indent: 36pt; /* thụt đầu dòng 1.27cm */
            }
            table { border-collapse: collapse; width: 100%; margin-top: 12pt; margin-bottom: 12pt; }
            td, th { border: 1px solid black; padding: 6pt; vertical-align: top; text-align: left; }
            .center { text-align: center; text-indent: 0; }
            .center p { text-align: center; text-indent: 0; }
            .bold { font-weight: bold; }
          </style>
          </head><body>
          <div class="WordSection1">
          ${cleanHtml}
          </div>
          </body></html>
        `;

        // Save as .doc
        const blob = new Blob(['\ufeff', finalHtml], {
            type: 'application/msword'
        });
        
        const fileName = need === 'RENT_CONTRACT' ? 'Hop_Dong_Thue_Kho_AI.doc' : 'Hop_Dong_Mua_Ban_AI.doc';
        saveAs(blob, fileName);

        setSuccess(true);
    } catch (err) {
        alert("Lỗi AI: " + err.message);
    } finally {
        setIsAiParsing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const typeText = need === 'RENT' ? 'Cần Thuê' : need === 'BUY' ? 'Cần Mua' : 'Ký Gửi';
      await api('submitInquiry', {
        customerName: form.name,
        customerPhone: form.phone,
        note: `[${typeText}] ${form.message}${form.videoUrl ? `\n[Video]: ${form.videoUrl}` : ''}`,
        propertyId: 'SMART_FORM',
        image: form.image,
        imageName: form.imageName,
        mimeType: form.mimeType
      });
      setSuccess(true);
    } catch (err) {
      alert('Có lỗi xảy ra: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setNeed('');
    setForm({ name: '', phone: '', message: '', videoUrl: '', image: null, imageName: '', mimeType: '' });
    setAiInput('');
    setApiKeyInput('');
    setSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl relative my-auto">
        
        <button onClick={handleClose} className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-red-500 font-bold transition-colors z-20">
          ✕
        </button>

        {success ? (
          <div className="p-10 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-4xl mb-4 animate-bounce">
              ✓
            </div>
            <h3 className="text-2xl font-extrabold text-slate-800 mb-2">Thành công!</h3>
            <p className="text-slate-500 font-medium mb-8">
              {(need === 'RENT_CONTRACT' || need === 'BUY_CONTRACT') 
                ? 'Hợp đồng AI đã được tự động viết và tải xuống máy của bạn.' 
                : 'Chúng tôi đã tiếp nhận yêu cầu của bạn. Đội ngũ chuyên viên sẽ liên hệ lại trong thời gian sớm nhất.'}
            </p>
            <button onClick={handleClose} className="px-8 py-3 bg-teal-500 text-white font-bold rounded-xl hover:bg-teal-600 transition-colors shadow-lg shadow-teal-500/30 w-full">
              Hoàn tất
            </button>
          </div>
        ) : (
          <>
            <div className="px-8 pt-8 pb-6 bg-gradient-to-br from-teal-500 to-teal-400 text-white relative">
              <h2 className="text-2xl font-extrabold mb-1 relative z-10">Cổng Tư Vấn Thông Minh</h2>
              <p className="text-teal-50 font-medium opacity-90 text-sm relative z-10">Hệ thống môi giới Bất Động Sản hàng đầu Đà Nẵng</p>
              <div className="absolute right-0 top-0 text-9xl opacity-10">🏢</div>
            </div>

            <div className="flex h-1 bg-slate-100">
              <div className={`h-full bg-teal-500 transition-all duration-300 ${step === 1 ? 'w-1/3' : step === 2 ? 'w-2/3' : 'w-full'}`}></div>
            </div>

            <div className="p-8 max-h-[70vh] overflow-y-auto">
              
              {/* BƯỚC 1: Chọn dịch vụ chính */}
              {step === 1 && (
                <div className="animate-fade-in">
                  <h3 className="text-lg font-bold text-slate-800 mb-6 text-center">Bạn đang quan tâm đến dịch vụ nào?</h3>
                  
                  <div className="flex flex-col gap-4">
                    <button onClick={() => { setNeed('BUY'); setStep(2); }} className="flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-100 hover:border-teal-500 hover:bg-teal-50 transition-all group text-left">
                      <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🏡</div>
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-lg">Tôi muốn Mua</h4>
                        <p className="text-slate-500 text-sm font-medium">Tìm mua mặt bằng, đất nền, nhà kho...</p>
                      </div>
                    </button>

                    <button onClick={() => { setNeed('RENT'); setStep(2); }} className="flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-100 hover:border-teal-500 hover:bg-teal-50 transition-all group text-left">
                      <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🔑</div>
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-lg">Tôi muốn Thuê</h4>
                        <p className="text-slate-500 text-sm font-medium">Tìm thuê mặt bằng kinh doanh, kho bãi...</p>
                      </div>
                    </button>

                    <button onClick={() => { setNeed('CONSIGN'); setStep(2); }} className="flex items-center gap-4 p-4 rounded-2xl border-2 border-slate-100 hover:border-teal-500 hover:bg-teal-50 transition-all group text-left">
                      <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🤝</div>
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-lg">Tôi muốn Ký Gửi</h4>
                        <p className="text-slate-500 text-sm font-medium">Giao bán/Cho thuê Bất Động Sản của bạn</p>
                      </div>
                    </button>
                    
                    <button onClick={() => { setNeed('CONTRACT_CHOOSE'); setStep(2); }} className="flex items-center gap-4 p-4 rounded-2xl border-2 border-purple-200 bg-purple-50 hover:border-purple-500 hover:bg-purple-100 transition-all group text-left">
                      <div className="w-12 h-12 rounded-full bg-purple-200 text-purple-700 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">🤖</div>
                      <div>
                        <h4 className="font-extrabold text-purple-800 text-lg">AI Viết Hợp Đồng</h4>
                        <p className="text-purple-600 text-sm font-medium">Tự động viết 100% bằng Trí tuệ nhân tạo</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* BƯỚC 2 (Nhánh AI): Chọn loại hợp đồng */}
              {step === 2 && need === 'CONTRACT_CHOOSE' && (
                <div className="animate-fade-in">
                  <div className="flex items-center gap-3 mb-6">
                    <button onClick={() => setStep(1)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors font-bold">←</button>
                    <h3 className="text-lg font-bold text-slate-800">Chọn mẫu hợp đồng AI</h3>
                  </div>
                  
                  <div className="flex flex-col gap-4">
                    <button onClick={() => { setNeed('BUY_CONTRACT'); setStep(3); }} className="p-4 rounded-xl border border-slate-200 hover:border-teal-500 text-left transition-all group">
                      <h4 className="font-bold text-slate-800 text-lg group-hover:text-teal-600">📝 Mẫu Hợp Đồng Mua Bán Nhà Đất</h4>
                      <p className="text-slate-500 text-sm mt-1">Sử dụng form chuẩn "Mua Bán Nhà Đất Vinh 1".</p>
                    </button>
                    
                    <button onClick={() => { setNeed('RENT_CONTRACT'); setStep(3); }} className="p-4 rounded-xl border border-slate-200 hover:border-teal-500 text-left transition-all group">
                      <h4 className="font-bold text-slate-800 text-lg group-hover:text-teal-600">🏭 Mẫu Hợp Đồng Thuê Kho Xưởng</h4>
                      <p className="text-slate-500 text-sm mt-1">Sử dụng form chuẩn "Thuê Kho Dương Sơn 3".</p>
                    </button>
                  </div>
                </div>
              )}

              {/* BƯỚC 3 (Nhánh AI): Giao diện AI Viết Hợp Đồng */}
              {step === 3 && (need === 'RENT_CONTRACT' || need === 'BUY_CONTRACT') && (
                <div className="animate-fade-in space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <button type="button" onClick={() => { setStep(2); setNeed('CONTRACT_CHOOSE'); }} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors font-bold">←</button>
                    <h3 className="text-lg font-bold text-purple-800">
                      {need === 'RENT_CONTRACT' ? 'AI Viết HĐ Thuê Kho' : 'AI Viết HĐ Mua Bán'}
                    </h3>
                  </div>

                  <div className="bg-purple-50 border border-purple-100 p-5 rounded-2xl relative overflow-hidden shadow-inner">
                    <div className="absolute top-0 right-0 p-2 text-purple-200 opacity-20">
                      <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                    </div>
                    
                    <div className="mb-4 relative z-10">
                      <label className="block text-xs font-bold text-purple-700 mb-1">Gemini API Key (Bắt buộc)</label>
                      <input 
                        type="password" 
                        value={apiKeyInput}
                        onChange={e => setApiKeyInput(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-purple-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 text-sm" 
                        placeholder="Nhập API Key bắt đầu bằng AIza..." 
                      />
                      <p className="text-[11px] text-purple-500 mt-1">Lấy key miễn phí tại <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="underline hover:text-purple-700">Google AI Studio</a>.</p>
                    </div>

                    
                    <div className="relative z-10 mb-4 bg-white rounded-xl p-1 shadow-sm border border-purple-100 flex">
                      <button type="button" onClick={() => setAiMode('auto')} className={`flex-1 text-sm font-bold py-2 rounded-lg transition-colors ${aiMode === 'auto' ? 'bg-purple-100 text-purple-700' : 'text-slate-500 hover:bg-slate-50'}`}>Dán Tin Nhắn Nháp</button>
                      <button type="button" onClick={() => setAiMode('manual')} className={`flex-1 text-sm font-bold py-2 rounded-lg transition-colors ${aiMode === 'manual' ? 'bg-purple-100 text-purple-700' : 'text-slate-500 hover:bg-slate-50'}`}>Nhập Form Thủ Công</button>
                    </div>

                    <div className="relative z-10">
                      {aiMode === 'auto' ? (
                        <>
                          <label className="block text-xs font-bold text-purple-700 mb-1">Dữ liệu khách hàng (Copy từ Zalo)</label>
                          <textarea 
                            value={aiInput}
                            onChange={e => setAiInput(e.target.value)}
                            rows="6" 
                            className="w-full px-4 py-3 bg-white border border-purple-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-sm shadow-sm" 
                            placeholder="Hãy copy đoạn chat thả vào đây...
Ví dụ: Khách Nguyễn Văn A mua nhà giá 5 tỷ..."
                          ></textarea>
                        </>
                      ) : (
                        <div className="space-y-3 bg-white p-4 rounded-xl border border-purple-200 shadow-sm h-[300px] overflow-y-auto custom-scrollbar">
                          <h4 className="font-bold text-purple-800 text-sm border-b pb-1">👤 Bên A (Bán/Cho Thuê)</h4>
                          <input type="text" placeholder="Họ Tên / Công ty" className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" value={manualData.benA_Ten} onChange={e=>setManualData({...manualData, benA_Ten: e.target.value})} />
                          <input type="text" placeholder="CMND / CCCD / MST" className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" value={manualData.benA_CMND} onChange={e=>setManualData({...manualData, benA_CMND: e.target.value})} />
                          <input type="text" placeholder="Địa chỉ thường trú" className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" value={manualData.benA_DiaChi} onChange={e=>setManualData({...manualData, benA_DiaChi: e.target.value})} />
                          
                          <h4 className="font-bold text-purple-800 text-sm border-b pb-1 mt-4">👤 Bên B (Mua/Thuê)</h4>
                          <input type="text" placeholder="Họ Tên / Công ty" className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" value={manualData.benB_Ten} onChange={e=>setManualData({...manualData, benB_Ten: e.target.value})} />
                          <input type="text" placeholder="CMND / CCCD / MST" className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" value={manualData.benB_CMND} onChange={e=>setManualData({...manualData, benB_CMND: e.target.value})} />
                          <input type="text" placeholder="Địa chỉ thường trú" className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" value={manualData.benB_DiaChi} onChange={e=>setManualData({...manualData, benB_DiaChi: e.target.value})} />

                          <h4 className="font-bold text-purple-800 text-sm border-b pb-1 mt-4">🏢 Tài Sản & Giao Dịch</h4>
                          <input type="text" placeholder="Địa chỉ BĐS" className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" value={manualData.taiSan_DiaChi} onChange={e=>setManualData({...manualData, taiSan_DiaChi: e.target.value})} />
                          <input type="text" placeholder="Diện tích (m2)" className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" value={manualData.taiSan_DienTich} onChange={e=>setManualData({...manualData, taiSan_DienTich: e.target.value})} />
                          <input type="text" placeholder="Giá tiền / Giá thuê" className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" value={manualData.gia_Tien} onChange={e=>setManualData({...manualData, gia_Tien: e.target.value})} />
                          <input type="text" placeholder="Tiền cọc" className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" value={manualData.tien_Coc} onChange={e=>setManualData({...manualData, tien_Coc: e.target.value})} />
                        </div>
                      )}
                    </div>


                    <button 
                      type="button" 
                      onClick={handleGenerateAIContract}
                      disabled={isAiParsing}
                      className="mt-4 w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-500/40 disabled:opacity-50 relative z-10 flex items-center justify-center gap-2"
                    >
                      {isAiParsing ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          Đang Viết Hợp Đồng (Khoảng 5-10s)...
                        </>
                      ) : '✨ AI Bắt Đầu Viết & Tải File Word'}
                    </button>
                    <p className="text-center text-xs text-purple-600/70 mt-3 font-medium relative z-10">
                      Sử dụng trí tuệ nhân tạo Gemini 3.5 Flash siêu tốc
                    </p>
                  </div>
                </div>
              )}

              {/* BƯỚC 2 (Nhánh Form Thường) */}
              {step === 2 && ['BUY', 'RENT', 'CONSIGN'].includes(need) && (
                <form onSubmit={handleSubmit} className="animate-fade-in space-y-5">
                  <div className="flex items-center gap-3 mb-6">
                    <button type="button" onClick={() => setStep(1)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors font-bold">←</button>
                    <h3 className="text-lg font-bold text-slate-800">
                      {need === 'BUY' ? 'Thông tin nhu cầu Mua' : need === 'RENT' ? 'Thông tin nhu cầu Thuê' : 'Thông tin BĐS Ký Gửi'}
                    </h3>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Họ và Tên *</label>
                    <input type="text" required value={form.name} onChange={e=>setForm({...form, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 font-medium text-slate-800 transition-all" placeholder="Nhập tên của bạn" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Số Điện Thoại (Zalo) *</label>
                    <input type="tel" required value={form.phone} onChange={e=>setForm({...form, phone: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 font-medium text-slate-800 transition-all" placeholder="0987.xxx.xxx" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Mô tả chi tiết *</label>
                    <textarea required value={form.message} onChange={e=>setForm({...form, message: e.target.value})} rows="4" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 font-medium text-slate-800 transition-all" placeholder={need === 'CONSIGN' ? 'Mô tả vị trí, diện tích, giá mong muốn...' : 'Mô tả nhu cầu, khu vực, tầm tài chính của bạn...'}></textarea>
                  </div>
                  {need === 'CONSIGN' && (
                    <>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Link Video (Youtube/Tiktok - Tùy chọn)</label>
                        <input type="text" value={form.videoUrl} onChange={e=>setForm({...form, videoUrl: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 font-medium text-slate-800 transition-all" placeholder="Dán link video mặt bằng của bạn..." />
                      </div>
                      <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Tải ảnh mặt bằng (Tùy chọn)</label>
                      <input type="file" accept="image/*" onChange={handleFileChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 font-medium text-slate-800 transition-all text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100" />
                      {form.image && <p className="text-xs text-teal-600 mt-2 font-medium">Đã chọn ảnh: {form.imageName}</p>}
                    </div>
                    </>
                  )}

                  <button type="submit" disabled={loading} className="w-full mt-4 flex justify-center py-3.5 px-4 rounded-xl shadow-lg shadow-teal-500/30 text-base font-bold text-white bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-600 hover:to-teal-500 focus:outline-none hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50">
                    {loading ? 'Đang gửi...' : 'Gửi Yêu Cầu Chuyên Viên'}
                  </button>
                </form>
              )}

            </div>
          </>
        )}
      </div>
    </div>
  );
}

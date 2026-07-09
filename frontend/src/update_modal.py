import re

with open(r"C:\Users\hoang\Downloads\TOAN\duanvinhbds\bds-danang\frontend\src\components\SmartFormModal.jsx", "r", encoding="utf-8") as f:
    content = f.read()

# Add state variables
content = content.replace(
    "const [isAiParsing, setIsAiParsing] = useState(false);",
    "const [isAiParsing, setIsAiParsing] = useState(false);\n  const [aiMode, setAiMode] = useState('auto');\n  const [manualData, setManualData] = useState({ benA_Ten: '', benA_CMND: '', benA_DiaChi: '', benB_Ten: '', benB_CMND: '', benB_DiaChi: '', taiSan_DiaChi: '', taiSan_DienTich: '', gia_Tien: '', tien_Coc: '' });"
)

# Update handleGenerateAIContract
content = content.replace(
    "if (!aiInput.trim()) return;",
    """let finalInput = aiInput;
    if (aiMode === 'manual') {
      finalInput = `
        Bên A (Bán/Cho Thuê): Tên: ${manualData.benA_Ten}, CMND/MST: ${manualData.benA_CMND}, Địa chỉ: ${manualData.benA_DiaChi}.
        Bên B (Mua/Thuê): Tên: ${manualData.benB_Ten}, CMND/MST: ${manualData.benB_CMND}, Địa chỉ: ${manualData.benB_DiaChi}.
        Tài sản và giao dịch: Địa chỉ BĐS: ${manualData.taiSan_DiaChi}, Diện tích: ${manualData.taiSan_DienTich}, Giá tiền: ${manualData.gia_Tien}, Đặt cọc: ${manualData.tien_Coc}.
      `;
    }
    if (!finalInput.trim()) return;"""
)
content = content.replace(
    "${aiInput}",
    "${finalInput}"
)

# Update UI to add tabs
old_ui = """<div className="relative z-10">
                      <label className="block text-xs font-bold text-purple-700 mb-1">Dữ liệu khách hàng (Tin nhắn nháp)</label>
                      <textarea 
                        value={aiInput}
                        onChange={e => setAiInput(e.target.value)}
                        rows="6" 
                        className="w-full px-4 py-3 bg-white border border-purple-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-sm shadow-sm" 
                        placeholder="Hãy copy đoạn chat từ Zalo thả vào đây...\\nVí dụ: Khách Nguyễn Văn A sinh 1990 mua căn nhà Vinh 1 từ ông Phạm Văn B giá 5 tỷ..."
                      ></textarea>
                    </div>"""

new_ui = """
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
                            placeholder="Hãy copy đoạn chat thả vào đây...\\nVí dụ: Khách Nguyễn Văn A mua nhà giá 5 tỷ..."
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
"""

# We need to correctly find and replace
# It's safer to use regex since the textarea might contain literal \n
content = re.sub(
    r'<div className="relative z-10">\s*<label className="block text-xs font-bold text-purple-700 mb-1">Dữ liệu khách hàng \(Tin nhắn nháp\).*?</textarea>\s*</div>',
    new_ui,
    content,
    flags=re.DOTALL
)

with open(r"C:\Users\hoang\Downloads\TOAN\duanvinhbds\bds-danang\frontend\src\components\SmartFormModal.jsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Updated successfully")

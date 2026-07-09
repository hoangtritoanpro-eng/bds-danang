import re

with open(r"C:\Users\hoang\Downloads\TOAN\duanvinhbds\bds-danang\frontend\src\components\SmartFormModal.jsx", "r", encoding="utf-8") as f:
    content = f.read()

new_prompt = r"""        const prompt = `
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
        `;"""

content = re.sub(
    r"        const prompt = `.*?        `;",
    new_prompt,
    content,
    flags=re.DOTALL
)

new_html = r"""        // Bao bọc HTML để MS Word hiểu nó là file doc
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
        `;"""

content = re.sub(
    r"        // Bao bọc HTML để MS Word hiểu nó là file doc\s*const finalHtml = `.*?        `;",
    new_html,
    content,
    flags=re.DOTALL
)

with open(r"C:\Users\hoang\Downloads\TOAN\duanvinhbds\bds-danang\frontend\src\components\SmartFormModal.jsx", "w", encoding="utf-8") as f:
    f.write(content)

print("Updated formatting successfully")

const BASE_URL = import.meta.env.VITE_GAS_URL;

export async function api(action, data = {}, userEmail = '') {
  if (!BASE_URL) throw new Error('VITE_GAS_URL chưa được cấu hình trong file .env');
  const response = await fetch(BASE_URL, {
    method: 'POST',
    redirect: 'follow',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action, authEmail: userEmail, email: userEmail, ...data }),
  });
  const json = await response.json();
  if (!json.ok) throw new Error(json.error || 'Lỗi không xác định');
  return json.data;
}

export const fmtCurrency = (n) => {
  if (!n) return 'Liên hệ';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(n));
};

export const fmtDate = (d) => {
  if (!d) return '';
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
};

export const today = () => new Date().toISOString().slice(0, 10);

export const getImgUrl = (url) => {
  if (!url) return 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&q=80';
  
  if (url.includes('drive.google.com') || url.includes('docs.google.com')) {
    // Thử lấy ID từ dạng /file/d/ID/view
    const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      return `https://lh3.googleusercontent.com/d/${fileIdMatch[1]}`;
    }
    // Thử lấy ID từ tham số id=ID
    const idParamMatch = url.match(/id=([a-zA-Z0-9_-]+)/);
    if (idParamMatch && idParamMatch[1]) {
      return `https://lh3.googleusercontent.com/d/${idParamMatch[1]}`;
    }
  }
  
  return url.trim();
};

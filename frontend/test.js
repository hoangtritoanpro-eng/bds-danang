const BASE_URL = 'https://script.google.com/macros/s/AKfycbwzQM5uh_GYLFs-JUvFnV3UkOE0K_mPyHT1QBr2L8kOX9gQ4FpyDHb7sQXAQhNmMJzI/exec';
fetch(BASE_URL, {
  method: 'POST',
  redirect: 'follow',
  headers: { 'Content-Type': 'text/plain;charset=utf-8' },
  body: JSON.stringify({ action: 'login', email: 'admin@bds.com', pin: '1234' })
}).then(r => r.json()).then(console.log).catch(console.error);

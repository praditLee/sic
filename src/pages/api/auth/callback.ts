import { getSessionClient } from '../../../lib/supabase';

export async function GET({ request, cookies, redirect }) {
  console.log("🚨 --- ด่านตรวจ Callback ทำงานแล้ว ---");
  
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  console.log("🎫 รหัส Code ที่ได้จาก Google:", code ? "มีรหัส" : "ไม่มีรหัส!!");
  console.log("🍪 Cookies ที่พกมาด้วย:", request.headers.get('Cookie') ? "มีข้อมูล" : "ว่างเปล่า!!");

  if (code) {
    const supabase = getSessionClient(request, cookies);
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      console.log("✅ ยืนยันสำเร็จ! กำลังวาร์ปไปหน้า /check-profile");
      return redirect('/check-profile'); 
    } else {
      // ❌ ตรงนี้แหละครับที่จะบอกว่าพังเพราะอะไร!
      console.error("❌ ด่านตรวจพบ Error:", error.message);
    }
  }

  console.log("🔙 กำลังเตะกลับหน้า Login...");
  return redirect('/login');
}
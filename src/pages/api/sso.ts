import { getSessionClient } from '../../lib/supabase';
import { SignJWT } from 'jose';

// ✅ 1. เพิ่ม `cookies` เข้ามาเป็นพารามิเตอร์
export const POST = async ({ request, cookies }) => {
  try {
    // ✅ 2. เรียกใช้ Supabase แบบที่อ่าน Cookies ได้ (ไม่ต้องใช้ createClient แบบเก่าแล้ว)
    const supabase = getSessionClient(request, cookies);

    // ✅ 3. เช็คสถานะ User จาก Cookies ได้เลย (ไม่ต้องง้อ access_token จากหน้าเว็บ)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    // ถ้าไม่มี User ใน Cookies ให้เตะออก
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized: กรุณาล็อกอินใหม่" }), { status: 401 });
    }

    // --- ตั้งแต่ตรงนี้ลงไป โค้ดของคุณเขียนไว้ได้ดีและสมบูรณ์แบบมากครับ ใช้แบบเดิมได้เลย! ---

    // 4. ดึงชื่อ-นามสกุลภาษาอังกฤษจากตาราง profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name_en, last_name_en')
      .eq('id', user.id)
      .single();

    // 5. เตรียมข้อมูลที่จะพิมพ์ลงในตั๋ว (SSO Payload)
    const payload = {
      email: user.email,
      first_name: profile?.first_name_en || "Student", // เผื่อกันเหนียวไว้
      last_name: profile?.last_name_en || "",
      iat: Math.floor(Date.now() / 1000),
    };

    // 6. นำกุญแจลับของ Thinkific มาสร้างตั๋ว JWT
    const secret = new TextEncoder().encode(import.meta.env.THINKIFIC_SSO_SECRET);
    const jwt = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt() 
      .sign(secret);

    // 7. สร้างลิงก์ส่งตัว (URL) กลับไปให้หน้าเว็บ
    const subdomain = import.meta.env.THINKIFIC_SUBDOMAIN;
    const returnUrl = `https://${subdomain}.thinkific.com/collections`; 
    const ssoUrl = `https://${subdomain}.thinkific.com/api/sso/v2/sso/jwt?jwt=${jwt}&return_to=${encodeURIComponent(returnUrl)}`;

    // ส่งลิงก์กลับไป
    return new Response(JSON.stringify({ url: ssoUrl }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("SSO Error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
};
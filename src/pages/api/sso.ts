import { SignJWT } from 'jose';
import { createClient } from '@supabase/supabase-js';

export const POST = async ({ request }) => {
  try {
    // 1. รับค่า Token ที่ส่งมาจากหน้าเช็คโปรไฟล์
    const body = await request.json();
    const { access_token } = body;

    if (!access_token) {
      return new Response(JSON.stringify({ error: "Missing token" }), { status: 400 });
    }

    // 2. ยืนยันตัวตนกับ Supabase และดึงข้อมูลผู้ใช้
    const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
    const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: { user }, error: authError } = await supabase.auth.getUser(access_token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), { status: 401 });
    }

    // 3. ดึงชื่อ-นามสกุลภาษาอังกฤษจากตาราง profiles (เพื่อเอาไปทำ Certificate)
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name_en, last_name_en')
      .eq('id', user.id)
      .single();

    // 4. เตรียมข้อมูลที่จะพิมพ์ลงในตั๋ว (SSO Payload)
    // *ถ้าไม่มีชื่อภาษาอังกฤษ ให้ใช้คำว่า Student ไปก่อน (กัน Error)
    const payload = {
      email: user.email,
      first_name: profile?.first_name_en || "Student",
      last_name: profile?.last_name_en || "",
    };

    // 5. นำกุญแจลับของ Thinkific มาสร้างตั๋ว JWT
    const secret = new TextEncoder().encode(import.meta.env.THINKIFIC_SSO_SECRET);
    const jwt = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt() // ใส่เวลาที่ออกตั๋ว
      .sign(secret);

    // 6. สร้างลิงก์ส่งตัว (URL) กลับไปให้หน้าเว็บ
    const subdomain = import.meta.env.THINKIFIC_SUBDOMAIN;
    const returnUrl = `https://${subdomain}.thinkific.com/collections`; // หน้าที่อยากให้โผล่ไปหลังล็อกอินสำเร็จ
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
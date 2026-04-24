// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { createBrowserClient, createServerClient, parseCookieHeader } from '@supabase/ssr';

// ดึงค่า URL และ Key
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

// 🟢 ตัวที่ 1 (ของเดิม): สำหรับใช้งานฝั่งหน้าบ้าน (Client-side)
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
// 🔵 ตัวที่ 2 (ของใหม่): สำหรับใช้งานฝั่งหลังบ้าน (Server-side / Astro SSR)
export const getSessionClient = (request: Request, cookies: any) => {
  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(request.headers.get('Cookie') ?? '');
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            // เช็คเพื่อให้ชัวร์ว่าเซิร์ฟเวอร์สามารถเขียน Cookie ได้จริงๆ
            if (typeof cookies.set === 'function') {
              cookies.set(name, value, options);
            }
          });
        },
      },
    }
  );
};
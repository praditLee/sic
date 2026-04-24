// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// ดึงค่า URL และ Key มาจากไฟล์ .env ที่เราสร้างไว้
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

// สร้างตัวเชื่อมต่อ
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
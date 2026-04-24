import { getSessionClient } from '../../lib/supabase';

export async function GET({ request, cookies, redirect }) {
  const supabase = getSessionClient(request, cookies);
  
  // สั่งเคลียร์ Session และลบ Cookies ทิ้ง
  await supabase.auth.signOut();
  
  // เตะกลับไปหน้าแรก (Home)
  return redirect('/');
}
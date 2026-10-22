import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { isActiveStaff } from "@/lib/auth/roles";
const COOKIE = "bossque_cafe_session";
export async function POST(request: Request) {
  try { const token=(await request.json())?.idToken; const decoded=await adminAuth.verifyIdToken(token); const snap=await adminDb.doc(`users/${decoded.uid}`).get(); const user=snap.data(); const bid=process.env.NEXT_PUBLIC_BUSINESS_ID??"bossque-cafe"; if(!snap.exists||!isActiveStaff(user)||(user.businessIds&&!user.businessIds.includes(bid)))throw new Error(); const hours=Number(process.env.SESSION_COOKIE_MAX_AGE_HOURS??12); const value=await adminAuth.createSessionCookie(token,{expiresIn:Math.min(Math.max(hours,1),24)*3600000}); const r=Response.json({ok:true}); r.headers.append("Set-Cookie",`${COOKIE}=${value}; Max-Age=${hours*3600}; Path=/; HttpOnly; Secure; SameSite=Lax`); return r; } catch { return Response.json({error:"Login failed or account not allowed"},{status:401}); }
}
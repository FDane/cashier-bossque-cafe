import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { isActiveStaff, resolvePosRole } from "@/lib/auth/roles";
import type { PosRole, SharedUser, StaffIdentity } from "@/types/models";
export const SESSION_COOKIE = "bossque_cafe_session";
export async function getSessionUser() {
  const value = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!value) return null;
  try {
    const decoded = await adminAuth.verifySessionCookie(value, true);
    const snap = await adminDb.doc(`users/${decoded.uid}`).get();
    const user = { uid: decoded.uid, ...(snap.data() ?? {}) } as SharedUser;
    const businessId = process.env.NEXT_PUBLIC_BUSINESS_ID ?? "bossque-cafe";
    if (!snap.exists || !isActiveStaff(user) || (user.businessIds && !user.businessIds.includes(businessId))) return null;
    // Keep Firestore SDK values and sensitive profile fields on the server.
    // Only this plain, serializable identity is exposed to the UI.
    const identity: StaffIdentity = {
      isAdmin: user.isAdmin === true || resolvePosRole(user) === "ADMIN",
      uid: decoded.uid,
      name: user.name,
      email: user.email,
      position: user.position,
      profileImage: user.profileImage,
    };
    return { uid: decoded.uid, user: identity, role: resolvePosRole(user), businessId, db: adminDb };
  } catch { return null; }
}
export async function requireSession(roles?: PosRole[]) {
  const session = await getSessionUser();
  if (!session) throw new Error("UNAUTHENTICATED");
  if (roles && !roles.includes(session.role)) throw new Error("FORBIDDEN");
  return session;
}
export async function requireAdminSession() {
  const session = await requireSession();
  if (!session.user.isAdmin) throw new Error("FORBIDDEN");
  return session;
}
export const jsonError = (error: unknown) => {
  const message = error instanceof Error ? error.message : "Request failed";
  const status =
    message === "UNAUTHENTICATED" ? 401 : message === "FORBIDDEN" ? 403 : 400;
  return Response.json({ error: message }, { status });
};

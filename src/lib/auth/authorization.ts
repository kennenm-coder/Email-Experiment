export function isAuthorizedTenant(tid: string | undefined): boolean {
  return tid === process.env.ALLOWED_TENANT_ID;
}

export function isAuthorizedUser(oid: string | undefined): boolean {
  return oid === process.env.ALLOWED_USER_OBJECT_ID;
}

export function validateAuthorization(
  tid: string | undefined,
  oid: string | undefined
): { authorized: boolean; reason?: string } {
  if (!tid) {
    return { authorized: false, reason: "Missing tenant ID in token" };
  }
  if (!oid) {
    return { authorized: false, reason: "Missing user object ID in token" };
  }
  if (!isAuthorizedTenant(tid)) {
    return { authorized: false, reason: `Tenant ${tid} is not allowed` };
  }
  if (!isAuthorizedUser(oid)) {
    return { authorized: false, reason: `User ${oid} is not authorized` };
  }
  return { authorized: true };
}

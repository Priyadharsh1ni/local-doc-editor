export function canEdit(role: string) {
  return role === "OWNER" || role === "EDITOR";
}
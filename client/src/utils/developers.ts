const developerIds = (import.meta.env.VITE_DEVELOPER_USER_IDS ?? "")
  .split(",")
  .map((id: string) => id.trim())
  .filter(Boolean);

export function isDeveloper(id: string | undefined): boolean {
  if (!id) return false;

  return developerIds.includes(id.trim());
}
export function generateId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // fallback universal
  return "id-" + Date.now() + "-" + Math.random().toString(16).slice(2);
}

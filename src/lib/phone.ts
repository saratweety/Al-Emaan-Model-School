export function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) {
    return /^\+\d{10,15}$/.test(digits) ? digits : null;
  }

  const bare = digits.replace(/^0+/, "");
  if (/^3\d{9}$/.test(bare)) return `+92${bare}`;
  if (/^92\d{10}$/.test(digits)) return `+${digits}`;

  return null;
}

export function isLikelyPhone(value: string): boolean {
  return !value.includes("@") && /\d{7,}/.test(value.replace(/\D/g, ""));
}

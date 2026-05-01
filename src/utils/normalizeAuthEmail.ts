const base64UrlEncode = (input: string) => {
  const base64 = btoa(unescape(encodeURIComponent(input)));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
};

const isProbablySupabaseOkEmail = (email: string) => {
  const trimmed = email.trim();
  const match = trimmed.match(/^([^@\s]+)@([^@\s]+)$/);
  if (!match) return false;
  const domain = match[2];
  const parts = domain.split(".");
  if (parts.length < 2) return false;
  const tld = parts[parts.length - 1];
  return tld.length >= 2;
};

export const normalizeAuthEmail = (rawEmail: string) => {
  const trimmed = rawEmail.trim();
  if (!trimmed) return "";

  // If it already looks acceptable to typical validators, keep as-is.
  if (isProbablySupabaseOkEmail(trimmed)) return trimmed;

  // Try to minimally "fix" short/absent TLDs while keeping the user input mostly intact.
  const atIndex = trimmed.indexOf("@");
  if (atIndex > 0 && atIndex < trimmed.length - 1) {
    const local = trimmed.slice(0, atIndex);
    const domain = trimmed.slice(atIndex + 1);
    if (domain.includes(".")) {
      const parts = domain.split(".");
      const tld = parts[parts.length - 1] || "";
      if (tld.length < 2) {
        parts[parts.length - 1] = (tld || "x") + "x";
      }
      return `${local}@${parts.join(".")}`;
    }
    return `${local}@${domain}.local`;
  }

  // Fallback: encode the whole input into a safe email local-part.
  const token = base64UrlEncode(trimmed).slice(0, 50);
  return `u_${token}@local.invalid`;
};


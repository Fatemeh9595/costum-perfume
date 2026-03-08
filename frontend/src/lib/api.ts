const configuredApiBase = (import.meta.env.VITE_API_BASE_URL ?? "").trim();

export function apiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const base = configuredApiBase.replace(/\/+$/, "");

  if (base.length === 0) {
    return normalizedPath;
  }

  return `${base}${normalizedPath}`;
}

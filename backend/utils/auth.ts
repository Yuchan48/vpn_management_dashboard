export function extractJwtFromCookie(
  cookieHeader: string | undefined,
): string | null {
  if (!cookieHeader) return null;

  const cookies = cookieHeader
    .split(";")
    .reduce((acc: Record<string, string>, cookie) => {
      const [key, value] = cookie.split("=").map((part) => part.trim());
      acc[key] = decodeURIComponent(value);
      return acc;
    }, {});

  return cookies.token || null;
}

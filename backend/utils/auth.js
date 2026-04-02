function extractJtwFromCookie(cookieHeader) {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
    const [key, value] = cookie.split("=").map((part) => part.trim());
    acc[key] = decodeURIComponent(value);
    return acc;
  }, {});

  return cookies.token || null;
}

module.exports = {
  extractJtwFromCookie,
};

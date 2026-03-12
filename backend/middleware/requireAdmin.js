function requireAdmin(req, res, next) {
  // Check if the user role is present. If not, the user is not authenticated properly.
  if (!req.user.role) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Check if the user role is "admin". If not, deny access.
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: Admins only" });
  }
  next();
}

module.exports = requireAdmin;

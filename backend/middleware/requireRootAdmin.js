function requireRootAdmin(req, res, next) {
  // Check if the user role is present. If not, the user is not authenticated properly.
  if (!req.user.role) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Check if the user role is "admin" and user ID is 1 (root admin). If not, deny access.
  if (req.user.role !== "admin" || req.user.id !== 1) {
    return res
      .status(403)
      .json({
        error: "Forbidden: Only the root admin can perform this action",
      });
  }
  next();
}

module.exports = requireRootAdmin;

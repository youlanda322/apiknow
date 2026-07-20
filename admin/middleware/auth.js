function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  if (req.path.startsWith('/login')) {
    return next();
  }
  res.redirect('/login');
}

module.exports = { requireAuth };

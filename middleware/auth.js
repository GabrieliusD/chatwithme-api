module.exports = {
  ensureAuth: (req, res, next) => {
    if (req.isAuthenticated()) {
      console.log("authenticated");
      return next();
    } else {
      console.log("unauthenticated");
      res.redirect("/");
    }
  },
};

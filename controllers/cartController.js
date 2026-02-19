// Serves the Cart Page Shell
exports.getCartPage = (req, res) => {
  res.render("userPages/userCart", { user: req.user || null });
};

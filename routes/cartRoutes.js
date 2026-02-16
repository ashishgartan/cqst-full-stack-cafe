const router = require("./orderRoutes");

// Show the shopping bag page
router.get("/cart", (req, res) => {
  res.render("userCart"); // user is already available via res.locals middleware
});

module.exports = router;

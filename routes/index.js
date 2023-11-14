var express = require("express")
var router = express.Router()
const UserModel = require("./users")
const PostModel = require("./posts")
const localStrategy = require("passport-local")
const passport = require("passport")
passport.use(new localStrategy(UserModel.authenticate()))

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" })
})
router.get("/feed", function (req, res, next) {
  res.render("feed")
})

router.get("/profile", isLoggedIn, function (req, res, next) {
  res.render("profile")
})
router.get("/login", function (req, res, next) {
  res.render("login")
})

router.post("/register", function (req, res, next) {
  const { username, email, fullname } = req.body
  const userData = new UserModel({ username, email, fullname })

  UserModel.register(userData, req.body.password).then(function () {
    passport.authenticate("local")(req, res, function () {
      res.redirect("/profile")
    })
  })
})

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/login",
  }),
  function (req, res) {}
)
router.get("/logout", function (req, res) {
  req.logOut(function (err) {
    if (err) {
      return next(err)
    }
    res.redirect("/login")
  })
})

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next()
  res.redirect("/")
}

module.exports = router

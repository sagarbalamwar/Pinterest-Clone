var express = require("express")
var router = express.Router()
const UserModel = require("./users")
const PostModel = require("./posts")
const localStrategy = require("passport-local")
const passport = require("passport")
const upload = require("./multer")
passport.use(new localStrategy(UserModel.authenticate()))

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" })
})
router.get("/feed", function (req, res, next) {
  res.render("feed")
})

router.post(
  "/upload",
  isLoggedIn,
  upload.single("file"),
  async function (req, res, next) {
    if (!req.file) {
      return res.status(400).send("No files were uploaded")
    }
    res.send("File uploaded successfully")
    const user = await UserModel.findOne({
      username: req.session.passport.user,
    })
    const post = await PostModel.create({
      image: req.file.filename,
      imageText: req.body.filecaption,
      user: user._id,
    })
    user.posts.push(post._id)
    await user.save()
    res.redirect("/profile")
  }
)

router.get("/profile", isLoggedIn, async function (req, res, next) {
  let user = await UserModel.findOne({
    username: req.session.passport.user,
  }).populate("posts")
  console.log(user)

  res.render("profile", { user })
})
router.get("/login", function (req, res, next) {
  res.render("login", { error: req.flash("error") })
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
    failureFlash: true,
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

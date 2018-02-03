const express = require("express");
const router = express.Router();
const { JWT_KEY } = require("../../newKeys");
const checkAuth = require("../middleware/checkAuth");

const UserController = require("../controllers/user");

router.post("/signup", UserController.user_signup);

router.post("/login", UserController.user_login);

router.delete("/:userId", checkAuth, UserController.user_delete);

module.exports = router;

const bcrypt = require("bcryptjs");
const saltRounds = 10;

exports.hashPassword = (req, res, next) => {
  bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
    if (err) {
      console.error("Error hashing password:", err);
      return res.status(500).json({ message: "Password hashing failed" });
    }

    req.hashedPassword = hash;
    console.log("Your hashed password:", hash);
    next();
  });
};

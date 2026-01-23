const User = require("../models/userModels")
const jwt = require("jsonwebtoken")

exports.verifyToken = async (req, res, next) =>{
    if (!req.headers.authorization) {
        return res.status(403).send({ message: "No token provided!" });
    }

    try {
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.SECRET_TOKEN_KEY);
        req.userId = decodedToken.userId;
        const user= await User.findById(req.userId)
        
        if (!user){
            return res.status(404).send({ message: "User not found!" });
        }
        next();
    } catch (err) {
        return res.status(401).send({ message: "Unauthorized!" });
    }
}

exports.verifyAdmin = async (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(403).send({ message: "No token provided!" });
    }

    try {
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.SECRET_TOKEN_KEY);
        req.userId = decodedToken.userId;
        const user = await User.findById(req.userId);
        
        if (!user) {
            return res.status(404).send({ message: "User not found!" });
        }

        if (user.role !== "admin") {
            return res.status(403).send({ message: "Access denied. Admins only!" });
        }

        req.userRole = user.role;
        next();
    } catch (err) {
        return res.status(401).send({ message: "Unauthorized!" });
    }
};

exports.verifyUser = async (req, res, next) => {
    if (!req.headers.authorization) {
      console.log("No authorization header");
      return res.status(403).send({ message: "No token provided!" });
    }
  
    try {
      const token = req.headers.authorization.split(" ")[1];
  
      const decodedToken = jwt.verify(token, process.env.SECRET_TOKEN_KEY);
  
      req.userId = decodedToken.userId;
  
      const user = await User.findById(req.userId);
      if (!user) {
        console.log("User not found");
        return res.status(404).send({ message: "User not found!" });
      }
  
      next();
    } catch (err) {
      console.log("Token verification failed:", err.message);
      return res.status(401).send({ message: "Unauthorized!" });
    }
  };
  

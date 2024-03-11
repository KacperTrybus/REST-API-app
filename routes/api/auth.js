const jwt = require("jsonwebtoken");
const { User } = require("./users/userModel");
require("dotenv").config();

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res
        .status(401)
        .json({ message: "Not authorized, header missing" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Not authorized, token invalid" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId = decoded._id.toString();

    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(401)
        .json({ message: "Not authorized, userId invalid" });
    }

    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized", error });
  }
};

module.exports = authMiddleware;

const jwt = require("jsonwebtoken");
const User = require("./users/userModel");
require("dotenv").config();

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ message: "Not authorized" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId = decoded._id;

    const user = await User.findById(userId);

    if (!user || user._id.toString() !== userId) {
      return res.status(401).json({ message: "Not authorized" });
    }

    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized" });
  }
};

module.exports = authMiddleware;

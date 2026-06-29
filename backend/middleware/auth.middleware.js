import jwt from "jsonwebtoken";

export function authMiddleware(req, res, next) {
  const cookieName = process.env.COOKIE_NAME || "token";
  const token = req.cookies[cookieName];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Користувач не авторизований"
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Невалідний або прострочений токен"
    });
  }
}
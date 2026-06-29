import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { pool } from "../config/db.js";

const cookieName = process.env.COOKIE_NAME || "token";

function createToken(userId) {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

function setAuthCookie(res, token) {
  res.cookie(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
}

export async function register(req, res) {
  const { firstName, lastName, email, password, organizationName } = req.body;

  if (!firstName || !lastName || !email || !password || !organizationName) {
    return res.status(400).json({
      success: false,
      message: "Усі поля обов'язкові"
    });
  }

  const connection = await pool.getConnection();

  try {
    const [existingUsers] = await connection.execute(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Користувач з таким email вже існує"
      });
    }

    await connection.beginTransaction();

    const userId = uuidv4();
    const organizationId = uuidv4();
    const branchId = uuidv4();

    const passwordHash = await bcrypt.hash(password, 10);

    await connection.execute(
      `
      INSERT INTO users 
      (id, first_name, last_name, email, password_hash, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, NOW(), NOW())
      `,
      [userId, firstName, lastName, email, passwordHash]
    );

    await connection.execute(
      `
      INSERT INTO organizations 
      (id, owner_user_id, name, created_at, updated_at)
      VALUES (?, ?, ?, NOW(), NOW())
      `,
      [organizationId, userId, organizationName]
    );

    await connection.execute(
      `
      INSERT INTO branches 
      (id, organization_id, name, created_at, updated_at)
      VALUES (?, ?, ?, NOW(), NOW())
      `,
      [branchId, organizationId, organizationName]
    );

    await connection.commit();

    const token = createToken(userId);
    setAuthCookie(res, token);

    return res.status(201).json({
      success: true,
      message: "Реєстрація успішна"
    });
  } catch (error) {
    await connection.rollback();

    return res.status(500).json({
      success: false,
      message: "Помилка під час реєстрації",
      error: error.message
    });
  } finally {
    connection.release();
  }
}

export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email і пароль обов'язкові"
    });
  }

  try {
    const [users] = await pool.execute(
      "SELECT * FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Невірний email або пароль"
      });
    }

    const user = users[0];

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Невірний email або пароль"
      });
    }

    const token = createToken(user.id);
    setAuthCookie(res, token);

    return res.json({
      success: true,
      message: "Вхід успішний"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Помилка під час входу",
      error: error.message
    });
  }
}

export async function me(req, res) {
  try {
    const userId = req.user.id;

    const [rows] = await pool.execute(
      `
      SELECT 
        users.id AS user_id,
        users.first_name,
        users.last_name,
        users.email,

        organizations.id AS organization_id,
        organizations.name AS organization_name,

        branches.id AS branch_id,
        branches.name AS branch_name

      FROM users
      LEFT JOIN organizations 
        ON organizations.owner_user_id = users.id
      LEFT JOIN branches 
        ON branches.organization_id = organizations.id
      WHERE users.id = ?
      LIMIT 1
      `,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Користувача не знайдено"
      });
    }

    return res.json({
      success: true,
      user: {
        id: rows[0].user_id,
        firstName: rows[0].first_name,
        lastName: rows[0].last_name,
        email: rows[0].email
      },
      organization: {
        id: rows[0].organization_id,
        name: rows[0].organization_name
      },
      branch: {
        id: rows[0].branch_id,
        name: rows[0].branch_name
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Помилка отримання користувача",
      error: error.message
    });
  }
}

export function logout(req, res) {
  res.clearCookie(cookieName, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax"
  });

  return res.json({
    success: true,
    message: "Вихід успішний"
  });
}
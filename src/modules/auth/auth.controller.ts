import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { signupService, loginService } from "./auth.service";
import { refreshAccessToken } from "./refresh.service";
import { RefreshToken } from "./refreshToken.model";
import { verifyPassword } from "../../utils/password";
import { AppError } from "../../common/errors/AppError";

export const signup = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  // 🔐 Basic input validation (mandatory)
  if (!name || !email || !password) {
    throw new AppError("Name, email and password are required", 400);
  }

  if (password.length < 8) {
    throw new AppError("Password must be at least 8 characters long", 400);
  }

  const user = await signupService(name, email, password);

  res.status(201).json({
    success: true,
    message: "User created successfully",
    user,
  });
};

/**
 * LOGIN
 */
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  const result = await loginService(email, password);

  res.status(200).json({
    success: true,
    ...result,
  });
};

/**
 * REFRESH TOKEN
 */
export const refresh = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AppError("Refresh token required", 400);
  }

  const tokens = await refreshAccessToken(refreshToken);

  res.status(200).json({
    success: true,
    ...tokens,
  });
};

/**
 * LOGOUT
 */
export const logout = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AppError("Refresh token required", 400);
  }

  let payload: { userId: string };

  try {
    payload = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET!
    ) as { userId: string };
  } catch {
    // Token already invalid/expired → treat as logged out
    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  }

  const tokens = await RefreshToken.find({
    userId: payload.userId,
    revoked: false,
    expiresAt: { $gt: new Date() },
  });

  for (const token of tokens) {
    if (await verifyPassword(refreshToken, token.tokenHash)) {
      token.revoked = true;
      await token.save();
    }
  }

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

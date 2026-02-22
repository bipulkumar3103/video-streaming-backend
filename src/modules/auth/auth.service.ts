import { User } from "../user/user.model";
import { hashPassword, verifyPassword } from "../../utils/password";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt";
import { RefreshToken } from "./refreshToken.model";
import { AppError } from "../../common/errors/AppError";
import { isAccountLocked, recordFailedAttempt, resetLoginAttempts } from "./loginProtection";


export const signupService = async (
  name: string,
  email: string,
  password: string
) => {
  // Normalize email (critical)
  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    throw new AppError("Email already registered", 409);
  }

  const passwordHash = await hashPassword(password);

  let user;
  try {
    user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: "USER",
      status: "ACTIVE",
    });
  } catch (err: any) {
    // 🛡️ Handles race condition (duplicate index)
    if (err.code === 11000) {
      throw new AppError("Email already registered", 409);
    }
    throw err;
  }

  return {
    id: user._id,
    email: user.email,
  };
};

const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

export const loginService = async (email: string, password: string) => {
  const user = await User.findOne({ email, status: "ACTIVE" });

  // ❌ Do NOT reveal whether email exists
  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  // 🔒 Account lock check
  if (isAccountLocked(user)) {
    throw new AppError(
      "Account temporarily locked. Please try again later.",
      423
    );
  }

  const validPassword = await verifyPassword(password, user.passwordHash);

  if (!validPassword) {
    await recordFailedAttempt(user);
    throw new AppError("Invalid credentials", 401);
  }

  // ✅ Successful login — reset brute-force counters
  await resetLoginAttempts(user);

  const payload = {
    userId: user._id.toString(),
    role: user.role,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  await RefreshToken.create({
    userId: user._id,
    tokenHash: await hashPassword(refreshToken),
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
  });

  user.lastLoginAt = new Date();
  await user.save();

  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};
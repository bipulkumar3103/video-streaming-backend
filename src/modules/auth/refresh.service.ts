import jwt from "jsonwebtoken";
import { RefreshToken } from "./refreshToken.model";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt";
import { hashPassword, verifyPassword } from "../../utils/password";

export const refreshAccessToken = async (refreshToken: string) => {
  let payload: { userId: string; role: string };

  try {
    payload = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET!
    ) as { userId: string; role: string };
  } catch {
    throw new Error("Invalid or expired refresh token");
  }

  const tokens = await RefreshToken.find({
    userId: payload.userId,
    revoked: false,
    expiresAt: { $gt: new Date() },
  });

  let matchedToken = null;

  for (const token of tokens) {
    if (await verifyPassword(refreshToken, token.tokenHash)) {
      matchedToken = token;
      break;
    }
  }

  if (!matchedToken) {
    throw new Error("Invalid refresh token");
  }

  // 🔐 TOKEN ROTATION (important)
  matchedToken.revoked = true;
  await matchedToken.save();

  const newAccessToken = generateAccessToken(payload);
  const newRefreshToken = generateRefreshToken(payload);

  await RefreshToken.create({
    userId: payload.userId,
    tokenHash: await hashPassword(newRefreshToken),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

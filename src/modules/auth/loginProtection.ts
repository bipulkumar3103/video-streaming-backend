import { IUser } from "../user/user.model";

const MAX_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000; // 15 minutes

export const isAccountLocked = (user: IUser) => {
  if (!user.lockUntil) return false;
  return user.lockUntil.getTime() > Date.now();
};

export const recordFailedAttempt = async (user: IUser) => {
  user.loginAttempts += 1;

  if (user.loginAttempts >= MAX_ATTEMPTS) {
    user.lockUntil = new Date(Date.now() + LOCK_TIME);
  }

  await user.save();
};

export const resetLoginAttempts = async (user: IUser) => {
  user.loginAttempts = 0;
  user.lockUntil = undefined;
  await user.save();
};

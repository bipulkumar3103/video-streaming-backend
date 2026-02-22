import { Router } from "express";
import { Response } from "express";
import { authenticate, AuthRequest } from "../../middlewares/auth.middleware";
import { User } from "./user.model";

const router = Router();

router.get("/me", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!.id).select(
      "-passwordHash -__v -permissions"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

export default router;

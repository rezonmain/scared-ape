import { Router } from "express";
import { z } from "zod";
import { isNothing } from "../../../utils/ez.js";
import type { User } from "../../../models/User.js";
import { Auth } from "../../auth/Auth.js";
import { UserDto } from "./auth.dto.js";

const authRouter = Router();

// Route to handle authentication

/**
 * Generate challenge token if user is whitelisted
 * and send it to user's email
 */
authRouter.post("/:email", async (req, res) => {
  const unsafeEmail = req.params.email;
  let email: string;

  // Validate email
  try {
    email = z.string().email().parse(unsafeEmail);
  } catch {
    return res.status(400).json({
      error: "Invalid email",
    });
  }

  // Check if user exists
  let user: User;
  try {
    user = await req.ctx.db.getUser(email);
    if (isNothing(user)) {
      return res.status(404).json({
        error: "User not found",
      });
    }
  } catch (error) {
    return res.status(500).json({
      error,
    });
  }

  // Check if user is whitelisted
  if (!user.whitelist) {
    return res.status(403).send("Not whitelisted");
  }

  // Generate challenge token
  const challengeToken = req.ctx.auth.generateChallengeToken();

  // Save challenge token to db
  try {
    await req.ctx.db.saveChallenge({
      userId: user.id,
      challenge: challengeToken,
      expiresAt: new Date(
        Date.now() + Auth.challengeLifetime * 1000
      ).toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      error,
    });
  }

  // Send challenge token to user's email
  req.ctx.mailer.sendChallengeEmail(email, challengeToken);
  return res.sendStatus(200);
});

/**
 * Verify challenge token and generate session
 * @Dto User
 */
authRouter.post("/challenge/:challenge", async (req, res) => {
  const unsafeChallengeToken = req.params.challenge;
  let challengeToken: string;

  // Validate challenge token
  try {
    challengeToken = z.string().parse(unsafeChallengeToken);
  } catch {
    return res.status(400).json({
      error: "Invalid challenge token",
    });
  }

  // Check if challenge token is valid
  const verified = await req.ctx.auth.verifyChallenge(challengeToken);
  if (!verified) {
    return res.status(403).json({
      error: "Invalid challenge token",
    });
  }

  // At this point user is authenticated
  // Generate session
  const { fgp, jwt } = req.ctx.auth.generateSession(verified.cuid);
  res.cookie("__Secure-fgp", fgp, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });

  res.cookie("__Secure-jwt", jwt, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });

  const json = new UserDto(verified);
  return res.status(200).json(json);
});
export { authRouter };

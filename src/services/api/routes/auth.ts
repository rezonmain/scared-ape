import { Router } from "express";
import { z } from "zod";
import { isNothing } from "../../../utils/ez.js";
import type { User } from "../../../models/User.js";
import { Auth } from "../../auth/Auth.js";
import { ChallengeSentDto, UserDto } from "../dto/auth.dto.js";
import { ErrorHelper } from "../../../utils/ErrorHelper.js";

const authRouter = Router();

// Route to handle authentication

/**
 * Generate challenge token if user is whitelisted
 * and send it to user's email
 */
authRouter.post("/", async (req, res) => {
  const unsafeEmail = req.query.email;
  let email: string;

  // Validate email
  try {
    email = z.string().email().parse(unsafeEmail);
  } catch {
    return res.status(400).json({
      error: ErrorHelper.message("auth_003"),
    });
  }

  // Check if user exists
  let user: User;
  try {
    user = await req.ctx.db.getUser(email);
    if (isNothing(user)) {
      return res.status(404).json({
        error: ErrorHelper.message("auth_001"),
      });
    }
  } catch (error) {
    return res.status(500).json({
      error,
    });
  }

  // Check if user is whitelisted
  if (!user.whitelist) {
    return res.status(403).json({
      error: ErrorHelper.message("auth_002"),
    });
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
  const json = new ChallengeSentDto({ email });
  return res.json(json);
});

/**
 * Verify challenge token and generate session
 * @Dto User
 */
authRouter.get("/challenge/:challenge", async (req, res) => {
  const unsafeChallengeToken = req.params.challenge;
  let challengeToken: string;

  // Validate challenge token
  try {
    challengeToken = z.string().parse(unsafeChallengeToken);
  } catch {
    return res.status(400).json({
      error: ErrorHelper.message("auth_004"),
    });
  }

  // Check if challenge token is valid
  let user: User;
  try {
    user = await req.ctx.auth.verifyChallenge(challengeToken);
  } catch (error) {
    return res.status(403).json({
      error,
    });
  }

  // At this point user is authenticated
  // Generate session
  const { fgp, jwt } = req.ctx.auth.generateSession(user.cuid);
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

  const json = new UserDto(user);
  return res.status(200).json(json);
});
export { authRouter };

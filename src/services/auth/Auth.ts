import c from "config";
import { isNothing } from "../../utils/ez.js";
import { Logger } from "../../utils/Logger.js";
import { init } from "@paralleldrive/cuid2";
import jwt from "jsonwebtoken";
import type { DB } from "../db/DB.js";
import type { User } from "../../models/User.js";
import { CacheHelper } from "../../utils/CacheHelper.js";
import type { Session } from "../../types/Session.js";
import { ErrorHelper } from "../../utils/ErrorHelper.js";

export class Auth {
  private secret: string;
  private generateChallenge: () => string;
  private generateSessionUserFingerprint: () => string;

  static challengeLifetime = 1 * 60 * 5; // 5 minutes
  static sessionLifetime = "3d"; // 3 days

  constructor(private db: DB) {
    this.secret = c.get("auth.jwt.secret");
    if (isNothing(this.secret)) {
      Logger.error("Auth: secret is not defined in config file");
      process.exit(1);
    }
    this.generateChallenge = init({
      length: 16,
    });

    this.generateSessionUserFingerprint = init({
      length: 50,
    });
  }

  generateChallengeToken(): string {
    return this.generateChallenge();
  }

  verifyJWT({ jwt: _jwt, fgp }: Session): boolean {
    const hashedFingerprint = CacheHelper.hashData(fgp);
    try {
      const decoded = jwt.verify(_jwt, this.secret, { issuer: "ape" });
      if (typeof decoded !== "object") throw "JWT has no body";
      if (decoded.fgp !== hashedFingerprint)
        throw "JWT fingerprint doesn't match";
      return true;
    } catch (error) {
      Logger.log(`➡️ [🔒Auth][verifyJWT()] ${JSON.stringify(error)})`);
      return false;
    }
  }

  async verifyChallenge(challengeToken: string): Promise<User> {
    // Check if challenge exists
    const challenge = await this.db.getChallenge(challengeToken);
    if (isNothing(challenge)) throw ErrorHelper.message("auth_004");

    // Check if challenge has expired
    if (new Date(challenge.expiresAt) < new Date())
      throw ErrorHelper.message("auth_005", Auth.challengeLifetime / 60);

    // Check if user exists
    const user = await this.db.getUserById(challenge.userId);
    if (isNothing(user)) throw ErrorHelper.message("auth_001");

    // Check if user is whitelisted
    if (!user.whitelist) throw ErrorHelper.message("auth_002");

    return user;
  }

  generateSession(userCuid: User["cuid"]): Session {
    const fgp = this.generateSessionUserFingerprint();
    const hashedFgp = CacheHelper.hashData(fgp);

    const _jwt = jwt.sign(
      {
        cuid: userCuid,
        fgp: hashedFgp,
      },
      this.secret,
      {
        expiresIn: Auth.sessionLifetime,
        issuer: "ape",
      }
    );

    return {
      fgp,
      jwt: _jwt,
    };
  }

  revokeJWT({
    jwt,
    revocationDate,
  }: {
    jwt: Session["jwt"];
    revocationDate?: string; // iso date string
  }): void {
    const revocation = revocationDate ?? new Date().toISOString();
    const jwtHash = CacheHelper.hashData(jwt);
    this.db.saveRevocation({ jwtHash, revocationDate: revocation });
  }

  async isRevokedJWT({ jwt }: { jwt: Session["jwt"] }): Promise<boolean> {
    const jwtHash = CacheHelper.hashData(jwt);
    const isRevoked = !isNothing(await this.db.getRevocation(jwtHash));
    return isRevoked;
  }
}

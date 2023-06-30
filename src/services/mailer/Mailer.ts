import { CourierClient } from "@trycourier/courier";
import c from "config";
import { Logger } from "../../utils/Logger.js";

export class Mailer {
  private client: ReturnType<typeof CourierClient>;
  constructor() {
    this.client = CourierClient({
      authorizationToken: c.get("mailer.courier.apiKey"),
    });
  }

  async sendChallengeEmail(email: string, challenge: string): Promise<void> {
    await this.client.send({
      message: {
        to: {
          data: {
            challenge,
            clientUrl: c.get("clientUrl"),
          },
          email,
        },
        content: {
          title: "Access to scared-ape 🦍",
          body: `Hello go to {{clientUrl}}/auth/challenge/{{challenge}} to access scared-ape 🦍`,
        },
        routing: {
          method: "single",
          channels: ["email"],
        },
      },
    });
    Logger.log(`✅ [💌Mailer]: sent challenge email to ${email}`);
  }
}

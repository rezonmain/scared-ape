import { CourierClient } from "@trycourier/courier";
import c from "config";
import { Logger } from "../../utils/Logger.js";
import { Service } from "../Service.js";

export class Mailer extends Service {
  private client: ReturnType<typeof CourierClient>;
  constructor() {
    super();
    this.client = CourierClient({
      authorizationToken: c.get("mailer.courier.apiKey"),
    });
    this.running = true;
  }

  get name() {
    return "mailer";
  }

  async sendChallengeEmail(email: string, challenge: string): Promise<string> {
    if (process.env.NODE_ENV !== "production") {
      Logger.log(
        `✅ [💌Mailer]: would've send challenge email to ${email} with challenge ${c.get(
          "clientUrl"
        )}/auth/challenge/${challenge} but app is running in an environment other than production`
      );
      return;
    }
    const { requestId } = await this.client.send({
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
    Logger.log(
      `✅ [💌Mailer]: sent challenge email to ${email}, requestId: ${requestId}`
    );
    return requestId;
  }
}

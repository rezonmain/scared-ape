import { Bot } from "grammy";
import type { Fetcher } from "../../Fetcher.js";
import config from "config";
import { Logger } from "../../../utils/Logger.js";
import { Str } from "../../../utils/Str.js";

export class Telegram {
  private path = "https://api.telegram.org/bot";
  private token: string;
  private bot: Bot;
  private recipientChatId: string;
  constructor(private fetcher: Fetcher) {
    this.token = config.get("notifier.telegram.token");
    this.recipientChatId = config.get("notifier.telegram.recipientChatId");
    this.bot = new Bot(this.token);
  }

  start() {
    Logger.log("🔄 [📪Telegram][start()] Starting Telegram bot...");
    this.registerListeners();
    this.bot.start();
    config.get("notifier.notifyOnStart") &&
      this.send("🦍 scared-ape is getting scared and is running 🦍");
  }

  private registerListeners() {
    // this.bot.on("message:text", (ctx) => {
    //   Logger.log(
    //     `✅ [📪Telegram][on(message:text)] recieved message: '${Str.bound(
    //       ctx.message.text
    //     )}, from: ${JSON.stringify(ctx, null, 2)}'`
    //   );
    //   ctx.reply("Echo: " + ctx.message.text);
    // });
  }

  /**
   * Send a message to the recipient chat
   * @param message
   * @param chatId - optional defualts to the recipientChatId in the config
   */
  async send(message: string, chatId?: number | string) {
    Logger.log(
      `📪 [📪Telegram][send()] Sending message: '${Str.bound(message)}'`
    );
    await this.bot.api.sendMessage(chatId ?? this.recipientChatId, message);
  }

  /**
   * Used for testing
   * @returns
   */
  async getMe() {
    return this.fetcher.get(
      {
        url: `${this.path}${this.token}/getMe`,
      },
      {
        expires: 1800,
      }
    );
  }
}

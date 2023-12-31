import { Bot } from "grammy";
import config from "config";
import { Logger } from "../../../utils/Logger.js";
import { Str } from "../../../utils/Str.js";
import { otherwise } from "../../../utils/ez.js";
import { Notifier } from "../Notifier.js";
import type { Peta } from "../../Peta.js";
import c from "config";

export class Telegram extends Notifier {
  private token: string;
  private bot: Bot;
  private recipientChatId: string;
  constructor(token?: string, recipientChatId?: string) {
    super();
    this.token = otherwise(token, () => config.get("notifier.telegram.token"));
    this.recipientChatId = otherwise(recipientChatId, () =>
      config.get("notifier.telegram.recipientChatId")
    );
    this.bot = new Bot(this.token);
  }

  start() {
    if (process.env.NODE_ENV === "dev") return;
    Logger.log("🔄 [📪Telegram][start()] Starting Telegram bot...");
    this.registerCommands();
    this.bot.start();
    config.get("notifier.notifyOnStart") &&
      this.send({
        message: "🦍 scared-ape is getting scared and is running 🦍",
      });
    this.running = true;
  }

  async stop() {
    Logger.log("🔄 [📪Telegram][stop()] Stopping Telegram bot...");
    await this.bot.stop();
    this.running = false;
  }

  private registerCommands() {
    this.bot.command("id", (ctx) =>
      ctx.reply(`🦍 *Here you go:* _\`${ctx.chat.id}\`_`, {
        parse_mode: "MarkdownV2",
      })
    );

    this.bot.api.setMyCommands([
      { command: "id", description: "Get the chat id" },
    ]);
  }

  /**
   * Send a message to the recipient chat
   * @param message
   * @param chatId - optional defualts to the recipientChatId in the config
   */
  async send({
    message,
    chatId,
    silent = false,
  }: {
    message: string;
    chatId?: number | string;
    silent?: boolean;
  }) {
    Logger.log(
      `📪 [📪Telegram][send()] Sending message: '${Str.bound(message)}'`
    );
    await this.bot.api.sendMessage(
      chatId ?? this.recipientChatId,
      `[${c.get("instance.name")}] ${message}`,
      {
        disable_notification: silent,
      }
    );
  }

  get name() {
    return "telegram";
  }

  async sendHealthCheck(peta: Peta): Promise<void> {
    await this.send({
      message: `🦍 health check: ${JSON.stringify(peta.getHealth(), null, 2)}`,
      silent: true,
    });
  }
}

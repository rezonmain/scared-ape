import type { PuppeteerLaunchOptions } from "puppeteer";
import isDocker from "is-docker";

const common: PuppeteerLaunchOptions = {
  headless: "new",
  args: isDocker() ? ["--no-sandbox"] : undefined,
  executablePath: isDocker() ? "/usr/bin/google-chrome" : undefined,
};

export { common };

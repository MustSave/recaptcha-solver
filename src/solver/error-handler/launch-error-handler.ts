import { PuppeteerLaunchOptions } from "puppeteer";
import { findChromeBrowser } from "../puppeteer-utils";

export interface PuppeteerErrorHandler {
    handleLaunchError: (launchOptions:PuppeteerLaunchOptions) => Promise<void>;
}

export class BrowserNotFoundHandler implements PuppeteerErrorHandler {
    private static index = 0;
    async handleLaunchError(launchOptions:PuppeteerLaunchOptions) {
        const browserLocations = findChromeBrowser();
        if (BrowserNotFoundHandler.index < browserLocations.length) {
            launchOptions.executablePath = browserLocations.at(BrowserNotFoundHandler.index++);
        } else {
            throw RangeError("Index out of range");
        }
    }
}

export class NamespaceErrorHandler implements PuppeteerErrorHandler {
    async handleLaunchError(launchOptions:PuppeteerLaunchOptions) {
        if (!launchOptions.args) {
            launchOptions.args = ['--disable-gpu', '--disable-setuid-sandbox', '--no-sandbox', '--no-zygote'];
        } else {
            throw Error("Unknown Error");
        }
    }
}
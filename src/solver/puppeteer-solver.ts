import { Browser, Page, PuppeteerLaunchOptions } from "puppeteer";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth"
import { Processor, Solver } from "./type";
import { closeBrowser, extractRecaptchaAnswer, isRecaptchaSolved, sleep } from "./puppeteer-utils";
import { getFrame } from "./puppeteer-utils";
import { CHALLENGE_FRAME_URL, SoundProcessor } from "./processor/soundProcessor";
import { BrowserNotFoundHandler, NamespaceErrorHandler } from "./error-handler/launch-error-handler";

const ANCHOR_FRAME_URL = 'api2/anchor';
export class PuppeteerSolver implements Solver{
    private launchOption:PuppeteerLaunchOptions = { headless: false };
    private puppeteerBrowser?:Browser = undefined;
    private processor:Processor;

    constructor() {
        this.processor = new SoundProcessor();
    }

    private async tryLaunchPuppeteer() {
        this.puppeteerBrowser ??= await puppeteer
            .use(StealthPlugin())
            .launch(this.launchOption);
    }
    
    private async launchPuppeteer() {
        while (!this.puppeteerBrowser) {
            try {
                await this.tryLaunchPuppeteer();
            } catch (err) {
                if (err instanceof Error) {
                    if (err.message.includes("Could not find Chrome")) {
                        new BrowserNotFoundHandler().handleLaunchError(this.launchOption);
                    } else if (err.message.includes("Failed to move to new namespace")) {
                        new NamespaceErrorHandler().handleLaunchError(this.launchOption);
                    } else {
                        throw err;
                    }
                }
            }
        }
        return this.puppeteerBrowser;
    }
    
    async solve(url: string) {
        let result = '';
        try {
            const browser = await this.launchPuppeteer();
            const page = await browser.newPage();
            page.setDefaultTimeout(5000);
        
            await this.waitUntilRecaptchaLoaded(page, url);

            result = await this.solveRecaptcha(page);
            console.log('[INFO] g-recaptcha-response:', result);
        } catch (err) {
            console.error(err);
        } finally {
            closeBrowser(this.puppeteerBrowser);
        }
        return { "g-recaptcha-response": result };
    }

    private async waitUntilRecaptchaLoaded(page: Page, url: string) {
        await Promise.all([
            page.goto(url, { waitUntil: 'networkidle2' }),
            page.waitForResponse(res => res.url().includes(CHALLENGE_FRAME_URL), { timeout: 20000 })
        ]);
        await sleep(1000);
    }

    private async solveRecaptcha(page:Page) {
        await this.clickRecaptchaBox(page);
        if (await isRecaptchaSolved(page))
            return await extractRecaptchaAnswer(page);

        await this.processor.process(page);
        return await extractRecaptchaAnswer(page);
    }
    
    private async clickRecaptchaBox(page:Page) {
        const frame = await getFrame(page, ANCHOR_FRAME_URL);
        const anchor = await frame.waitForSelector('#recaptcha-anchor')
        await anchor?.focus();
        await frame.page().keyboard.press('Enter');
        await sleep(2000);
        // await frame.click('#recaptcha-anchor');
    }
}

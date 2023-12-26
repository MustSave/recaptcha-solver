import { Browser, Page } from "puppeteer";

export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function getFrame(page: Page, urlIncluded: string) {
    let frame = page.frames().find(frame => frame.url().includes(urlIncluded));
    if (!frame) {
        await sleep(2000);
        page.frames().find(frame => frame.url().includes(urlIncluded));
        if (!frame)
            throw new Error(`조건에 맞는 프레임이 존재하지 않습니다. arg=${urlIncluded}`);
    }
    return frame;
}

export function closeBrowser(browser?:Browser) {
    browser?.pages()
        .then(pages => {
            for (const page of pages) {
                page.close();
            }
        }).then(() => {
            browser?.close();
        });
}

export async function isRecaptchaSolved(page:Page) {
    const recaptchaResponse = await extractRecaptchaAnswer(page);
    return recaptchaResponse.length > 0;
}

export async function extractRecaptchaAnswer(page:Page) {
    const value = await page.$eval("textarea#g-recaptcha-response", el => el.value);
    return value;
}
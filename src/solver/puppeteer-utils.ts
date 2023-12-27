import fs from 'fs';
import os from 'os';
import path from 'path';
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

export function findChromeBrowser() {
    const result:string[] = []

    switch (getOSInfo()) {
        case 'linux':
            const prefix = 'chrom';
            const pathDirs = process.env.PATH!.split(path.delimiter);
        
            pathDirs.forEach(dir => {
                const matchingExecutables = findMatchingExecutables(dir, prefix);
                if (matchingExecutables.length > 0) {
                    result.push(...matchingExecutables);
                }
            });
            break;
        case 'darwin':
            result.push('/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome');
            break;
    }

    return result;
}

function findMatchingExecutables(dir:string, prefix:string) {
    try {
        const files = fs.readdirSync(dir);
        const matchingExecutables = files.filter(file => 
            file.toLowerCase().startsWith(prefix.toLowerCase())
            && fs.statSync(path.join(dir, file)).isFile()
            && (fs.statSync(path.join(dir, file)).mode & 0o111) !== 0
        );
        return matchingExecutables.map(file => path.join(dir, file));
    } catch (err) {
        return [];
    }
}

function getOSInfo() {
    return os.platform();
}
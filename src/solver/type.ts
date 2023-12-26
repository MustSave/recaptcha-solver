import { Page } from "puppeteer";

interface CaptchaResult {
    'g-recaptcha-response':string;
}

export interface Solver {
    solve: (url:string) => Promise<CaptchaResult>;
}

export interface Processor {
    process: (page:Page) => Promise<void>;
}
import { Frame, Page, TimeoutError } from "puppeteer";
import { Processor } from "../type";
import { doSpeechRecognition } from "../../speech_recognition/google_sr";
import { getFrame, isRecaptchaSolved, sleep } from "../puppeteer-utils";

export const CHALLENGE_FRAME_URL = 'api2/bframe';

export class SoundProcessor implements Processor {
    async process(page: Page) {
        const challengeFrame = await this.moveToSoundChallenge(page);
        await this.solveWithSound(challengeFrame);
    }
    
    private async moveToSoundChallenge(page: Page) {
        const challengeFrame = await getFrame(page, CHALLENGE_FRAME_URL);
        try {
            const audioButton = await challengeFrame.waitForSelector('#recaptcha-audio-button');
            await sleep(1000);
            await audioButton?.click();
        } catch (error) {
            if (!(await challengeFrame.$('#recaptcha-image-button'))?.isVisible()) {
                throw error;
            }
        }
        return challengeFrame;
    }
    
    private async solveWithSound(frame: Frame) {
        while (await isRecaptchaSolved(frame.page()) === false)
            await this.challenge(frame);
        await sleep(1000);
    }

    private async challenge(frame: Frame) {
        let answer:string|undefined = undefined;

        while (!answer) {
            const audioSrc = await this.getAudioSource(frame);
            console.log('[INFO] Audio src:', audioSrc);
            
            answer = await this.solveRecaptchaWithSound(answer, audioSrc, frame);
            await sleep(2000);
        }

        await frame.type('#audio-response', answer);
        await frame.page().keyboard.press("Enter");
        // await frame.click('#recaptcha-verify-button');
        await sleep(1000);
    }
    
    private async getAudioSource(frame: Frame) {
        try {
            await frame.waitForSelector('#audio-source');
        } catch (err) {
            if (err instanceof TimeoutError) {
                console.log("[ERROR] Google might blocked your request for a few hour. Try later.")
                throw new Error("Google might blocked your request for a few hour. Try later.")
            }
            throw err
        }
        const audioSrc = await frame.$eval('#audio-source', src => src.getAttribute('src'));
        if (!audioSrc)
            throw new Error("No src attribute found at #audio-source");
        return audioSrc;
    }

    private async solveRecaptchaWithSound(answer: string | undefined, audioSrc: string, frame: Frame) {
        try {
            answer = await doSpeechRecognition(audioSrc);
            console.log('[INFO] Recaptcha Passcode:', answer);
        } catch (error) {
            console.error(error);
            await frame.click('#recaptcha-reload-button');
        }
        return answer;
    }
}
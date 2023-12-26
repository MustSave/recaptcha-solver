import { spawn } from "child_process";

export async function doSpeechRecognition(audioSrc: string) {
    return new Promise<string>((resolve, reject) => {
        const proc = spawn('python', [`${process.env["ROOT_DIR"]}/google_sr.py`], { stdio: ['pipe', 'pipe', 'pipe'] });
        let result = '';

        proc.stdin.write(audioSrc);
        proc.stdin.end();

        proc.stdout.on('data', data => {
            result += data.toString();
        });

        proc.stdout.on('end', () => {
            resolve(result.trim());
        });

        proc.stderr.on('data', err => {
            reject(err.toString());
        });
    });
}

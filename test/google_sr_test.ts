import { doSpeechRecognition } from "../src/speech_recognition/google_sr";

doSpeechRecognition("file:///Users/mac/Desktop/Captcha Solver/sample.mp3 00-55-46-284.mp3").then(res => {
    if (res.includes("equal") || res.includes("multipl")) {
        console.log("테스트 성공");
    } else {
        console.log("테스트 실패");
    }
})
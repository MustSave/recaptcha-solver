const testSite = "https://www.google.com/recaptcha/api2/demo";
const r = fetch(`http://localhost:3000/recaptchav2?url=${encodeURIComponent(testSite)}`);

r.then(async res => {
    const json = await res.json();
    if (res.status == 200 && json['g-recaptcha-response']?.length) {
        console.log("테스트 성공");
    } else {
        console.error("테스트 실패");
    }
})
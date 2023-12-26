# Install

```bash
git clone https://github.com/mustsave/recaptcha-solver.git
cd recaptcha-solver

sudo apt install ffmpeg

# sudo apt install node
yarn add .
tsc
mv google_sr.py dist/google_sr.py

# sudo apt install python3
pip install -r requirements.txt
```

# Run

```bash
node dist/src/index.js
```

# Usage

```bash
targetUrl="https://www.google.com/recaptcha/api2/demo"
encodedUrl=$(echo "$targetUrl" | sed 's/:/%3A/g; s/\//%2F/g; s/?/%3F/g; s/&/%26/g; s/=/%3D/g')
curl "localhost:3000/recaptchav2?url=${encodedUrl}"
```

# Caution

## Only for ReCaptchaV2  
## Not working with headless mode  
## URL should be encoded
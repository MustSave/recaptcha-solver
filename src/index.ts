import { PuppeteerSolver } from "./solver/puppeteer-solver";
import { Solver } from "./solver/type";
import express from 'express';
import { dirname } from 'path';

process.env["ROOT_DIR"] = dirname(__dirname)

const app = express();
const PORT = 3000;

app.get('/recaptchav2', async (req, res) => {
    try {
        const urlParam = req.query.url as string;
        console.log(`[INFO] requested url=${urlParam}`);
        const result =  await solveCaptcha(urlParam);
        res.json(result);
    } catch(err) {
        res.status(500);
        console.error(err);
        res.json({error: "Error"});
    }
});

function solveCaptcha(url:string) {
    const solver:Solver = new PuppeteerSolver();
    return solver.solve(url);
}

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`)
})

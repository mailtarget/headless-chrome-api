const express = require('express')
const app = express()
const port = 3000
const puppeteer = require('puppeteer')

let browser

(async () => { 
    browser = await puppeteer.launch({
        headless: true, 
        slowMo: 250,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }); 
})();

app.use(express.json());

app.get('/', (req, res) => {
    res.send('headless chrome api is ready to serve')
}) 
    
app.post('/content', async (req, res) => {
    const url = req.body.url
    const js = req.body.js
    try {
        if (url) {
            console.log('open ' + url)
            const content = await ssr(url, js)
            res.json(content)
        } else {
            res.status(400).send("missing input value")
        }
    } catch (error) {
        console.error(error)
        res.status(500).send(error)
    }  
})

async function ssr(url, js = false) {
    const page = await browser.newPage();
    if (js) {
        await page.goto(url, {waitUntil: 'networkidle0'});
    } else { 
        await page.goto(url);
    }
    const html = await page.content(); // serialized HTML of page DOM.
    page.close()
    return html;
}

app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`)
})
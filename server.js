const express = require('express')
const app = express()
const port = 3000
const puppeteer = require('puppeteer')
const { getPdfOption } = require('./pdf-option/pdf-option-lib')

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

app.post('/pdf', async (req, res) => {
    const html = req.body.html
    if (!html) {
        res.status(400)
        res.contentType('text/plain')
        res.end('post parameter "html" is not set')
    } else {
        const page = await browser.newPage()
        try {
            await page.setContent(html)
            // Wait for web font loading completion
            // await page.evaluateHandle('document.fonts.ready')
            const pdfOption = getPdfOption(req.body.pdf_option)
            // debug('pdfOption', pdfOption)
            const buff = await page.pdf(pdfOption)
            res.status(200)
            res.contentType('application/pdf')
            res.send(buff)
            res.end()
            return
        } catch (e) {
            res.status(500)
            res.contentType('text/plain')
            res.end()
            handlePageError(e, 'html.length:' + html.length)
            return
        }
    }
})

function handlePageError(e, option) {
    console.error('Page error occurred! process.exit()')
    console.error('error:', e)
    console.error('option:', option)
    process.exit()
}

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
const express = require('express')
const app = express()
const port = 3000
const puppeteer = require('puppeteer')
const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.96 YaBrowser/20.4.0.3443 Yowser/2.5 Yptp/1.23 Safari/537.36'
const fs = require('fs')
const screenshotDir = '/tmp/screenshot/'
const pdfDir = '/tmp/pdf/'


let browser

(async () => { 
    browser = await puppeteer.launch({
        headless: true, 
        slowMo: 250,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }); 
    fs.mkdir(screenshotDir, { recursive: true }, (err) => {
        if (err) throw err;
    });
    console.log("screenshot dir created")
    fs.mkdir(pdfDir, { recursive: true }, (err) => {
        if (err) throw err;
    });
    console.log("pdf dir created")
    
})();

app.use(express.json());

app.get('/', (req, res) => {
    res.send('headless chrome api is ready to serve')
}) 

app.post('/content', async (req, res) => {
    const url = req.body.url
    var raw = req.body.raw
    const js = req.body.js
    try {
        if (url) {
            console.log('open: ' + url)
            const content = await ssr(url, js)
            if (raw) {
                res.send(content)
            } else {
                res.json(content)
            }
        } else {
            res.status(400).send("missing input value")
        }
    } catch (error) {
        console.error(error)
        res.status(500).send(error)
    }  
})

app.post('/screenshot', async (req, res) => {
    const url = req.body.url
    const js = req.body.js
    let ext
    if (req.body.ext) {
        ext = req.body.ext
    } else {
        ext = 'png'
    }
    const date = Date.now()
    let screenshotData = {
        path: screenshotDir + date + '.' + ext
    }
    try {
        if (url) {
            console.log('open for screenshot: ' + url)
            const page = await loadPage(url, js)
            await page.screenshot(screenshotData)
            const filename = screenshotData.path
            res.sendFile(filename)
            res.on('finish', function() {
                removeFile(filename)
            });
        } else {
            res.status(400).send("missing input value")
        }
    } catch (error) {
        console.error(error)
        res.status(500).send(error)
    }  
})

app.post('/pdf', async (req, res) => {
    const url = req.body.url
    const js = req.body.js
    const date = Date.now()
    var landscape = req.body.landscape
    
    let pdfData = {
        path: pdfDir + date + '.pdf',
        format: 'A4',
        landscape: landscape
    }
    try {
        if (url) {
            console.log('open for screenshot: ' + url)
            const page = await loadPage(url, js)
            await page.pdf(pdfData)
            const filename = pdfData.path
            res.sendFile(filename)
            res.on('finish', function() {
                removeFile(filename)
            });
        } else {
            res.status(400).send("missing input value")
        }
    } catch (error) {
        console.error(error)
        res.status(500).send(error)
    } 
})

function removeFile(filename) {
    fs.unlink(filename, (err) => {
        if (err) throw err;
        console.log('file deleted :' + filename);
    });
}

async function loadPage(url, js = false) {
    const page = await browser.newPage();
    await page.setUserAgent(userAgent);
    if (js) {
        await page.goto(url, { waitUntil: 'networkidle0' });
    } else { 
        await page.goto(url);
    }
    return page
}

async function ssr(url, js = false) {
    const page = await loadPage(url, js)
    const html = await page.content(); // serialized HTML of page DOM.
    page.close()
    return html;
}


app.listen(port, () => {
    console.log(`Example app listening on port ${port}!`)
})
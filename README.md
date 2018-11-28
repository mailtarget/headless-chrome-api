# HEADLESS CHROME HEADLESS

Is docker image to get html content of url for server side rendering using puppeteer, a chrome headless java script wrapper. the purpose of this project is originally to support [durian](https://https://github.com/mailtarget/durian) library.

### Usage

    docker run -p 3000:3000 mailtarget/headless-chrome-api


    POST http://localhost:3000/content

    {
        "url": "https://blog.mailtarget.co/5-langkah-membuat-event-dengan-mailtarget/",
        "js": true // default false
    }

It will response Json html content of the url provided


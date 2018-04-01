const cheerio = require('cheerio')
const rp = require('request-promise')
const dm = require('./datamanager')

class Crawler {
  constructor () {
    //++++++++++++++++++++++++++++++++++++++++++++++++++++++ OPTIONS +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    this.seed_options = {
      url: 'https://www.amazon.com/Best-Sellers/zgbs',
      title: 'Amazon Best Sellers'
    }
    this.headers = {
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
      "Accept-Encoding": "gzip, deflate, br",
      "Accept-Language": "en-US,en;q=0.9",
      "Cache-Control": "max-age=0",
      "Connection": "keep-alive",
      "Host": "www.amazon.com",
      "Referer": "https://www.google.com/",
      "Upgrade-Insecure-Requests": "1",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36"
    }
    this.gzip = true
    this.speed = 1000 // in milliseconds
    this.error_timeout = 60000 // on error move to next link after x milliseconds
    //---------------------------------------------------- END OPIONS ------------------------------------------------------------------------------------------------

    this.last = 0 // time of last scrape
    this.start = Date.now()
    this.proxy = process.env.PROXY
  }

  execute (opt = {}) {
    if (opt.uri && opt.qs) {
      // process the last link with a new query string
      this.request(opt.uri, opt.qs).then(response => {

      })).catch(err => {console.error('Request Error:', err); setTimeout(() => {this.next()}, this.error_timeout)})
    } else {
      // grab a new link
      dm.getScrapeLink().then(link => {
        this.request(link.uri).then(response => {

        })).catch(err => {console.error('Request Error:', err); setTimeout(() => {this.next()}, this.error_timeout)})
      }).catch(err => {console.error('Get link Error:', err); setTimeout(() => {this.next()}, this.error_timeout)})
    }

    this.next()
  }

  next (opt) {
    let milliseconds_since_last_loop = Date.now() - this.last
    let milliseconds_to_next_loop = this.speed - milliseconds_since_last_loop
    setTimeout(() => {
      this.last = Date.now()
      this.execute(opt)
    }, Math.max(0, milliseconds_to_next_loop))
  }

  request (uri, qs = {}) {
    console.log(`Scraping: "${uri}" qs: ${JSON.stringify(qs)} proxy: ${this.proxy}`)
    return rp({
      qs,
      uri,
      gzip: this.gzip,
      proxy: this.proxy,
      headers: this.headers
    })
  }

  seed () {
    return new Promise((resolve, reject) => {
      dm.addLink(this.seed_options.url, this.seed_options.title, null).then(r => {
        resolve(r)
      }).catch(err => {reject(err)})
    })
  }

  start () {
    this.execute()
  }
}

// scraper is controlled by worker
module.exports = new Crawler()

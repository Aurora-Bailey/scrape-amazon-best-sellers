const rp = require('request-promise')
const scraper = require('./scraper')
const dm = require('./datamanager')
const config = require('./config')

class Crawler {
  constructor () {
    this.seed_options = config.seed
    this.headers = config.headers
    this.gzip = config.gzip
    this.speed = config.speed
    this.error_timeout = config.error_timeout
    this.last = 0 // time of last scrape
    this.state = 'off' // running stop off
    this.start_date = Date.now()
    this.proxy = process.env.PROXY
  }

  execute (opt = {}) {
    if (opt.uri && opt.qs) {
      // process the last link with a new query string
      this.request(opt.uri, opt.qs).then(response => {

      }).catch(err => {console.error('Request Error:', err); setTimeout(() => {this.next()}, this.error_timeout)})
    } else {
      // grab a new link
      dm.getScrapeLink().then(link => {
        this.request(link.uri).then(response => {

        }).catch(err => {console.error('Request Error:', err); setTimeout(() => {this.next()}, this.error_timeout)})
      }).catch(err => {console.error('Get link Error:', err); setTimeout(() => {this.next()}, this.error_timeout)})
    }

    this.next()
  }

  next (opt) {
    let milliseconds_since_last_loop = Date.now() - this.last
    let milliseconds_to_next_loop = this.speed - milliseconds_since_last_loop
    setTimeout(() => {
      if (this.state !== 'running'){
        console.log('Shutting down ', this.proxy)
        this.state = 'off'
        return false
      }
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
    if (this.state !== 'off') return false

    this.state = 'running'
    this.execute()
  }

  stop () {
    if (this.state !== 'running') return false

    this.state = 'stop'
  }
}

// scraper is controlled by worker
module.exports = new Crawler()

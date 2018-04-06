const rp = require('request-promise')
const scraper = require('./scraper')
const lm = require('./linkmanager')
const config = require('./config')

class Crawler {
  constructor () {
    this.headers = config.headers
    this.gzip = config.gzip
    this.speed = config.speed
    this.error_timeout = config.error_timeout
    this.query_string = config.query_string
    this.last = 0 // time of last scrape
    this.state = 'off' // running stop off
    this.start_date = Date.now()
    this.proxy = process.env.PROXY
  }

  execute () {
    lm.checkoutLink(this.proxy).then(link => {
      this.request(link.uri).then(response => {
        scraper.scrape(link.uri, response).then(new_links => {
          new_links.forEach(nl => {
            lm.addLink(nl.uri, nl.text, link.uri).catch(err => {console.error('Add Link Error:', err)})
          })
          lm.releaseLink(link._id).then(r => {
            this.next() // add links somewhere
          }).catch(err => {console.error('Release Link Error:', err); setTimeout(() => {this.next()}, this.error_timeout)})
        }).catch(err => {console.error('Scrape Error:', err); setTimeout(() => {this.next()}, this.error_timeout)})
      }).catch(err => {console.error('Request Error:', err); setTimeout(() => {this.next()}, this.error_timeout)})
    }).catch(err => {console.error('Checkout link Error:', err); setTimeout(() => {this.next()}, this.error_timeout)})
  }

  next () {
    let milliseconds_since_last_loop = Date.now() - this.last
    let milliseconds_to_next_loop = this.speed - milliseconds_since_last_loop
    setTimeout(() => {
      if (this.state !== 'running'){
        console.log('Shutting down ', this.proxy)
        this.state = 'off'
        return false
      }
      this.last = Date.now()
      this.execute()
    }, Math.max(0, milliseconds_to_next_loop))
  }

  request (uri, override_qs) {
    console.log(`${this.proxy} -> "${uri}"`)
    return rp({
      qs: override_qs ? override_qs : this.query_string,
      uri,
      gzip: this.gzip,
      proxy: config.proxy_protocol + this.proxy + config.proxy_port,
      headers: this.headers,
      resolveWithFullResponse: true
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

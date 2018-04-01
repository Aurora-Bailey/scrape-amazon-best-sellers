const cheerio = require('cheerio')
const rp = require('request-promise')
const mongo = require('./mongodb')
const dm = require('./datamanager')

class Main {
  constructor () {
    this.start = Date.now()
    this.last = 0
    this.speed = 1000
    this.loop = 0
    this.end = 100000
    this.proxies = [
      "34.212.167.1",
      "54.218.13.67",
      "54.218.2.246"
    ]
    this.last_proxy = 0
  }

  execute (opt = {uri: '', qs: {}}) {
    opt.proxy = this.getProxy()
    dm.getScrapeLink(opt.proxy).then(link => {
      let scraping_page = link.scraped_pages + 1
      opt.qs.pg = scraping_page
      opt.uri = link.uri

      console.log('Request #', this.loop, ' opt: ', JSON.stringify(opt))
      this.scrape(opt).then(html => {
        let $ = cheerio.load(html)

        console.log($('#zg_browseRoot').find('a').length, ' Links found. ', $('.zg_itemImmersion').length, 'Products found.')

        // Find new links
        $('#zg_browseRoot').find('a').each(function (i, e) {
          let uri = $(this).attr('href').split('/ref=')[0]
          let text = $(this).text()
          dm.addLink(uri, text, opt.uri)
        })

        // Get Product Data
        $('.zg_itemImmersion').each(function (i, e) {
          let item = {}
          try {
            item.rank = parseInt($(this).find('.zg_rankNumber').text().replace(/\W/g, ''))
            item.price = parseFloat($(this).find('.p13n-sc-price').text().replace('$', ''))
            item.thumbnail = $(this).find('img').attr('src')
            item.title = $(this).find('img').attr('alt')
            item.rating = parseFloat($(this).find('.a-icon-star').text().split(' ')[0])
            item.numreviews = parseInt($(this).find('.a-size-small').text().replace(/\W/g, ''))
            item.link = 'https://www.amazon.com' + $(this).find('.a-text-normal').attr('href').split('/ref=')[0]
            dm.addLinkProduct(opt.uri, item)
          }
          catch(err) {
            console.log('unable to parse item')
            item.error = true
            dm.addLinkProduct(opt.uri, item)
          }
        })

        // Update number of pages
        let pages = $('#zg_paginationWrapper').find('a').length
        if (pages == 0) pages = 1
        dm.updateLinkPages(opt.uri, pages).then(r => {
          dm.updateLinkScrapedPages(opt.uri, 1).then(r2 => {
            if (scraping_page >= pages) {
              dm.updateLinkScraped(opt.uri, true).then(r3 => {
                this.nextLoop(opt)
              })
            } else {
              this.nextLoop(opt)
            }
          })
        })

      }).catch(err => {console.log('Scrape Error: ', err); setTimeout(() => {this.nextLoop(opt)}, 60000)})
    }).catch(err => {console.error('Get link Error:', err); setTimeout(() => {this.nextLoop(opt)}, 60000)})
  }

  nextLoop (opt) {
    this.loop++
    if (this.loop >= this.end) return false
    let milliseconds_since_last_loop = Date.now() - this.last
    let milliseconds_to_next_loop = this.speed - milliseconds_since_last_loop
    setTimeout(() => {
      this.last = Date.now()
      this.execute(opt)
    }, Math.max(0, milliseconds_to_next_loop))
  }

  getProxy () {
    let num = this.proxies.length
    let proxy = this.last_proxy + 1
    if (proxy >= num) proxy = 0
    this.last_proxy = proxy

    return 'http://' + this.proxies[proxy] + ':3128'
  }

  scrape (opt) {
    const options = {
      proxy: opt.proxy,
      uri: opt.uri,
      qs: opt.qs,
      gzip: true,
      headers: {
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
    }
    return rp(options)
  }

}
var main = new Main()

// only virgin run will add a new link entry
dm.addLink("https://www.amazon.com/Best-Sellers/zgbs", "Amazon Best Sellers", null).then(r => {
  main.execute()
}).catch(err => {console.log(err)})

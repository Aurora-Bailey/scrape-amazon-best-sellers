const cheerio = require('cheerio')
const dm = require('./datamanager')

class Scraper {
  constructor () {

  }

  scrape (uri, response) {
    return new Promise((resolve, reject) => {
      if (response.statusCode != 200) reject(response)
      let newLinks = []

      if (response.headers['content-type'].match('json')) {
        newLinks.concat(this.json(uri, response.body))
      } else if (response.headers['content-type'].match('html')) {
        newLinks.concat(this.html(uri, response.body))
      }

      resolve(newLinks)
    })
  }

  html (current_uri, body) {
    var $ = cheerio.load(body)
    var strip_current_uri = current_uri.split('?')[0]

    // title
    let page_title $('#zg_listTitle').text()

    // Find new links
    var foundLinks = []
    $('#zg_browseRoot').find('a').each(function (i, e) {
      let uri = $(this).attr('href').split('/ref=')[0]
      let text = $(this).text()
      foundLinks.push({uri, text, current_uri})
    })
    // Pagination to links
    let pages = $('#zg_paginationWrapper').find('a').length
    for (var i = 2; i <= pages; i++) {
      foundLinks.push({uri: strip_current_uri + '?pg=' + i, text: 'pagination', parent_uri: strip_current_uri})
    }

    // Find procucts/data
    let product_list = []
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
        // lm.addLinkProduct(opt.uri, item)
        product_list.push(item)
      }
      catch(err) {
        console.log('unable to parse item')
        item.error = true
        // lm.addLinkProduct(opt.uri, item)
        product_list.push(item)
      }
    })

    dm.insertData(strip_current_uri, page_title, product_list).catch(err => {console.error(err)})
    return foundLinks
  }

  json (url, body) {
    var json = JSON.parse(body)
    var foundLinks = []

    return foundLinks
  }
}

module.exports = new Scraper()

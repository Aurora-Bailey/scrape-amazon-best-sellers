const scraper = require('./scraper')

class Worker {
  constructor (cluster) {
    this.cluster = cluster
    this.proxy = process.env.PROXY

    this.listenForProcessEvents()
    scraper.start()
  }

  listenForProcessEvents () {
    process.on('message', m => {
      console.log(m)
    })
  }
}

module.exports = Worker

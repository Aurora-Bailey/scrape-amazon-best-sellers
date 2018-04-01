const crawler = require('./crawler')

class Worker {
  constructor (cluster) {
    this.cluster = cluster
    this.proxy = process.env.PROXY

    this.listenForProcessEvents()
    crawler.start()
  }

  listenForProcessEvents () {
    process.on('message', m => {
      console.log(m)
    })
  }
}

module.exports = Worker

const crawler = require('./crawler')

class Worker {
  constructor (cluster) {
    this.cluster = cluster
    this.proxy = process.env.PROXY

    this.listenForProcessEvents()
  }

  listenForProcessEvents () {
    process.on('message', m => {
      switch (m) {
        case 'start':
          crawler.start()
          break;
        case 'stop':
          crawler.stop()
          break;
        default:
      }
    })
  }
}

module.exports = Worker

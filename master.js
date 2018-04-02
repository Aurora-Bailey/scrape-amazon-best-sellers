const http = require('http')
const config = require('./config')
const dm = require('./datamanager')

class Master {
  constructor (cluster) {
    this.cluster = cluster
    this.workers = []
    this.proxies = config.proxies

    this.listenForClusterEvents()
    this.createServer()

    // add seed link before creating workers
    dm.seedLink(config.seed.url, config.seed.title).then(r => {
      this.createWorkers()
    }).catch(err => {console.error(err)})
  }

  listenForClusterEvents () {
    this.cluster.on('exit', (worker, code, signal) => {
      console.log(`worker ${worker.process.pid} died`)
    })
  }

  messageWorkers (m) {
    this.workers.forEach(worker => {
      worker.send(m)
    })
  }

  createWorkers () {
    this.proxies.forEach(proxy => {
      this.workers.push(this.cluster.fork({PROXY: proxy}))
    })
  }

  createServer () {
    http.createServer((req, res) => {
      res.writeHead(200, {'Content-Type': 'text/html'})
      switch (req.url) {
        case '/stop':
          this.messageWorkers('stop')
          res.write('Server is off! <a href="/start">start</a>')
          break
        case '/start':
          this.messageWorkers('start')
          res.write('Server is on. <a href="/stop">stop</a>')
          break
        default:
          res.write('Server is off! <a href="/start">start</a>')
      }
      res.end()
    }).listen(8351)

    console.log('listening on port 8351')
  }
}

module.exports = Master

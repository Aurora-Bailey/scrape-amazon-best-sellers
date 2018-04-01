const http = require('http')

class Master {
  constructor (cluster) {
    this.cluster = cluster
    this.workers = []
    this.proxies = [
      "34.212.167.1",
      "54.218.13.67",
      "54.218.2.246"
    ]

    this.listenForClusterEvents()
    this.createWorkers()
    this.createServer()
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

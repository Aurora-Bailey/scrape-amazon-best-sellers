const cluster = require('cluster')
const Master = require('./master')
const Worker = require('./worker')

if (cluster.isMaster) {
  let master = new Master(cluster)
} else {
  let worker = new Worker(cluster)
}

const MongoClient = require('mongodb').MongoClient
const config = require('./config')

class Mongo {
  constructor() {
    this._url = config.database_url
    this._dbName = config.database_name
    this._db = false
  }

  getDB () {
    return new Promise((resolve, reject) => {
      if (this._db) {
        resolve(this._db)
      } else {
        MongoClient.connect(this._url,(err, client) => {
          if (err) {
            reject(err)
          } else {
            this._db = client.db(this._dbName)
            resolve(this._db)
          }
        })
      }
    })
  }
}

module.exports = new Mongo()

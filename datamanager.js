const mongo = require('./mongodb')
const md5 = require('md5')

class DataManager {
  constructor() {
    this.collection = "data"
  }

  newEntry (uri, uri_md5, title) {
    return new Promise((resolve, reject) => {
      mongo.getDB().then(db => {
        db.collection(this.collection).insertOne({uri, uri_md5, title, data: [], added: Date.now()}, (err, results) => {
          if (err) reject(err)
          else resolve(true)
        })
      })
    })
  }

  updateData (uri_md5, data) {
    return new Promise((resolve, reject) => {
      mongo.getDB().then(db => {
        db.collection(this.collection).updateOne({uri_md5}, {$push: {data: {$each: data}}}, (err, results) => {
          if (err) reject(err)
          else resolve(true)
        })
      })
    })
  }

  insertData (uri, title, data) {
    let uri_md5 = md5(uri.toLowerCase())

    return new Promise((resolve, reject) => {
      mongo.getDB().then(db => {
        db.collection(this.collection).find({uri_md5}).toArray((err, docs) => {
          if (err) reject(err)
          else {
            if (docs.length == 0) {
              // not found
              this.newEntry(uri, uri_md5, title).then(r => {
                this.updateData(uri_md5, data).then(r => {
                  resolve(true)
                }).catch(err => {reject(err)})
              }).catch(err => {reject(err)})
            } else {
              // found
              this.updateData(uri_md5, data).then(r => {
                resolve(true)
              }).catch(err => {reject(err)})
            }
          }
        })
      })
    })
  }

}

module.exports = new DataManager()

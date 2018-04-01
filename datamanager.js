const mongo = require('./mongodb')

class DataManager {
  constructor() {
  }

  updateLinkPages (uri, pages) {
    return new Promise((resolve, reject) => {
      mongo.getDB().then(db => {
        db.collection('links').updateOne({uri}, {$set: {pages}}, (err, results) => {
          if (err) reject(err)
          else resolve(true)
        })
      })
    })
  }

  updateLinkScrapedPages (uri, inc) {
    return new Promise((resolve, reject) => {
      mongo.getDB().then(db => {
        db.collection('links').updateOne({uri}, {$inc: {scraped_pages: inc}}, (err, results) => {
          if (err) reject(err)
          else resolve(true)
        })
      })
    })
  }

  updateLinkScraped (uri, set) {
    return new Promise((resolve, reject) => {
      mongo.getDB().then(db => {
        db.collection('links').updateOne({uri}, {$set: {scraped: set}}, (err, results) => {
          if (err) reject(err)
          else resolve(true)
        })
      })
    })
  }

  addLinkProduct (uri, product) {
    return new Promise((resolve, reject) => {
      mongo.getDB().then(db => {
        db.collection('links').updateOne({uri}, {$push: {products: product}}, (err, results) => {
          if (err) reject(err)
          else resolve(true)
        })
      })
    })
  }

  addLink (uri, text, parent) {
    return new Promise((resolve, reject) => {
      mongo.getDB().then(db => {
        db.collection('links').find({uri}).toArray((err, docs) => {
          if (err) reject(err)
          else {
            if (docs.length == 0) {
              db.collection('links').insertOne({uri, parent, text, added: Date.now(), scraped: false, scraped_pages: 0, pages: 0, products: [], worker: false}, (err, results) => {
                if (err) reject(err)
                else resolve(true)
              })
            } else {
              resolve(false)
            }
          }
        })
      })
    })
  }

  getScrapeLink (worker) {
    return new Promise((resolve, reject) => {
      mongo.getDB().then(db => {
        db.collection('links').find({scraped: false}).limit(1).toArray((err, docs) => {
          if (err) reject(err)
          else {
            if (docs.length == 0) {
              reject('getScrapeLink returned 0 results.')
            } else {
              resolve(docs[0])
            }
          }
        })
      })
    })
  }
}

module.exports = new DataManager()

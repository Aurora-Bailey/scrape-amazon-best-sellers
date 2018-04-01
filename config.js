class Config {
  constructor () {
    //================================ Database ==================================
    this.database_url = 'mongodb://localhost:27017'
    this.database_name = 'scrape-amazon-test'

    //================================ Crawler ===================================
    this.seed = {
      url: 'https://www.amazon.com/Best-Sellers/zgbs',
      title: 'Amazon Best Sellers'
    }
    this.headers = {
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
      "Accept-Encoding": "gzip, deflate, br",
      "Accept-Language": "en-US,en;q=0.9",
      "Cache-Control": "max-age=0",
      "Connection": "keep-alive",
      "Host": "www.amazon.com",
      "Referer": "https://www.google.com/",
      "Upgrade-Insecure-Requests": "1",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36"
    }
    this.gzip = true
    this.speed = 1000 // time between each request per proxy in milliseconds
    this.error_timeout = 60000 // on error move to next link after x milliseconds
  }
}
module.exports = new Config()

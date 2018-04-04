class Config {
  constructor () {
    //================================ Setup =====================================
    this.proxies = [
      // oregon
      "34.211.52.72",
      "54.202.43.219",
      "34.209.41.55",
      "54.187.71.178",
      "54.245.69.248",
      "54.186.0.177",
      "34.213.48.206",
      "54.186.233.83",
      // virginia
      "34.201.0.124",
      "34.205.246.28",
      "34.227.226.8",
      "34.233.126.241",
      "34.239.136.41",
      "54.152.9.177",
      "54.152.31.107",
      "54.224.250.218",
      // california
      "13.56.213.123",
      "13.57.209.141",
      "18.144.24.206",
      "18.144.41.135",
      "18.144.56.6",
      "52.53.232.211",
      "54.183.216.194",
      "54.193.26.160"
    ]
    this.proxy_port = ':3128'
    this.proxy_protocol = 'http://'

    //================================ Database ==================================
    this.database_url = 'mongodb://localhost:27017'
    this.database_name = 'amazon-best-sellers-april-2018'
    // this.database_name = 'scrape-amazon-best-sellers'

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
    this.speed = 2000 // time between each request per proxy in milliseconds
    this.error_timeout = 60000 // on error move to next link after x milliseconds
  }
}
module.exports = new Config()

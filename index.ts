import http from 'http'
import httpProxy from 'http-proxy'

const gatewayPort = process.env.PORT || 5000

const services = {
  '/auth': 5001,
  '/units': 5002,
  '/customers': 5003,
  '/maintenance': 5004,
  '/aggregator': 5100,
}

const proxy = httpProxy.createProxyServer({});

http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  
  try {
    let proxied = false
    
    Object.entries(services).forEach(([path, port]) => {
      if (req.url?.startsWith(path)) {
        proxied = true
        req.url = req.url.slice(path.length)

        proxy.web(req, res, { target: `${process.env.SERVICE_URL}:${port}` })
      }
    })
  
    if (!proxied) {
      res.writeHead(404, { 'Content-Type': 'text/plain' })
      res.end('Not found')
    }
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'text/plain' })
    res.end('Internal server error')
  }
}).listen(process.env.PORT as unknown as number || 5000)

console.log(`API Gateway running at http://localhost:${gatewayPort}`)
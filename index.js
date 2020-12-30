const restify = require("restify")
const corsMiddleware = require("restify-cors-middleware")
const { renderFile } = require("pug")
require("dotenv").config()

const server = restify.createServer()

// Headers
const cors = corsMiddleware({
  preflightMaxAge: 5,
  origins: [
    "http://0.0.0.0:8000",
    "http://localhost:8080",
    "http://localhost:8081",
    "http://127.0.0.1:8887",
    "http://fruktkartan.se",
    "https://fruktkartan.se",
    "https://fruktkartan.github.io",
    "https://fruktkartan.netlify.com",
    "https://fruktkartan.netlify.app",
    "https://master--fruktkartan.netlify.com",
    "https://master--fruktkartan.netlify.app",
    "https://quite--fruktkartan.netlify.com",
    "https://quite--fruktkartan.netlify.app",
  ],
})
server.pre(cors.preflight)
server.use(cors.actual)
server.use((req, res, next) => {
  res.charSet("utf-8")
  return next()
})

// Routes
server.get({ path: "/" }, (req, res, next) => {
  let html = renderFile("views/index.pug")
  res.end(html)
})

server.get(
  "/public/*",
  restify.plugins.serveStatic({
    directory: __dirname,
  })
)

server.get(
  {
    path: "/edits",
  },
  require(__dirname + "/routes/v1/edits.js")
)

server.use(
  restify.plugins.queryParser({
    mapParams: true,
  })
)

server.get(
  {
    path: "/trees",
  },
  require(__dirname + "/routes/v1/trees.js")
)

server.get(
  {
    path: "/tree/:key",
  },
  require(__dirname + "/routes/v1/tree.js")
)

server.use(
  restify.plugins.bodyParser({
    mapParams: true,
  })
)

server.put(
  {
    path: "/tree",
  },
  require(__dirname + "/routes/v1/put-tree.js")
)

server.post(
  {
    path: "/tree/:key",
  },
  require(__dirname + "/routes/v1/post-tree.js")
)

server.del(
  {
    path: "/tree/:key",
  },
  require(__dirname + "/routes/v1/delete-tree.js")
)

server.post(
  {
    path: "/sign",
  },
  require(__dirname + "/routes/v1/sign.js")
)

server.listen(process.env.PORT || 8080, () => {
  // eslint-disable-next-line no-console
  console.log("%s listening at %s", server.name, server.url)
})

module.exports = server

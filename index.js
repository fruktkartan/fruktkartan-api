// ssm_key, description, img, type, lat, lon

const restify = require("restify")
const {renderFile} = require("pug")

const server = restify.createServer()
server.use(restify.plugins.queryParser({
  mapParams: true
}))
server.use(restify.plugins.bodyParser())

server.use((req, res, next) => {
  res.charSet("utf-8")
  return next()
})

// Routes
server.get({path: "/"}, (req, res, next) => {
  let html = renderFile("views/index.pug")
  res.end(html)
})

server.get("/public/*", restify.plugins.serveStatic({
  directory: __dirname,
}))

server.get({
  path: "/trees",
}, require(__dirname + "/routes/v1/trees.js"))

server.get({
  path: "/tree/:key",
}, require(__dirname + "/routes/v1/tree.js"))

server.listen(process.env.PORT || 8080, function() {
  // eslint-disable-next-line no-console
  console.log("%s listening at %s", server.name, server.url)
})

module.exports = server

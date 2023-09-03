import Fastify from "fastify"
import cors from "@fastify/cors"
import serveStatic from "@fastify/static"
import sensible from "@fastify/sensible"
import fs from "fs"

import getEdits from "./routes/v1/edits.js"
import getTrees from "./routes/v1/trees.js"
import getTree from "./routes/v1/tree.js"
import deleteTree from "./routes/v1/delete-tree.js"
import putTree from "./routes/v1/put-tree.js"
import postTree from "./routes/v1/post-tree.js"
import flag from "./routes/v1/flag.js"

import path from "path"
import url from "url"
const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

import dotenv from "dotenv"
dotenv.config()

const build = async function (opts = {}) {
  const fastify = Fastify(opts)

  fastify.addHook("preHandler", (req, res, done) => {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Methods", "POST")
    res.header("Access-Control-Allow-Headers", "*")

    const isPreflight = /options/i.test(req.method)
    if (isPreflight) {
      return res.send()
    }
    done()
  })

  await fastify.register(sensible)
  await fastify.register(cors, {
    origin: true,
    allowedHeaders: [
      "Accept",
      "Access-Control-Allow-Headers",
      "Access-Control-Request-Method",
      "Access-Control-Request-Headers",
      "Authorization",
      "Cache-Control",
      "Content-Type",
      "Origin",
      "Proxy-Authorization",
      "Proxy-Authenticate",
      "WWW-Authenticate",
      "X-Requested-With",
      "x-cache",
    ],
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
    methods: ["POST", "OPTIONS"],
    preflight: true,
    preflightMaxAge: 5,
    strictPreflight: true,
  })

  // Routes
  fastify.get("/", (request, reply) => {
    const html = fs.readFileSync("views/index.html")
    reply.type("text/html").send(html)
  })

  fastify.register(serveStatic, {
    root: path.join(__dirname, "public"),
    prefix: "/public",
  })

  fastify.get("/edits", getEdits)
  fastify.get("/trees", getTrees)
  fastify.get("/tree/:key", getTree)
  fastify.delete("/tree/:key", deleteTree)
  fastify.put("/tree/:key", putTree)
  fastify.post("/tree/:key", postTree)
  fastify.post("/flag/:action/:key", flag)

  return fastify
}

export default build

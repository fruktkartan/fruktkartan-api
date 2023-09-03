#!/usr/bin/env node
import app from "./app.js"

const fastify = await app({
  logger: {
    level: process.env.LOG_LEVEL || "error",
  },
})

const port = process.env.PORT || 8080
const host = "0.0.0.0"
fastify.listen({ port, host }, (err, address) => {
  if (err) throw err
  // eslint-disable-next-line no-console
  console.log(`Server is now listening on ${address}`)
})

/**
 * Flag a tree for moderation
 */
import pg from "pg"
import { sanitizeText, userHash } from "./utils.js"

const allowedFlags = ["delete", "test"]

export default (req, reply) => {
  if (!req.params.key) {
    reply.badRequest("Missing key!")
  }
  if (!req.params.flag) {
    reply.badRequest("Missing flag!")
  }
  const flag = req.params.flag
  if (!allowedFlags.includes(flag)) {
    reply.badRequest(`Invalid flag (${flag}). Must be one of ${allowedFlags}`)
  }
  const reason = req.body?.reason || ""
  const user = userHash(req)
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  })

  client.connect()
  const query = [
    "INSERT INTO flags",
    "  (flagged_by, tree, flag, reason)",
    "  VALUES ($1, $2, $3, $4)",
  ].join(" ")

  client.query(
    query,
    [user, req.params.key, flag, sanitizeText(reason)],
    (err, res) => {
      if (err) {
        reply.internalServerError(
          // TODO: Would be nice with a different response for already flagged tree
          "Temporary technical error, or the tree has already been deleted or flagged."
        )
      } else if (res && !res.rowCount) {
        reply.notFound(`Nothing to update for tree ${req.params.key}`)
      }
      client.end()
      reply.code(204).send()
    }
  )
}

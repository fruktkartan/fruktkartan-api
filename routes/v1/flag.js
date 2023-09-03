/**
 * Flag a tree for moderation
 */
import pg from "pg"

export default (req, reply) => {
  if (!req.params.key) {
    reply.badRequest("Missing key!")
  }
  if (!req.params.action) {
    reply.badRequest("Missing action!")
  }
  let flag = "true"
  if (req.body && "flag" in req.body) {
    flag = req.body.flag
  }
  if (!(flag === "true" || flag === "false")) {
    reply.badRequest("Invalid flag. Must be 'true' or 'false'")
  }
  const action = req.params.action
  const allowedActions = ["delete"]
  if (!allowedActions.includes(action)) {
    reply.badRequest(
      `Invalid action (${action}). Must be one of ${allowedActions}`
    )
  }
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  })

  client.connect()
  const query = [
    "UPDATE trees",
    `SET flag_${action} = ${flag}`,
    "WHERE ssm_key = $1",
  ].join(" ")

  client.query(query, [req.params.key], (err, res) => {
    if (err) {
      reply.internalServerError(`Error connecting to database: ${err}`)
    }
    if (!res.rowCount) {
      reply.notFound(`Nothing found to flag for key ${req.params.key}`)
    }
    client.end()
    reply.code(204).send()
  })
}

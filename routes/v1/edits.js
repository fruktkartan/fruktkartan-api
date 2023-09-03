import pg from "pg"

export default (req, reply) => {
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  })
  client.connect()
  let query = [
    "SELECT ssm_key, description, img, type",
    "       , ST_Y(point) AS lat, ST_X(point) AS lon",
    "       , added_at, added_by",
    "  FROM trees",
    "  ORDER BY added_at DESC",
  ].join(" ")
  client.query(query, (err, data) => {
    client.end()
    if (err) {
      reply.internalServerError(`Error connecting to database: ${err}`)
    }
    let edits = data.rows.map(x => {
      x.ssm_key = x.ssm_key.trim()
      return x
    })
    reply
      .code(200)
      .header("Content-Type", "application/json; charset=utf-8")
      .send(edits)
  })
}

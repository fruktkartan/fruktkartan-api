import pg from "pg"

export default (req, reply) => {
  const key = req.params.key
  if (!key) {
    reply.badRequest("Key missing")
  }

  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
    connectionTimeoutMillis: 3000,
  })
  client.connect()
  const query = [
    "SELECT flag_delete, description, added_at, type, img",
    "       , ST_Y(point) AS lat, ST_X(point) AS lon",
    "  FROM trees",
    "  WHERE ssm_key = $1",
  ].join(" ")
  client.query(query, [key], (err, data) => {
    if (err) {
      client.end()
      reply.internalServerError(`Error connecting to database: ${err}`)
      return
    }
    if (!data.rows.length) {
      client.end()
      reply.notFound(`Could not find tree with id ${key}`)
      return
    }
    let tree = data.rows[0]
    const treeRes = {
      type: tree.type.trim(),
      file: tree.img,
      desc: tree.description,
      added: tree.added_at,
      lat: tree.lat,
      lon: tree.lon,
      flags: {
        delete: tree.flag_delete,
      },
    }
    client.end()
    reply
      .code(200)
      .header("Content-Type", "application/json; charset=utf-8")
      .send(treeRes)
  })
}

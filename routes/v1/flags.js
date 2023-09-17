/**
 * List flagged trees
 */
import pg from "pg"

export default (req, reply) => {
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  })
  client.connect()
  const query = {
    name: "flags",
    text: "SELECT * FROM flags",
  }
  client
    .query(query)
    .then(res => {
      let flags = res.rows.map(x => ({
        ...x,
        tree: x.tree.trim(),
        flag: x.flag.trim(),
      }))
      reply
        .code(200)
        .header("Content-Type", "application/json; charset=utf-8")
        .send(flags)
    })
    .catch(err =>
      reply.internalServerError(`Error connecting to database: ${err}`)
    )
    .then(() => client.end())
}

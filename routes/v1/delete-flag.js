import pg from "pg"

export default (req, reply) => {
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  })
  const tree = req.params.key
  const flag = req.params.flag
  client.connect()
  const query = "DELETE FROM flags WHERE tree = $1 AND flag = $2"
  client
    .query(query, [tree, flag])
    .then(res => {
      if (res.rowCount === 0) {
        reply.notFound("No such tree/flag")
      } else {
        reply.code(204).send()
      }
    })
    .catch(err =>
      reply.internalServerError(`Error connecting to database: ${err}`)
    )
    .finally(() => client.end())
}

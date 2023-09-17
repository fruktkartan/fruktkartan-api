import pg from "pg"

export default (req, reply) => {
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  })
  const key = req.params.key
  client.connect()

  const query1 = "DELETE FROM flags WHERE tree = $1"
  client.query(query1, [key])

  const query2 = "DELETE FROM trees WHERE ssm_key = $1"
  client.query(query2, [key], (err, response) => {
    client.end()
    if (err) {
      reply.internalServerError(`Error connecting to database: ${err}`)
    }
    if (response.rowCount === 0) {
      reply.notFound(`No such tree to delete: ${key}`)
    }
    reply.code(204).send()
  })
}

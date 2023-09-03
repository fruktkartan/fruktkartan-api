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
  const query = "DELETE FROM trees WHERE ssm_key = $1"
  client.query(query, [key], (err, response) => {
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

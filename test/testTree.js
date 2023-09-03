import { test } from "tap"
import build from "../app.js"

const app = await build()

test("Deleting a tree", async t => {
  const response = await app.inject({
    method: "DELETE",
    url: "/tree/this-is-not-a-valid-tree-id",
  })
  t.equal(
    response.statusCode,
    404,
    "should return an error if the tree doesn't exist"
  )
})

test("Asking for a tree", async t => {
  let response = await app.inject({
    method: "GET",
    url: "/tree/",
  })
  t.equal(
    response.statusCode,
    400,
    "should return an error for an invalid request"
  )
  response = await app.inject({
    method: "GET",
    url: "/tree/this-is-not-a-valid-tree-id",
  })
  t.equal(
    response.statusCode,
    404,
    "should return an error if the tree doesn't exist"
  )
})

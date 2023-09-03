import { test } from "tap"
import build from "../app.js"

const app = await build()

test("Calling trees", async t => {
  const response = await app.inject({
    method: "GET",
    url: "/trees",
  })
  t.equal(response.statusCode, 200, "should return 200")
  t.equal(
    response.headers["content-type"],
    "application/json; charset=utf-8",
    "should be json"
  )
  t.ok(response.body.length > 1000, "should be a long list")
})

test("Using a bbox", async t => {
  let response = await app.inject({
    method: "GET",
    url: "/trees?bbox=59.1,10,59.2,20",
  })
  t.equal(response.statusCode, 200, "should return 200")
  t.equal(
    response.headers["content-type"],
    "application/json; charset=utf-8",
    "should be json"
  )
  t.ok(response.body.length < 1000, "should return a limited list of trees")

  response = await app.inject({
    method: "GET",
    url: "/trees?bbox=59.1,10,59.2",
  })
  t.equal(
    response.statusCode,
    400,
    "should return an error on too few coordinates"
  )

  response = await app.inject({
    method: "GET",
    url: "/trees?bbox=59.1,10,159.2,320",
  })
  t.equal(
    response.statusCode,
    400,
    "should return an error on invalid coordinates"
  )

  response = await app.inject({
    method: "GET",
    url: "/trees?bbox=59.1,10,59.2,X",
  })
  t.equal(
    response.statusCode,
    400,
    "should return an error on non-parsable coordinates"
  )
})

/**
 * Tests for the `/tree` endpoint
 */
const app = require("../index")
const request = require("supertest")

describe("Deleting a tree", function () {
  it("should return an error if the tree doesn't exist", function (done) {
    request(app).delete("/tree/this-is-not-a-valid-tree-id").expect(404, done)
  })
})

describe("Asking for a tree", function () {
  it("should return an error for an invalid request", function (done) {
    request(app).get("/tree/").expect(409, done)
  })
  it("should return an error if the tree doesn't exist", function (done) {
    request(app).get("/tree/this-is-not-a-valid-tree-id").expect(404, done)
  })
})

app.close()

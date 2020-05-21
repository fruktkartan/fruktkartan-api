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

app.close()

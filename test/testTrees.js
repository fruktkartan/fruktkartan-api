/* Tests the /lead/html endponit*/
const assert = require("assert")
const request = require("supertest")("http://localhost:8080")


describe('Calling trees', function() {
  it('should return a long list of trees', function(done) {
    request
      .get('/trees')
      .expect(200, done)
      .expect("Content-Type", "application/json; charset=utf-8")
      .expect(x => x.length > 1000)
  })
})
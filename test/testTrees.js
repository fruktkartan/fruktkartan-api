/* Tests the /lead/html endponit*/
const assert = require("assert")
const request = require("supertest")("http://localhost:8080")


describe('Calling trees', function() {
  it('should return a long list of trees', function(done) {
    request
      .get('/trees')
      .expect(200)
      .expect("Content-Type", "application/json; charset=utf-8")
      .then(r => {
        assert(r.body.length > 1000)
        assert(r.body.every(x => x.key))
        done()
      })
  })
})

describe('Using a bbox', function() {
  it('should return a limited list of trees', function(done) {
    request
      .get('/trees?bbox=59.1,10,59.2,20')
      .expect(200)
      .expect("Content-Type", "application/json; charset=utf-8")
      .then(r => {
        assert(r.body.length)
        assert(r.body.length < 1000)
        done()
      })
    })
  it('should return an error on invalid coordinates', function(done) {
    request
      .get('/trees?bbox=59.1,10,59.2')
      .expect(409, done)
    })
})
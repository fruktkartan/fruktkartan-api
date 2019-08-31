New API (fall 2019) for [fruktkartan.se](http://fruktkartan.se). The API is hosted at Heroku. Data is stored in a Postgres db, that could later be extended with PostGIS, to allow for more efficient geo-querying. Files are stored at S3. 

## Installing

```sh
git clone git@github.com:rotsee/fruktkartan-api.git
cd fruktkartan-api
npm install
```

## Developing

Set the environment variable DATABASE_URL to the Postgres URL before starting the service.

### Linting

```sh
eslint .
```

### Testing


### To do

 - File uploading
 - File parsing (validating, creating thumbnails etc). Use AWS Lambda for this.

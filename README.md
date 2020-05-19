[![Node CI](https://github.com/fruktkartan/fruktkartan-api/workflows/Node%20CI/badge.svg)](https://github.com/fruktkartan/fruktkartan-api/actions)

New API (fall 2019) for [fruktkartan.se](http://fruktkartan.se). The API is
hosted at Heroku. Data is stored in a Postgres db, that could later be extended
with PostGIS, to allow for more efficient geo-querying. Files are stored at S3,
where they are validated, cropped and checked by a separate AWS Lambda Python
script.

## Installing

```sh
git clone git@github.com:rotsee/fruktkartan-api.git
cd fruktkartan-api
npm install
```

## Developing

Set the environment variable DATABASE_URL to the Postgres URL before starting
the service.

### Testing

```sh
npm test
```

## Using the API to sign a AWS S3 upload request.

Uploading a file is a two-step process: The front-end script needs to first
retrieve a request token, and then use that to upload the file directly to
Amazon S3. The files are checked, resized, etc once uploaded. This means that
this API has no way to know if a file has been discarded (e.g. for being
invalid). The client will have to call the `/tree` endpoint again, to see if a
photo has been added.

Here is a sample implementation:

```javascript
const API = "http://localhost:3000"

function getSignedRequest(file, cb) {
  const xhr = new XMLHttpRequest();
  const cb_ = cb;
  xhr.open('POST', `${API}/sign?file-name=${file.name}`);
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        cb_(null, JSON.parse(xhr.responseText));
      } else {
        cb_(xhr.status, xhr.responseText);
      }
    }
  };
  xhr.send();
}

function uploadFile(file, signedRequest, cb) {
  const cb_ = cb;
  const xhr = new XMLHttpRequest();
  xhr.open('PUT', signedRequest);
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        cb_(null, xhr.responseText);
      } else {
        cb_(xhr.status, xhr.statusText || xhr.responseText || "okänt fel");
      }
    }
  };
  xhr.send(file);
}

const files_el = document.getElementById('file-input');
files_el.addEventListener("change", () => {
  const file = files_el.files[0];
  getSignedRequest(file, (err, msg) => {
   if (err) {
     console.log(err);
     return;
   }
   uploadFile(file, msg.signedRequest, (err, msg) => {
     if (err !== null) {
       console.log(`Fel vid uppladdning: ${msg} (kod: ${err})`);
     } else {
       console.log("Filen är uppladdad. Yay");
     }
   });
 })
}, false);
```

## Database

A Postgres database with PostGIS 2.0+ is required, (at least) due to relying on
implicit (unspecified) SRID (spatial reference id).

For database definition, including the history table, trigger & function, see
[`schema.sql`](schema.sql).

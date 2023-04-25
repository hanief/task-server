const environment = process.argv.slice(2).length ? process.argv.slice(2)[0] : 'db'
const port = process.argv.slice(3).length ? process.argv.slice(3)[0] : 3001

const fs = require('fs');
require('dotenv').config()
const secretKey = process.env.SECRET_KEY
const mode = environment === 'dev' ? fs.constants.COPYFILE_EXCL : null

fs.copyFile('db.json', `${environment}.json`, mode, (err) => {
  if (err) {
    if (err.code === 'EEXIST') {
      console.log(`Using existing ${environment}.json file`);
      return runServer()
    } else {
      throw err;
    }
  }

  runServer()
});

function runServer() {
  const jsonServer = require("json-server");
  const server = jsonServer.create();
  const router = jsonServer.router(`${environment}.json`);
  const middlewares = jsonServer.defaults();

  server.use(middlewares);

  function isAuthorized(req) {
    if (req.headers.authorization) {
      const [type, credentials] = req.headers.authorization.split(' ')
      if (type === 'Bearer' && credentials === secretKey) {
        return true
      }
    }

    if (req.query.user) {
      return true
    }

    return false
  }

  server.use((req, res, next) => {
    if (isAuthorized(req)) {
      next()
    } else {
      res.sendStatus(401)
    }
  })

  server.use(router);
  server.listen(port, () => console.log(`Server ${environment} is running`));
}
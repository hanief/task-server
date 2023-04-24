const environment = process.argv.slice(2)[0] === 'test' ? 'test' : 'dev'
const port = process.argv.slice(3) ? process.argv.slice(3)[0] : 3001

const jsonServer = require("json-server");
const secretKey = process.env.NUXT_PUBLIC_SECRET
const server = jsonServer.create();
const router = jsonServer.router(filePath, { watch: environment === 'dev' });
const middlewares = jsonServer.defaults();

server.use(middlewares);

server.get("/", (req, res) => {
  res.send("Hello World!");
});

function isAuthorized(req) {
  if (req.headers.authorization) {
    const [type, credentials] = req.headers.authorization.split(' ')
    if (type === 'Bearer' && credentials === secretKey) {
      return true
    }
  }

  return false
}

server.use((req, res, next) => {
  if (isAuthorized(req)) {
    if (req.path === '/tasks') {
      if (req.query.user_id) {
        next()
      } else {
        res.json([])
      }
    } else if (req.path.substring(0, 7) === '/tasks/') {
      if (req.query.user_id) {
        next()
      } else {
        res.json({})
      }
    } else {
      next()
    }
  } else {
    res.sendStatus(401)
  }
})

server.use(router);
server.listen(port, () => console.log("API Server is running"));
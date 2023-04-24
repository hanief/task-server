const jsonServer = require("json-server");

const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

server.use(middlewares);

server.get('/', (req, res) => {
  res.send('Hello!')
})

server.use((req, res, next) => {
  if (req.path === '/tasks') {
    if (req.query.userId) {
      next()
    } else {
      res.json([])
    }
  } else {
    next()
  }
})

server.use(router);

server.listen(3001, () => console.log("Server is running"));
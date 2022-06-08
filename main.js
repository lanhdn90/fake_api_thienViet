const jsonServer = require("json-server");
const queryString = require("query-string");
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();
// Set default middlewares (logger, static, cors and no-cache)
server.use(middlewares);

// Add custom routes before JSON Server router
server.get("/echo", (req, res) => {
  res.jsonp(req.query);
});

// To handle POST, PUT and PATCH you need to use a body-parser
// You can use the one used by JSON Server
server.use(jsonServer.bodyParser);
server.use((req, res, next) => {
  if (req.method === "POST") {
    req.body.createdAt = Date.now();
  }
  // Continue to JSON Server router
  next();
});

router.render = (rep, res) => {
  const headers = res.getHeaders();
  const totalCountHeader = headers["x-total-count"];
  if (rep.method === "GET" && totalCountHeader) {
    const queryParams = queryString.parse(rep._parsedUrl.query);
    const result = {
      data: res.locals.data,
      pagination: {
        _page: Number.parseInt(queryParams._page),
        _limit: Number.parseInt(queryParams._limit),
        totalElement: Number.parseInt(totalCountHeader),
      },
    };
    return res.jsonp(result);
  }
  res.jsonp(res.locals.data);
};

// Use default router
server.use("/api", router);
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("JSON Server is running");
});

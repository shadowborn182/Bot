// frontend proxies auth to server
const express = require('express');
const next = require('next');
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  // simple proxy routes
  server.get('/api/login', (req, res) => {
    const target = process.env.API_BASE_URL || 'http://localhost:3000';
    res.redirect(`${target}/auth/discord`);
  });

  server.all('*', (req, res) => handle(req, res));

  const port = process.env.PORT || 3001;
  server.listen(port, () => console.log(`Dashboard frontend listening on ${port}`));
});

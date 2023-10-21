const express = require('express');
const whois = require('whois-json');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

app.get('/whois/:domain', (req, res) => {
  const { domain } = req.params;
  whois(domain.replace('www.', ''))
    .then((data) => {
      res.json({ domain, data });
    })
    .catch((err) => {
      res.json({ domain, data: null, error: err });
    });
});

app.listen(port, () => process.stdout.write(`Whois query server is running on http://localhost:${port}\n`));

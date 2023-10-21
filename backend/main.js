const express = require("express");
const whois = require("whois-json");
const cors = require("cors");

const app = express(),
    port = 3000;

app.use(express.json());
app.use(cors());

app.get("/whois/:domain", (req, res) => {
    const domain = req.params.domain;
    whois(domain.replace("www.", ""))
        .then((data) => {
            res.json({ domain, data });
        })
        .catch((err) => {
            console.log(err);
            res.json({ domain, data: null });
        });
});

app.listen(port, () =>
    console.log(`Server is running on http://localhost:${port}`)
);

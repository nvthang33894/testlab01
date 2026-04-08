const express = require("express");
const { exec } = require("child_process");

const app = express();
const { execFile } = require("child_process");


// 🔥 THÊM DÒNG NÀY
app.use(express.json());

const SECRET = 'mykey';

app.post("/cd", (req, res) => {
    const token = req.headers["x-api-key"];
    if (token !== SECRET) {
        return res.status(401).send("Unauthorized");
    }

    const {
        branch,       
        repo_url
    } = req.body;
    
    console.log("BODY:", req.body);
    // validate cơ bản

    const args = [
        branch,
        repo_url
    ];
    if (!branch || !repo_url) {
        return res.status(400).send("Missing required params");
    }
    // execFile("bash", ["/home/ubuntu/deploy.sh", ...args], callback)

    execFile("bash", ["./cd.sh", ...args], (err, stdout, stderr) => {
        if (err) {
            console.error("Deploy failed:", stderr);
            return res.status(500).send("Deploy failed");
        }

        console.log(stdout);
        res.send("Deploy success");
    });
});

app.post("/deploy", (req, res) => {
    const token = req.headers["x-api-key"];
    if (token !== SECRET) {
        return res.status(401).send("Unauthorized");
    }

    const {
        customer,
        app,
        environment,
        namespace,
        image,
        tag,
        branch,
        commit,
        repo_url
    } = req.body;
    
    console.log("BODY:", req.body);
    // validate cơ bản
    if (!customer || !app || !namespace || !image || !tag) {
        return res.status(400).send("Missing required params");
    }

    // sanitize (tránh command injection)
    //const safe = (v) => String(v).replace(/[^a-zA-Z0-9-_./:]/g, "");
 
    const args = [
        safe(customer),
        safe(app),
        safe(environment || "production"),
        safe(namespace),
        safe(image),
        safe(tag),
        safe(branch || "main"),
        safe(commit || ""),
        repo_url
    ];

    // execFile("bash", ["/home/ubuntu/deploy.sh", ...args], callback)

    execFile("bash", ["./deploy.sh", ...args], (err, stdout, stderr) => {
        if (err) {
            console.error("Deploy failed:", stderr);
            return res.status(500).send("Deploy failed");
        }

        console.log(stdout);
        res.send("Deploy success");
    });
});
app.listen(3000, () => console.log("Deploy API running on port 3000"));

function safe(str) {
  return str.trim();
}
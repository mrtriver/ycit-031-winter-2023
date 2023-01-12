const express = require("express")

const { Client } = require("pg")

const client = new Client({
    host: "127.0.0.1",
    port: 5432,
    user: "postgres",
    password: "password",
})

client.connect()

const app = express()

app.use(express.json({ limit: 50000 }))

app.post("/pets", async (req, res) => {
    // DON'T DO THIS!!!! You are setting yourself up for SQL injection vulnerabilities!
    // const result = await client.query(`INSERT INTO pets (name) VALUES ('${req.body.name}');`)

    const text = "INSERT INTO pets (name) VALUES ($1) RETURNING *"
    const values = [req.body.name]

    try {
        const result = await client.query(text, values)

        console.log("-->", result.rows[0])

        res.json(result.rows[0])
    } catch (err) {
        console.log(err.stack)
    }
})

app.get("/pets", async (req, res) => {
    // console.log(req.headers.accept)

    const result = await client.query("SELECT * FROM pets;")

    if (req.headers.accept.toLowerCase().includes("application/json")) {
        res.json(result.rows)
    } else {
        const listItems = result.rows.map((pet) => `<li>${pet.name}</li>`)

        // console.log(listItems)

        res.send(`<ul>${listItems.join("")}</ul>`)
    }
})

// We don't need this route anymore because we "augmented" /pets to be able to detect if the accept: 'application/json' header is present
// app.get("/pets-json", async (req, res) => {
//     console.log(req.headers.accept)

//     const result = await client.query("SELECT * FROM pets;")

//     // console.log(result)

//     res.json(result.rows)
// })

app.get("/", async (req, res) => {
    try {
        const result = await client.query("SELECT * FROM pets;")

        res.send(`<h1>${result.rows[0].name}</h1>`)
    } catch (err) {
        res.send("Error!!!")
    }

    // This is the exact same thing as the code above (using the "promise-then" syntax instead of "async/await" syntax)
    // client
    //     .query("SELECT * FROM pets;")
    //     .then((result) => {
    //         res.send(`<h1>${result.rows[0].name}</h1>`)
    //     })
    //     .catch((err) => {
    //         res.send("Error!!!")
    //     })
    //
    // Again, this the same. But now using the "callback" syntax
    // client.query("SELECT * FROM pets;", (err, result) => {
    //     if (err) {
    //         res.send("Error!!!")
    //         return
    //     }
    //     res.send(`<h1>${result.rows[0].name}</h1>`)
    // })
})

app.listen(3333, () => {
    console.log("listening on port 3333")
})

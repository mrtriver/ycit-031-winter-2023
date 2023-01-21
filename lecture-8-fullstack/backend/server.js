const express = require("express")

const { Pool } = require("pg")

const databaseConnectionSettings = {
    user: "postgres",
    password: "password",
    host: "localhost",
    port: "5432",
    database: "postgres",
}

const client = new Pool(databaseConnectionSettings)

client.connect()

const app = express()

app.use((req, res, next) => {
    console.log(`${req.method} request received for ${req.url} from ${req.ip}`)
    next()
})

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "http://127.0.0.1:8081")
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type")
    next()
})

app.get("/", async (req, res) => {
    const text = "select name from pets;"

    const result = await client.query(text)

    const pets = result.rows.map((el) => el.name).join(", ")

    res.send("it's working! " + pets)
})

app.get("/pets", async (req, res) => {
    const result = await client.query(
        "SELECT id, name, species, breed, age, weight FROM pets;"
    )

    res.json(result.rows)
})

app.listen(3333, () => {
    console.log("listening on 3333")
})

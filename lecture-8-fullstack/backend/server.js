const express = require("express")
const session = require("express-session")
const pgSession = require("connect-pg-simple")(session)

const { Pool } = require("pg")

const databaseConnectionSettings = {
    user: "postgres",
    password: "password",
    host: "localhost",
    port: "5432",
    database: "postgres",
}

const db = new Pool(databaseConnectionSettings)

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

app.use(
    session({
        store: new pgSession({
            pool: db, // use the connection pool
            tableName: "sessions", // name of the table to store sessions in
        }),
        secret: "this-is-a-secretsaof3498thwevniut23hfuiehdghwiughdkjfhksdjhfkj7", // secret key to encrypt the session data
        resave: false, // don't save the session if it hasn't been modified
        saveUninitialized: false, // don't create a session until the user has logged in
        cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }, // 30 days
    })
)

app.get("/", async (req, res) => {
    const text = "select name from pets;"

    const result = await db.query(text)

    const pets = result.rows.map((el) => el.name).join(", ")

    res.send("it's working! " + pets)
})

app.get("/pets", async (req, res) => {
    const result = await db.query(
        "SELECT id, name, species, breed, age, weight FROM pets;"
    )

    res.json(result.rows)
})

app.get("/session", (req, res) => {
    if (!req.session.views) {
        req.session.views = 0
    }

    if (!req.session.country) {
        req.session.country = "canada"
    }

    req.session.views++

    res.send(`You viewed this page ${req.session.views} times`)
})

app.post("/register", (req, res) => {
    res.status(503).end()
})

app.post("/login", (req, res) => {
    res.status(503).end()
})

app.post("/logout", (req, res) => {
    res.status(503).end()
})

db.connect()
    .then(() => {
        app.listen(3333, () => {
            console.log("listening on 3333")
        })
    })
    .catch((error) => {
        console.log("could not connect to the DB", error)
    })

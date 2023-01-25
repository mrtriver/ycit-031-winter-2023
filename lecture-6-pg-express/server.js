const express = require("express")

const { Client } = require("pg")

const databaseConnectionSettings = {
    host: "127.0.0.1",
    port: 5432,
    user: "postgres",
    password: "password",
}

const client = new Client(databaseConnectionSettings)

client.connect()

const app = express()

app.use((req, res, next) => {
    console.log(
        "hello, I am the very first middelware and I execute for all routes"
    )
    next()
})

app.use(express.json({ limit: 50000 }))

// CRUD --- CREATE READ UPDATE DELETE  /pets

async function getPetIdMiddleware(req, res, next) {
    const id = req.params.id

    if (!id) {
        res.status(400).json({ error: "missing id" })
        return
    }

    const text = "SELECT * FROM pets WHERE id = $1;"
    const values = [id]

    const result = await client.query(text, values)

    if (result.rows.length === 0) {
        res.status(404).end()
        return
    }

    res.locals.petId = id

    next()
}

app.delete("/pets/:id", getPetIdMiddleware, async (req, res) => {
    const id = req.params.id

    const deleteText = "DELETE FROM pets WHERE id = $1"
    const deleteValues = [req.params.id]

    try {
        const deleteResult = await client.query(deleteText, deleteValues)

        console.log("deleteResult", deleteResult)

        res.status(200).json(deleteResult.rows)
    } catch (err) {
        res.status(400).json({ error: err.toString() })
    }
})

app.patch(
    "/pets/:id/increase-age-by-one",
    getPetIdMiddleware,
    async (req, res) => {
        const updateText =
            "UPDATE pets SET age = coalesce(age,0) + 1 WHERE id = $1"
        const updateValues = [req.params.id]
        console.log("updateValues", updateValues)

        try {
            const updateResult = await client.query(updateText, updateValues)

            console.log("updateResult", updateResult)

            res.status(200).json(updateResult.rows)
        } catch (err) {
            res.status(400).json({ error: err.toString() })
        }
    }
)

app.put("/pets/:id", getPetIdMiddleware, async (req, res) => {
    const pet = req.body
    const updateText =
        "UPDATE pets SET name = $2, species = $3, breed = $4, age = $5, weight = $6 WHERE id = $1"
    const updateValues = [req.params.id, pet.name, pet.species, pet.breed, pet.age, pet.weight] // prettier-ignore

    try {
        const updateResult = await client.query(updateText, updateValues)

        console.log("updateResult", updateResult)

        res.status(200).json(updateResult.rows)
    } catch (err) {
        res.status(400).json({ error: err.toString() })
    }
})

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

app.get("/pets", (req, res) => {
    // console.log(req.headers.accept)

    client.query("SELECT * FROM pets;").then((result) => {
        if (req.headers.accept.toLowerCase().includes("application/json")) {
            res.json(result.rows)
        } else {
            const listItems = result.rows.map((pet) => `<li>${pet.name}</li>`)

            // console.log(listItems)

            res.send(`<ul>${listItems.join("")}</ul>`)
        }
    })
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

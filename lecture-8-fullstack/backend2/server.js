

const express = require('express');

const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);


const {Pool} = require("pg");
const databaseConnectionSettings = {
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "password"
    
}

    const db = new Pool(databaseConnectionSettings)
   
     const app = express();

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
            secret: "this-is-a-secretsaof3498thwevniut23hfuiehdghwiughdkjfhksdjhfgkj7", // secret key to encrypt the session data
            resave: false, // don't save the session if it hasn't been modified
            saveUninitialized: false, // don't create a session until the user has logged in
            cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }, // 30 days
        })
    )




     app.get("/pets", async (req, res) => {
        const text = "SELECT id, name, species, breed, age FROM pets"
        const result = await db.query(text)
        const pets = result.rows.map((el) => `Id: ${el.id} - Name: ${el.name} -Species: ${el.species} - Breed: ${el.breed} - Age: ${el.age} - `).join("<br>")
        res.send(`<h1>"THIS IS WORKING !"</h1> <br> ${pets}`) 

    })
    

    app.get("/", async(req,res) => { 
        const result = await db.query("SELECT * FROM pets;")
        res.json(result.rows)
        

     })
//********** */
    app.get("/session", (req,res)=>{
        if(!req.session.views){
            req.session.views = 0;
        }
        req.session.views++;
        res.send(`You have viewed this page ${req.session.views} times`)
    })

    // app.post("/register)", (req, res) => {
    //     res.status(503).end()
    // })


    app.post("/login", (req, res) => {
        res.status(503).end()   
    })


    app.post("/logout", (req, res) => {
        res.status(503).end()   
    })
//******* */

    db.connect().then(() => { 
        app.listen(3333, () => {
    console.log("Backend2 is listening on port 3333")
})
}).catch((err) => {
    console.log("Error connecting to the database", err)
})


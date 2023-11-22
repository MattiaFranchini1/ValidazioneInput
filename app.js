const express = require('express');
const mysql = require("mysql")
const dotenv = require('dotenv')

const app = express();
dotenv.config({ path: './.env' })

let dbConfig = {
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    user: process.env.DATABASE_ROOT,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
};

let db = mysql.createConnection(dbConfig);

console.log(dbConfig.database, dbConfig.host, dbConfig.port);

db.connect(async (err) => {
    if (err) {
        console.error('Errore di connessione al database:', err);
        throw err;
    }
    console.log('Connesso al database MySQL');
});

app.set('view engine', 'hbs')
const path = require("path")
const publicDir = path.join(__dirname, './public')
app.use(express.static(publicDir))


app.get("/", (req, res) => {
    res.render("index")
})

app.get("/register", (req, res) => {
    res.render("register")
})


const bcrypt = require("bcryptjs")
app.use(express.urlencoded({ extended: false }));
app.use(express.json())

app.post("/auth/register", (req, res) => {
    const { cf, email, password, password_confirm } = req.body

    const cfRegex = /^[A-Z]{6}\d{2}[A-M|Z]\d{2}[A-Z]\d{3}[A-Z]$/i
    if (!cfRegex.test(cf)) {
        return res.render('register', {
            message: 'Codice fiscale non valido'
        });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.render('register', {
            message: 'Formato mail non valido'
        });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&/])[A-Za-z\d@$!%*?&/]{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.render('register', {
            message: 'La password deve contenere almeno una lettera maiuscola, una minuscola, un numero, un carattere speciale e deve essere lunga almeno 8 caratteri'
        });
    }

    var results = db.query('SELECT email FROM users WHERE email = ?', [email], async (error, results) => {
        if (error) {
            console.log(error)
        }
        if (results.length > 0) {
            return res.render('register', {
                message: 'La mail è già in uso'
            })
        } else if (password !== password_confirm) {
            return res.render('register', {
                message: 'Password non corrispondono'
            })
        }
        let hashedPassword = await bcrypt.hash(password, 8)

        db.query('INSERT INTO users SET ?', { cf: cf, email: email, password: hashedPassword }, (err, results) => {
            if (err) {
                console.log(err)
            } else {
                return res.render('register', {
                    message: 'Utente registrato correttamente!'
                })
            }
        })
    })
})


app.listen(5000, () => {
    console.log("server started on port 5000")
})


module.exports = {
    app,
    db
};
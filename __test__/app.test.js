const chaiHttp = require('chai-http');
const chai = require('chai')
const dotenv = require('dotenv')
const { expect } = chai
const mysql = require('mysql')
let { app, db } = require('../app');
const path = require("path")
dotenv.config({ path: './.env'})

chai.use(chaiHttp);

console.log(__dirname)
app.set('views', path.join(__dirname, '../views'));

const getConnection = () => {
    return mysql.createConnection({
        host: process.env.DATABASE_HOST,
        port: process.env.DATABASE_PORT,
        user: process.env.DATABASE_ROOT,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE
    });
};

before((done) => {
    db = getConnection();
    db.connect(done);
});

after((done) => {
    db.end(done);
});

describe('POST /auth/register', () => {

    it('Dovrebbe dare errori sul codice fiscale', (done) => {
        chai.request(app)
          .post('/auth/register')
          .send({
            cf: 'a',
            email: 'test@example.com',
            password: 'Test@123',
            password_confirm: 'Test@123',
          })
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.text).to.include('Codice fiscale non valido');
            done();
          });
      });

      it('Dovrebbe dare errori sulla mail', (done) => {
        chai.request(app)
          .post('/auth/register')
          .send({
            cf: 'RSSMRA80A01F205X',
            email: 'a',
            password: 'Test@123',
            password_confirm: 'Test@123',
          })
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.text).to.include('Formato mail non valido');
            done();
          });
      });

      it('Dovrebbe dire password debole', (done) => {
        chai.request(app)
          .post('/auth/register')
          .send({
            cf: 'RSSMRA80A01F205X',
            email: 'test@example.com',
            password: 'a',
            password_confirm: 'a',
          })
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.text).to.include('La password deve contenere almeno una lettera maiuscola, una minuscola, un numero, un carattere speciale e deve essere lunga almeno 8 caratteri');
            done();
          });
      });

      it('Dovrebbe dire password non corrispondono', (done) => {
        chai.request(app)
          .post('/auth/register')
          .send({
            cf: 'RSSMRA80A01F205X',
            email: 'test@example.com',
            password: 'Test@123',
            password_confirm: 'Test1@123',
          })
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.text).to.include('Password non corrispondono');
            done();
          });
      });

      it('Dovrebbe registrare un nuovo utente', (done) => {
        chai.request(app)
          .post('/auth/register')
          .send({
            cf: 'RSSMRA80A01F205X',
            email: 'test@example.com',
            password: 'Test@123',
            password_confirm: 'Test@123',
          })
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.text).to.include('Utente registrato correttamente!');
            done();
          });
      });

      it('Dovrebbe mail già in uso', (done) => {
        chai.request(app)
          .post('/auth/register')
          .send({
            cf: 'RSSMRA80A01F205X',
            email: 'test@example.com',
            password: 'Test@123',
            password_confirm: 'Test@123',
          })
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.text).to.include('La mail è già in uso');
            done();
          });
      });

  });


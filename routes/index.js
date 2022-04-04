const { Router } = require('express');
const { route } = require('express/lib/application');
const POP3Client = require("mailpop3");
const nodemailer = require('nodemailer')
const path = require('path')
require("dotenv").config();
const router = Router();

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'))
})

router.post('/authEmailServer', (req, res) => {
    console.log("body", req.body)
    const { email,password } = req.body;
    var client = new POP3Client(process.env.POP_SERVER_PORT, process.env.POP_SERVER_HOST, {
        tlserrs: false,
        enabletls: false,
        debug: false
    });

    client.on("error", function (err) {

        if (err.errno === 111) console.log("Unable to connect to server");
        else console.log("Server error occurred");

        console.log(err);

    });

    client.on("connect", function () {

        console.log("CONNECT success");
        client.login(email, password);

    });

    client.on("invalid-state", function (cmd) {
        console.log("Invalid state. You tried calling " + cmd);
    });

    client.on("locked", function (cmd) {
        console.log("Current command has not finished yet. You tried calling " + cmd);
    });

    client.on("login", function(status, rawdata) {
        console.log(rawdata);
        if (status) {
     
            console.log("LOGIN/PASS success");
            client.list();
     
        } else {
     
            console.log("LOGIN/PASS failed");
            client.quit();
     
        }
    });
     
    // Data is a 1-based index of messages, if there are any messages
    client.on("list", function(status, msgcount, msgnumber, data, rawdata) {
     
        if (status === false) {
     
            console.log("LIST failed");
            client.quit();
     
        } else {
     
            console.log("LIST success with " + msgcount + " element(s)");
     
            if (msgcount > 0)
                client.retr(1);
            else
                client.quit();
     
        }
    });
     
    client.on("retr", function(status, msgnumber, data, rawdata) {
     
        if (status === true) {
     
            console.log("RETR success for msgnumber " + msgnumber);
            client.dele(msgnumber);
            client.quit();
     
        } else {
     
            console.log("RETR failed for msgnumber " + msgnumber);
            client.quit();
     
        }
    });
     
    client.on("dele", function(status, msgnumber, data, rawdata) {
     
        if (status === true) {
     
            console.log("DELE success for msgnumber " + msgnumber);
            client.quit();
     
        } else {
     
            console.log("DELE failed for msgnumber " + msgnumber);
            client.quit();
     
        }
    });
     
    client.on("quit", function(status, rawdata) {
     
        if (status === true) console.log("QUIT success");
        else console.log("QUIT failed");
     
    });
})

router.post('/sendMail', (req, res) => {
    console.log("body", req.body)
    const { emailFrom, emailpass, emailDest, subject, text } = req.body;
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_SERVER_HOST,
        port: process.env.SMTP_SERVER_PORT,
        tls: {
            rejectUnauthorized: false
        },
        auth: {
            user: emailFrom,
            pass: emailpass,
        },
    });

    transporter.verify(function (error, success) {
        if (error) {
            console.log(error);
        } else {
            console.log("Server is ready to take our messages");
        }
    });
    var alias = emailFrom.split("@")[0];
    const mail = {
        sender: `${alias} <${emailFrom}>`,
        to: emailDest, // receiver email,
        subject: subject,
        text: text,
    };
    transporter.sendMail(mail, (err, data) => {
        if (err) {
            console.log(err);
            res.status(500).send("Something went wrong.");
        } else {
            res.status(200).send("Email successfully sent to recipient!");
        }
    });
})

router.get('/getMails', (req, res) => {

})

module.exports = router;
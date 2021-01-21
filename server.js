const express = require('express')
const app = express()
const books = require('./db')
const bodyParser = require('body-parser')
const fs = require('fs');
const port = 3030;
const hostname = "localhost";
var users = [];
var userDetails = [];
var cors = require('cors');
const { json } = require('express');

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))


app.use(cors({ origin: 'http://localhost:4200' }));

app.get('/', (req, res) => {
    res.send('get Successful')
})

app.listen(port, () => {
    console.log('Listening to port' + port + ".")

})

app.post('/books', (req, res) => {
    books.push(req.body)
    res.status(201).json(req.body)
})

app.get('/books', (req, res) => {
    res.json(books)
})

app.get('/books/:id', (req, res) => {
    res.json(books.find(book => book.id === req.params.id))
})

app.put('/books/:id', (req, res) => {
    const updateIndex = books.findIndex(book => book.id === req.params.id)
    res.json(Object.assign(books[updateIndex], req.body))
})

app.delete('/books/:id', (req, res) => {
    const deletedIndex = books.findIndex(book => book.id === req.params.id)
    books.splice(deletedIndex, 1)
    res.status(204).send()
})

app.get('/users', (req, res) => {
    try {
        let fileContents = fs.readFileSync('./hosts.yml', 'utf-8');
        var jsonString = JSON.stringify(fileContents);
        var i = 0;
        for (let index = 0; index < jsonString.length; index++) {
            var ipaddress;
            if (jsonString.substring(index, index + 13) == "ansible_host=") {

                ipaddress = jsonString.substring(index + 13, index + 26);

                var lastLetter = ipaddress.substring(ipaddress.length, ipaddress.length - 1);

                if (parseInt(lastLetter) >= 0) {
                    userDetails[i] = { "name": "COM" + (i + 1) + "", "ip_address": ipaddress };
                    users.push(userDetails[i]);
                } else if (lastLetter == " ") {
                    ipaddress = ipaddress.substring(0, ipaddress.length - 1);
                    userDetails[i] = { "name": "COM" + (i + 1) + "", "ip_address": ipaddress };
                    users.push(userDetails[i]);

                } else {
                    ipaddress = ipaddress.substring(0, ipaddress.length - 2);
                    userDetails[i] = { "name": "COM" + (i + 1) + "", "ip_address": ipaddress };
                    users.push(userDetails[i]);
                }
                i++;
            }
        }
    } catch (e) {
        console.log(e);
    }
    res.json(users);
})

app.get('/docapture', (req, res) => {

})

app.get('/getAll', (req, res) => {

    clientDetail = [];
    client = [];
    var i = 0;
    try {
    let fileContents = fs.readFileSync('./hosts.yml', 'utf-8',);
    const contents = JSON.stringify(fileContents);

    for (let index = 0; index < contents.length; index++) {
        if(contents.substring(index,index + 13) == 'ansible_host='){
            ipAddress = contents.substring(index + 13,index + 26);

        } if(contents.substring(index,index + 14) == 'dashboard_url='){
            dashboardUrl = contents.substring(index + 14, contents.length-2);
            dashboardUrl = dashboardUrl.split('\"');
            dashboardUrl = dashboardUrl[1];
            clientDetail[i] = {"ip_address" : ipAddress, "dashboard_url": dashboardUrl};
            client.push(clientDetail[i]);
            i++;
            // console.log(dashboardUrl);
        }

        // console.log(client);
    }
    console.log(client);
    res.json(client);

} catch (e) {
    console.log(e);
}
})

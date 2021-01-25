const express = require('express')
const app = express()
const books = require('./db')
const bodyParser = require('body-parser')
const fs = require('fs');
const port = 3030;
var users = [];
var userDetails = [];
var cors = require('cors');
var Ansible = require('node-ansible');
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

// app.get('/users', (req, res) => {
//     try {
//         let fileContents = fs.readFileSync('./hosts.yml', 'utf-8');
//         var jsonString = JSON.stringify(fileContents);
//         var i = 0;
//         for (let index = 0; index < jsonString.length; index++) {
//             var ipaddress;
//             if (jsonString.substring(index, index + 13) == "ansible_host=") {

//                 ipaddress = jsonString.substring(index + 13, index + 26);

//                 var lastLetter = ipaddress.substring(ipaddress.length, ipaddress.length - 1);

//                 if (parseInt(lastLetter) >= 0) {
//                     userDetails[i] = { "name": "COM" + (i + 1) + "", "ip_address": ipaddress };
//                     users.push(userDetails[i]);
//                 } else if (lastLetter == " ") {
//                     ipaddress = ipaddress.substring(0, ipaddress.length - 1);
//                     userDetails[i] = { "name": "COM" + (i + 1) + "", "ip_address": ipaddress };
//                     users.push(userDetails[i]);

//                 } else {
//                     ipaddress = ipaddress.substring(0, ipaddress.length - 2);
//                     userDetails[i] = { "name": "COM" + (i + 1) + "", "ip_address": ipaddress };
//                     users.push(userDetails[i]);
//                 }
//                 i++;
//             }
//         }
//     } catch (e) {
//         console.log(e);
//     }
//     res.json(users);
// })

app.get('/getAll', (req, res) => {

    clientDetail = [];
    client = [];
    var i = 0;
    try {
        let fileContents = fs.readFileSync('./hosts.yml', 'utf-8', );
        const contents = JSON.stringify(fileContents);

        for (let index = 0; index < contents.length; index++) {
            if (contents.substring(index, index + 13) == 'ansible_host=') {
                ipAddress = contents.substring(index + 13, index + 26);

            }
            if (contents.substring(index, index + 14) == 'dashboard_url=') {
                dashboardUrl = contents.substring(index + 14, contents.length - 2);
                dashboardUrl = dashboardUrl.split('\\"');
                dashboardUrl = dashboardUrl[1];
                clientDetail[i] = { "ip_address": ipAddress, "dashboard_url": dashboardUrl };
                client.push(clientDetail[i]);
                i++;
                // console.log(dashboardUrl);
            }

            // console.log(client);
        }
        res.json(client);

    } catch (e) {
        console.log(e);
    }
})

app.get('/capture/:ip', (req, res) => {
    try {
        // const fileName = '/home/qmatic/ansible/npr/test/variables2.json';
        const fileName = './variables2.json';
        const file = require(fileName);

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
        let parameter = req.params.ip;
        console.log("parameter" + parameter);
        for (let index = 0; index < userDetails.length; index++) {
            console.log("userdetail ip: " + userDetails[index]["ip_address"]);

            if (parameter == userDetails[index]["ip_address"]) {
                let data = JSON.stringify({ "ansible_host": parameter });
                console.log(data);
                fs.writeFile(fileName, data, (err) => {
                    if (err) throw err;
                    console.log('Data written to file');
                });
                res.json(file);
            } else {
                res.status(400);
                res.setHeader("Content-Type", "text/html");
                res.write("<p>Invalid</p>");
                res.end();
            }
        }


        // console.log(data);



        // fs.readFile(fileName, (err, data) => {
        //     if (err) throw err;
        //     let addressData = JSON.parse(data);
        //     // console.log(addressData);
        // });


    } catch (error) {
        console.log(error);
        res.send(error);
    }

})


app.get('/hosts', (req, res) => {
    try {
        let fileContents = fs.readFileSync('/home/qmatic/ansible/npr/test/inventory/hosts', 'utf-8');
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

app.get('/dashboardtest', (req, res) => {
    try {
        var command = new Ansible.Playbook().playbook('/home/qmatic/ansible/npr/test/dashboard').variables({
            dashboard_url: "http://192.168.1.71/dashboard-editor/#/canvas/C1-REG-D1"
        });
        command.inventory('/home/qmatic/ansible/npr/test/inventory/hosts')
        var promise = command.exec();
        promise.then(function(result) {
            console.log(result.output);
            console.log(result.code);
        })
        res.status(200).json({ msg: "200" });
    } catch (e) {
        res.status(200).json({ msg: e });
        console.log(e);
    }
    // res.json(users);
})
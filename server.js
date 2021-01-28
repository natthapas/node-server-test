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

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('public'));
app.use('/images', express.static('images'));
const path = require("path");
const url = require("url");


app.use(cors({ origin: 'http://localhost:4200' }));

app.get('/', (req, res) => {
    res.send('get Successful')
})

app.listen(port, () => {
    console.log('Listening to port' + port + ".")

})

var data = [];
var idData = [];
var serverName = "qmatic";


app.get('/clients', (req, res) => {
    try {

        let fileContents = fs.readFileSync('/home/' + serverName + '/ansible/npr/test/inventory/hosts', 'utf-8');
        // let fileContents = fs.readFileSync('./hosts.yml', 'utf-8');

        let largePattern = new RegExp(/[a-z,A-Z,0-9,"\]]{2,110}[0-9$][' '][ansible_host=]{13}[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}([' ']*)+([dashboard_url=]{14}(\"(.*?)")*)?/g);
        var idValue = 1;
        var largeMatch = largePattern.exec(fileContents);
        while (largeMatch != null) {
            let index = 0;
            let hostPattern = new RegExp(/[ansible_host=]{13}[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}/g);
            let dashboardPattern = new RegExp(/[dashboard_url=]{14}"(.*?)"/g);
            let namePattern = new RegExp(/([a-z,A-Z]+[0-9]+)/g);

            var hostMatch = hostPattern.exec(largeMatch[index]);
            var dashboardMatch = dashboardPattern.exec(largeMatch[index]);
            var nameMatch = namePattern.exec(largeMatch[index]);
            // console.log(nameMatch);


            if (hostMatch != null) {
                var hostSubstring;
                var dashboardSubstring;
                if (dashboardMatch != null) {
                    hostSubstring = hostMatch[index].substring(hostMatch[index].indexOf("=") + 1, hostMatch[index].length);
                    dashboardSubstring = dashboardMatch[index].substring(dashboardMatch[index].indexOf("=") + 2, dashboardMatch[index].length - 1);
                    idData.push({ "name": nameMatch[0], "ip_address": hostSubstring, "dashboard_url": dashboardSubstring });
                    data.push({ "id": idValue, "client": idData[idValue - 1] });
                    hostMatch = hostPattern.exec(largeMatch[index]);
                    dashboardMatch = dashboardPattern.exec(largeMatch[index]);
                } else {
                    hostSubstring = hostMatch[index].substring(hostMatch[index].indexOf("=") + 1, hostMatch[index].length);
                    idData.push({ "name": nameMatch[0], "ip_address": hostSubstring, "dashboard_url": null });
                    data.push({ "id": idValue, "client": idData[idValue - 1] });
                    hostMatch = hostPattern.exec(largeMatch[index]);
                }

            }
            largeMatch = largePattern.exec(fileContents);
            index++;
            idValue++;
        }


        res.status(200).json({ data: data, msg: "200" });
        // console.log(data);

    } catch (e) {
        res.status(400).json({ msg: e });
        console.log(e);
    }
    // res.json(users);
})

app.get('/client/:id', (req, res) => {
    try {
        var id = req.params.id
        var dataById = [];
        if (id == null) {
            res.status(200).json({ data: "invalid id", msg: "200" });
        } else {

            for (let index = 0; index < data.length; index++) {
                if (data[index].id == id) {
                    dataById = data[index];
                }
            }

            res.status(200).json({ data: dataById, msg: "200" });
        }



        // console.log(data);

    } catch (e) {
        res.status(400).json({ msg: e });
        console.log(e);
    }
    // res.json(users);
})

app.post('/capture', (req, res) => {
    try {
        var ip = req.body.ip_address;

        var command = new Ansible.Playbook().playbook('/home/' + serverName + '/ansible/npr/test/shutter').variables({ ansible_host: ip });
        command.inventory('/home/' + serverName + '/ansible/npr/test/inventory/hosts')
        var playbookExecute = command.exec();
        playbookExecute.then(function(result) {
            console.log(result.output);
            console.log(result.code);
        }).then(
            fs.readFile('/home/' + serverName + '/ansible/npr/test/screenshot/' + ip + '/screenshot.png', function(err, data) {
                if (err) throw err; // Fail if the file can't be read.
                res.writeHead(200, { 'Content-Type': 'image/png' });
                res.end(data); // Send the file data to the browser.
            })
        );




        // res.status(201).json({ data: req.body, msg: "201" });


        // console.log(req.body);
    } catch (e) {
        res.status(400).json({ msg: e });
        console.log(e);
    }
    // res.json(users);
})

app.post('/restartdashboard', (req, res) => {
    try {
        const requestData = {
            host: req.body.ip_address,
            dashboardurl: req.body.dashboard_url
        }
        var command = new Ansible.Playbook().playbook('/home/' + serverName + '/ansible/npr/test/dashboard').variables({
            ansible_host: requestData.host,
            dashboard_url: requestData.dashboardurl
        });
        command.inventory('/home/' + serverName + '/ansible/npr/test/inventory/hosts')
        var promise = command.exec();
        promise.then(function(result) {
            console.log(result.output);
            console.log(result.code);
        })
        res.status(200).json({ message: "200", data: requestData });
    } catch (error) {
        res.status(400).json({ msg: error });
        console.log(error);
    }
})

app.post('/reboot', (req, res) => {
    try {
        const requestData = {
            host: req.body.ip_address,
        }
        var command = new Ansible.Playbook().playbook('/home/' + serverName + '/ansible/npr/test/restart').variables({
            ansible_host: requestData.host,
        });
        command.inventory('/home/' + serverName + '/ansible/npr/test/inventory/hosts')
        var promise = command.exec();
        promise.then(function(result) {
            console.log(result.output);
            console.log(result.code);
        })
        res.status(200).json({ message: "200", data: requestData });
    } catch (error) {
        res.status(400).json({ msg: error });
        console.log(error);
    }
})

app.post('/shutdown', (req, res) => {
    try {
        const requestData = {
            host: req.body.ip_address,
        }
        var command = new Ansible.Playbook().playbook('/home/' + serverName + '/ansible/npr/test/turnoff').variables({
            ansible_host: requestData.host,
        });
        command.inventory('/home/' + serverName + '/ansible/npr/test/inventory/hosts')
        var promise = command.exec();
        promise.then(function(result) {
            console.log(result.output);
            console.log(result.code);
        })
        res.status(200).json({ message: "200", data: requestData });
    } catch (error) {
        res.status(400).json({ msg: error });
        console.log(error);
    }
})
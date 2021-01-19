const express = require('express')
const app = express()
const books = require('./db')
const bodyParser = require('body-parser')
const port = 3030;
const hostname = "192.168.1.73";

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', (req, res) => {
    res.send('Hello World')
})

app.listen(port, hostname, () => {
    console.log('Start server at port 3000.')
    
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
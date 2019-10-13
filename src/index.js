const express = require('express')
const favicon = require('serve-favicon')
const path = require('path')
require('./db/mongoose');
const playerRouter = require('./routers/player')

const app = express()
app.get('/', (req, res) => res.send('Fantasy Hockey Tool!'))
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))

const port = process.env.PORT || 3000

app.use(express.json())
app.use(playerRouter)

app.listen(port, () => {
  console.log("Server is up on port ", port)
})

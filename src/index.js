const express = require('express')
require('./db/mongoose');
const playerRouter = require('./routers/player')

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(playerRouter)

app.listen(port, () => {
  console.log("Server is up on port ", port)
})

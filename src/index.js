const express = require('express');
const favicon = require('serve-favicon');
const path = require('path');
const pino = require('pino')();

require('./db/mongoose');

const playerRouter = require('./routers/player');
const teamRouter = require('./routers/team');

const app = express();
app.get('/', (req, res) => res.send('Fantasy Hockey Tool!'));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

const port = process.env.PORT || 3000;

app.use(express.json());
app.use(playerRouter);
app.use(teamRouter);

app.listen(port, () => {
  pino.info('The server is up on port ' + port);
});

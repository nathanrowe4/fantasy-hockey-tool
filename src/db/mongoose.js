const mongoose = require('mongoose');
const pino = require('pino')();

mongoose.connect('mongodb://127.0.0.1:27017/player-projections', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
}).then(() => {
  pino.info('Successfully connected to the database');
}).catch((err) => {
  pino.error('Error connecting to database');
  process.exit();
});

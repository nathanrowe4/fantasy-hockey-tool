const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/player-projections', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("Successfully connected to the database");
}).catch(err => {
  console.log("Error connecting to database");
  process.exit();
});

const express = require('express');
const multer = require('multer');

const csvValidator = require('../modules/csvValidator');

const router = express.Router();

const upload = multer({
  dest: 'uploads/',
  fileFilter: function(req, file, cb) {
    file.mimetype === 'text/csv' ? cb(null, true) : cb(null, false);
  },
});

router.post('/uploadProjections', upload.single('projections'),
    async (req, res) => {
      try {
        const csvIsValid = await csvValidator.isValid(req.file.path);
        if (!csvIsValid) {
          throw new Error();
        }

        // Need to docker cp file to fht-db container

        // Need to mongoimport projections into db

        res.send(req.file);
      } catch (error) {
        res.status(400).send();
      }
    });

module.exports = router;

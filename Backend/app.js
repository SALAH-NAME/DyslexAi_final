const express = require('express');
const path = require('path');
const JsonDB = require('./db.js'); // Ensure this path is correct
const db = new JsonDB(path.join(__dirname, 'db', 'data.json')); // Use path.join for better path handling
const fs = require('fs');
const cors = require('cors');


const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

app.all('/:libName', (req, res) => {
    const { libName } = req.params;
    try {
      const libPath = path.join(__dirname, 'libs', libName);
      if (!fs.existsSync(libPath + '.js')) {
        return res.status(404).json({ error: 'Not found' });
      }
      const libModule = require(libPath);
  
      const method = req.method.toLowerCase();
      if (typeof libModule[method] === 'function') {
        const result = libModule[method](req, res, db);
  
        if (result instanceof Promise) {
          result.then(data => {
            if (!res.headersSent) {
              res.json(data);
            }
          })
          .catch(err => {
            console.error(err);
            if (!res.headersSent) {
              res.status(500).json({ error: 'An error occurred while processing your request.' });
            }
          });
        } else if (!res.headersSent) {
          res.json(result);
        }
      } else {
        res.status(405).json({ error: 'Method Not Allowed' });
      }
    } catch (error) {
      if (error.code === 'MODULE_NOT_FOUND') {
        res.status(404).json({ error: 'Not found' });
      } else {
        console.error(error);
        if (!res.headersSent) {
          res.status(500).json({ error: 'An error occurred while processing your request.' });
        }
      }
    }
  });
  

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

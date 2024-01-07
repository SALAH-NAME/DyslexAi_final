// ping.js in the /libs directory

// Assuming JsonDB is already required and db is instantiated at the top level of your app

const ping = {
  get: (req, res, db) => {
    const pongValue = req.query.pong;
    const collection = 'ping';
    const key = 'pong';

    if (pongValue) {
      // Update the value of pong in the ping collection
      db.update(collection, key, pongValue);
      res.json({ message: `Updated ${key} to ${pongValue}` });
    } else {
      // Retrieve the existing value of pong in the ping collection
      const existingValue = db.get(collection, key);
      if (existingValue !== null) {
        res.json({ pong: existingValue });
      } else {
        res.status(404).json({ error: `${key} not found in ${collection}` });
      }
    }
  },
  // ... other methods like post, put, delete if needed
};

module.exports = ping;

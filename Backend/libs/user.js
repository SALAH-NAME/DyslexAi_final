// user.js in the /libs directory
const { v4: uuidv4 } = require('uuid');

const userLib = {
  get: (req, res, db) => {
    const { username } = req.query;

    // Check if username is provided
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    // Generate a new UUID for the user
    const uuid = uuidv4();

    // Create a new user object with the initial values
    const newUser = {
      uuid,
      username,
      rightAnswers: 0,
      wrongAnswers: 0,
      successRate: 0,
      averageTime: 0,
      level: 0,
      gameType: "dad"
    };

    // Save the new user to the database
    db.update('users', uuid, newUser);

    // Return the newly created user
    res.json(newUser);
  },
  // ... other methods like post, put, delete if needed
};

module.exports = userLib;

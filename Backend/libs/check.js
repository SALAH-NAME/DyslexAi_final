// libs/check.js
const path = require('path');
const JsonDB = require(__dirname + '/../db.js'); // Ensure this path is correct

const checkLib = {
  get: (req, res, db) => {
    const { userId, answers } = req.query;

    // Convert answers from query string to array, assuming they are separated by commas
    const userAnswers = answers.split(',');

    // Fetch the user data from the database
    const user = db.get('users', userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Initialize the JsonDB instances for dad and stt
    const dadDb = new JsonDB(path.join(__dirname, '..', 'db', 'dad.json'));
    const sttDb = new JsonDB(path.join(__dirname, '..', 'db', 'stt.json'));

    // Determine the game type based on the user's level
    const gameType = user.level >= 4 ? 'stt' : 'dad';
    const gameDb = gameType === 'dad' ? dadDb : sttDb;
    
    // Retrieve the entire array for the game type
    const levelsData = gameDb.get(gameType);
    
    if (!levelsData) {
      return res.status(404).json({ error: 'Game data not found' });
    }
    
    const gameData = levelsData.find(level => level.level === user.level.toString()); // Find the correct level data by level number
    
    if (!gameData) {
      return res.status(404).json({ error: 'Level data not found' });
    }
    
    // Assuming that the correct order of answers is in the 'draggable' array of the gameData
    const correctOrder = gameData.letters[0].draggable;
    
    // Calculate right and wrong answers based on the order
    let rightAnswers = 0;
    
    for (let i = 0; i < correctOrder.length && i < userAnswers.length; i++) {
      if (correctOrder[i] === userAnswers[i]) {
        rightAnswers++;
      }
    }
    
    const wrongAnswers = userAnswers.length - rightAnswers;
    
    // Update user's right and wrong answers
    user.rightAnswers += rightAnswers;
    user.wrongAnswers += wrongAnswers;
    
    // Calculate success rate based on the right order of answers
    user.successRate = (rightAnswers / correctOrder.length) * 100;
    
    // Decide the next level or redo level based on success rate
    if (user.successRate > 70) {
      user.level += 1;
    }
    
    // Update the game type if the user has advanced beyond level 4
    user.gameType = user.level >= 4 ? 'stt' : 'dad';
    
    // Update the user data in the database
    db.update('users', userId, user);

      // After updating the user's data in the database
      try {
        // Initialize the JsonDB instance for the collection
        const collectionDbPath = path.join(__dirname, '..', 'db', 'collection.json');
        const collectionDb = new JsonDB(collectionDbPath);
  
        // Prepare the data to be stored
        const userDataForCollection = {
          userId: userId,
          level: user.level,
          gameType: user.gameType,
          rightAnswers: user.rightAnswers,
          wrongAnswers: user.wrongAnswers,
          successRate: user.successRate,
          timestamp: new Date().toISOString(),
          answers: userAnswers
        };
  
        // Generate a unique key for each entry, such as a timestamp or a combination of userId and timestamp
        const entryKey = `${userId}-${Date.now()}`;
  
        // Append the new data to the collection using JsonDB
        collectionDb.update('userData', entryKey, userDataForCollection);
  
        // Since the update is synchronous, no need for async/await here
        // If the update method was async, you would await it
  
      } catch (error) {
        console.error('Failed to save user data to collection.json using JsonDB:', error);
        // Handle the error appropriately
        // You might want to send a server error response or just log the error
      }
    
    // Return the updated user information and the next game type
    res.json({
      userId: userId,
      level: user.level,
      gameType: user.gameType,
      rightAnswers: user.rightAnswers,
      wrongAnswers: user.wrongAnswers,
      successRate: user.successRate,
      next: user.successRate > 70 ? "next level" : "redo level",
      nextGameType: user.gameType // This will be used by game.js to determine the next game
    });
    },
  };
  
  module.exports = checkLib;
  

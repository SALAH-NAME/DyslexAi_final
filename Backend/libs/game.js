// game.js in the /libs directory
const path = require('path');
const JsonDB = require(__dirname + '/../db.js');

const gameLib = {
  get: (req, res, db) => {
    const { type, uuid } = req.query;

    // Check if type and uuid are provided
    if (!type || !uuid) {
      return res.status(400).json({ error: 'Type and UUID are required' });
    }

    // Check if the user exists
    const user = db.get('users', uuid);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const defaultDadData = {
        "drag-and-drop": [
            {
                "level": "0",
                "type": "dad",
                "images": [
                  {
                    "src": "assets/images/sun.png",
                    "alt": "_un",
                    "word": "Sun"
                  },
                  {
                    "src": "assets/images/bun.png",
                    "alt": "_un",
                    "word": "Bun"
                  }
                ],
                "letters": [
                  {
                    "static": ["u"],
                    "draggable": ["B", "S"]
                  }
                ]
              }
        ]
      };
      
      // Define default game data for speech-to-text
      const defaultSttData = {
        "speech-to-text": [
            {
                "level": "1",
                "type": "stt",
                "word": "dog"
            }
        ]
      };
    
    // Initialize the JsonDB instance with the path to your JSON file
    const dadDb = new JsonDB(path.join(__dirname, '..', 'db', 'dad.json'));
    const sttDb = new JsonDB(path.join(__dirname, '..', 'db', 'stt.json'));
    
    // Load the game data for the specified type
    let gameData;
    if (type === 'dad') {
        gameData = dadDb.get("dad");
    } else if (type === 'stt') {
        gameData = sttDb.get("stt");
    } else {
        return res.status(404).json({ error: 'Game type not found' });
    }
    
    // Select the game level for the user
    const userLevel = user.level || 0; // Default to level 0 if not specified
    const gameLevelData = gameData.find(game => parseInt(game.level) === userLevel);

    if (!gameLevelData) {
    return res.status(404).json({ error: 'Game level not found' });
    }


    // Return the game level data
    res.json(gameLevelData);
  },
  // ... other methods like post, put, delete if needed
};

module.exports = gameLib;

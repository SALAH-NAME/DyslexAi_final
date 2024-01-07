// talk.js in the /libs directory
const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Initialize OpenAI with your API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const talkLib = {
  post: async (req, res) => {
    const text = req.body.text;

    if (!text) {
      return res.status(400).json({ error: 'No text data was provided.' });
    }

    try {
      const speechResponse = await openai.audio.speech.create({
        model: "tts-1",
        voice: "nova",
        input: text,
      });

      // Convert the ArrayBuffer from the response to a Buffer
      const buffer = Buffer.from(await speechResponse.arrayBuffer());

      // Generate a unique file name for the speech file
      const timestamp = Date.now();
      const speechFileName = `speech_${timestamp}.mp3`;
      const uploadsDir = path.join(__dirname, '..', 'uploads'); // Adjust the path to your uploads directory
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir);
      }
      const speechFilePath = path.join(uploadsDir, speechFileName);

      // Write the buffer to a file
      await fs.promises.writeFile(speechFilePath, buffer);

      // Send the speech file as a download to the client
      res.download(speechFilePath, speechFileName, (err) => {
        if (err) {
          console.error(err);
          res.status(500).json({ error: 'An error occurred while processing your request.' });
        }

        // Optionally, delete the temporary file after sending
        fs.unlinkSync(speechFilePath);
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
  }
};

module.exports = talkLib;

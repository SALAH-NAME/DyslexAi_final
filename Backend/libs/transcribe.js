// transcribe.js in the /libs directory
const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Initialize OpenAI with your API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const transcribeLib = {
  post: async (req, res) => {
    const base64Audio = req.body.audio;
    const wanted_word = req.body.wanted_word;

    if (!base64Audio) {
      return res.status(400).json({ error: 'No audio data was provided.' });
    }

    try {
      // Remove the header from the base64 string and prepare it for conversion
      const base64Data = base64Audio.replace(/^data:audio\/webm;base64,/, '');

      // Convert base64 string to a buffer
      const audioBuffer = Buffer.from(base64Data, 'base64');

      // Generate a unique file name for the audio file
      const timestamp = Date.now();
      const audioFileName = `audio_${timestamp}.webm`;
      const uploadsDir = path.join(__dirname, '..', 'uploads'); // Adjust the path to your uploads directory
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir);
      }
      const tempFilePath = path.join(uploadsDir, audioFileName);

      // Write the buffer to a file
      fs.writeFileSync(tempFilePath, audioBuffer);

      // Transcribe the audio file
      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(tempFilePath),
        model: "whisper-1",
        language: "en",
        temperature: 0
      });

      // Process the transcription with GPT
      const response = await openai.chat.completions.create({
        model: "gpt-4-1106-preview",
        messages: [
            {
                "role": "system",
                "content": "You are a validation system, you will be given words read by someone that might be dyslexic and your task is to respond to the spelling of the words in a specific json format,\noutput format:\n{\n    \"wanted_word\":\"the word we gave to the user to read\",\n    \"user_spell\": \"user input, how the user pronounced the word\",\n   \"rate\": true/false, // if the user pronounced it right or not,\n    \"note\": \"tell user how to do it right, in 1 line\"\n}\nYou will be given a json object with two fields, the original word which we will give to you, and the user spelling which is how the user spelled that word.\ninput format:\n{\n    \"wanted_word\":\"the word we gave to the user to read\",\n    \"user_spell\": \"user input, how the user pronounced the word\"\n}"
            },
            {
                "role": "user",
                "content": "{\n    \"wanted_word\":\"Butterfly\",\n    \"user_spell\": \"Buterfly\"\n}"
            },
            {
                "role": "assistant",
                "content": "{\n    \"wanted_word\":\"Butterfly\",\n    \"user_spell\": \"Buterfly\",\n    \"rate\": false,\n    \"note\": \"Remember to include both 't's in 'Butterfly'.\"\n}"
            },
            {
                "role": "user",
                "content": `{
                    "wanted_word": "${wanted_word}",
                    "user_spell": "${user_spell}"
                }`
            }
        ],
        temperature: 0,
        max_tokens: 256,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });

      // Extract the JSON object from the response and send it to the user
      const responseObject = JSON.parse(response.choices[0].message.content);
      res.json(responseObject);

      // Optionally, delete the temporary file after transcription
      fs.unlinkSync(tempFilePath);

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
  }
};

module.exports = transcribeLib;

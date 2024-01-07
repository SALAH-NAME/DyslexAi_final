const fs = require('fs');
const path = require('path');

class JsonDB {
  constructor(filename, defaultData = {}) {
    this.filename = filename;
    this.defaultData = defaultData;
    this.ensureFileExists();
    this.data = this.readData();
  }

  ensureFileExists() {
    // Check if the file exists
    if (!fs.existsSync(this.filename)) {
      // Use default data if provided, otherwise an empty object
      const dataToWrite = Object.keys(this.defaultData).length > 0 ? this.defaultData : {};
      fs.writeFileSync(this.filename, JSON.stringify(dataToWrite, null, 2), 'utf-8');
    }
  }

  readData() {
    try {
      const fileContents = fs.readFileSync(this.filename, 'utf-8');
      return JSON.parse(fileContents);
    } catch (err) {
      console.error('Error reading the data file:', err);
      // Return default data if there's an error reading the file
      return this.defaultData;
    }
  }

  writeData(data) {
    this.ensureFileExists(); // Ensure the file exists before writing
    try {
      fs.writeFileSync(this.filename, JSON.stringify(data, null, 2), 'utf-8');
      this.data = data; // Update the in-memory data
    } catch (err) {
      console.error('Error writing to the data file:', err);
    }
  }

  update(collection, key, value) {
    // Ensure the collection exists
    if (!this.data[collection]) {
      this.data[collection] = {};
    }
  
    // Add or update the individual entry within the collection
    this.data[collection][key] = value;
  
    // Write the entire data back to the file
    this.writeData(this.data);
  }

  get(collection, key) {
    const collectionData = this.data[collection];
    if (collectionData) {
      if (key) {
        return collectionData[key];
      } else {
        // If no key is provided, return the entire collection
        return collectionData;
      }
    }
    return null;
  }
}

module.exports = JsonDB;

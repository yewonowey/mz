const fs = require('fs');
const path = require('path');

const loadData = (mzFilePath, notMzFilePath) => {
    const mzWords = fs.readFileSync(path.resolve(mzFilePath), 'utf-8').split('\n');
    const notMzWords = fs.readFileSync(path.resolve(notMzFilePath), 'utf-8').split('\n');
    
    const mzData = mzWords.map(word => ({ text: word, label: 1 }));
    const notMzData = notMzWords.map(word => ({ text: word, label: 0 }));
    
    return [...mzData, ...notMzData];
};

module.exports = loadData;
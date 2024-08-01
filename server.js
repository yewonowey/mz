const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const { load_data, preprocess_data, train_model } = require('./modelUtil');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const client_id = "gGRrUm209lNZG3jzf6Tj";
const client_secret = "ZJZLfH3nZw";

const mz_file = 'mz_words.txt';
const not_mz_file = 'not_mz_words.txt';

let raw_data, data, vectorizer, classifier;

try {
    raw_data = load_data(mz_file, not_mz_file);
    ({ data, vectorizer } = preprocess_data(raw_data));
    classifier = train_model(data);
} catch (error) {
    console.error('Error loading or processing data:', error);
}

async function get_naver_search_suggestions(query) {
    const url = "https://openapi.naver.com/v1/search/errata.json";
    const headers = {
        "X-Naver-Client-Id": client_id,
        "X-Naver-Client-Secret": client_secret,
    };
    try {
        const response = await axios.get(url, { headers, params: { query } });
        const suggestions = response.data.errata || [];
        return suggestions.length ? suggestions[0].corrected : query;
    } catch (error) {
        console.error('Error fetching suggestions:', error);
        return query;
    }
}

// 정적 파일 제공
app.use(express.static(path.join(__dirname, 'public')));

app.post('/classify', async (req, res) => {
    try {
        const userInput = req.body.text;
        if (!userInput) {
            return res.status(400).json({ result: 'Invalid input' });
        }

        const correctedInput = await get_naver_search_suggestions(userInput);
        const tokens = correctedInput.split(' ');
        const vector = vectorizer.tfidfs(tokens);
        const isMz = classifier.classify(vector);
        const label = isMz ? 'MZ!' : 'NOT MZ!';

        res.json({ result: label });
    } catch (error) {
        console.error('Error processing classification:', error);
        res.status(500).json({ result: 'Error classifying text' });
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

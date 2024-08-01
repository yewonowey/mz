const natural = require('natural');
const fs = require('fs');

function load_data(mz_file, not_mz_file) {
    const mz_words = fs.readFileSync(mz_file, 'utf-8').split('\n');
    const not_mz_words = fs.readFileSync(not_mz_file, 'utf-8').split('\n');

    const mz_data = mz_words.map(text => ({ text, label: 1 }));
    const not_mz_data = not_mz_words.map(text => ({ text, label: 0 }));

    return [...mz_data, ...not_mz_data];
}

function preprocess_data(data) {
    const tokenizer = new natural.WordTokenizer();
    const vectorizer = new natural.TfIdf();

    data.forEach(item => {
        item.tokens = tokenizer.tokenize(item.text);
    });

    data.forEach(item => {
        vectorizer.addDocument(item.text);
    });

    data.forEach(item => {
        item.vector = [];
        vectorizer.tfidfs(item.text, function(i, measure) {
            item.vector[i] = measure;
        });
    });

    return { data, vectorizer };
}

function train_model(data) {
    const classifier = new natural.LogisticRegressionClassifier();
    data.forEach(item => {
        classifier.addDocument(item.vector, item.label);
    });
    classifier.train();
    return classifier;
}

module.exports = { load_data, preprocess_data, train_model };
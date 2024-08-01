const tf = require('@tensorflow/tfjs-node');
const natural = require('natural');
const loadData = require('./loadData');

const mzFilePath = 'mz_words.txt';
const notMzFilePath = 'not_mz_words.txt';
const data = loadData(mzFilePath, notMzFilePath);

const texts = data.map(item => item.text);
const labels = data.map(item => item.label);

// Vectorize text using natural library
const vectorizer = new natural.Tfidf();
texts.forEach((text, index) => vectorizer.addDocument(text));

const X = texts.map(text => {
    const vector = [];
    vectorizer.tfidfs(text, (i, measure) => vector.push(measure));
    return vector;
});
const y = tf.tensor1d(labels, 'int32');

const splitIndex = Math.floor(0.8 * X.length);
const X_train = tf.tensor2d(X.slice(0, splitIndex));
const X_test = tf.tensor2d(X.slice(splitIndex));
const y_train = y.slice([0], [splitIndex]);
const y_test = y.slice([splitIndex]);

const buildModel = (inputDim) => {
    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 50, activation: 'relu', inputShape: [inputDim] }));
    model.add(tf.layers.dense({ units: 2, activation: 'softmax' }));
    
    model.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'sparseCategoricalCrossentropy',
        metrics: ['accuracy'],
    });

    return model;
};

const inputDim = X_train.shape[1];
const model = buildModel(inputDim);

const trainModel = async (model, X_train, y_train, epochs = 10) => {
    await model.fit(X_train, y_train, {
        epochs: epochs,
        batchSize: 4,
        validationSplit: 0.2,
        callbacks: {
            onEpochEnd: (epoch, logs) => {
                console.log(`Epoch ${epoch + 1}: loss = ${logs.loss}, accuracy = ${logs.acc}`);
            },
        },
    });

    await model.save('file://./model');
};

trainModel(model, X_train, y_train).then(() => {
    console.log('모델 학습 완료');
});

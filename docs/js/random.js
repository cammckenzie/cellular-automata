function random(minVal, maxVal) {
    var diff = maxVal - minVal;

    return Math.random() * diff + minVal;
}

function randomInt(minVal, maxVal) {
    return Math.floor(Math.random() * (maxVal - minVal + 1) + minVal);
}

function coinFlip(trueProb) {
    return Math.random() < trueProb;
}

function gaussian(mean, sigma) {
    var r = 0;
    var iterations = 6
    for(var i = iterations; i > 0; i --){
        r += Math.random();
    }
    var normal = r / iterations;

    return mean + normal * sigma
};

function gaussianLikelihood(x, mean, sigma) {
    return (1 / Math.sqrt(2 * Math.PI * Math.pow(sigma, 2))) * Math.pow(Math.E, -(Math.pow(x - mean, 2) / 2 * Math.pow(sigma, 2)));
}

function standardGaussianLikelihood(x, xMean, xSigma) {
    var z = calculateZScore(x, xMean, xSigma);

    return gaussianLikelihood(z, 0.0, 1.0);
}

function calculateZScore(x, mean, sigma) {
    return (x - mean) / sigma
}

/**
 * numSamples = integer
 * probabiltiies = map from state to probability
 * values = map from state to value
 */
function discreteSample(numSamples, probabilities, values) {
    var keys = Object.keys(probabilities);

    var cumulativeSum = 0.0;
    var cumulativeSums = {};
    for(var i = 0; i < keys.length; ++i) {
        var key = keys[i];
        cumulativeSum += probabilities[key];
        cumulativeSums[key] = cumulativeSum;
    }

    var samples = new Array(numSamples);
    for(var i = 0; i < numSamples; ++i) {
        var randomVal = random(0.0, cumulativeSum);
        for(var j = 0; j < keys.length; ++j) {
            var key = keys[j];
            if(randomVal <= cumulativeSums[key]) {
                samples[i] = values[key];
                break;
            }
        }
    }

    return samples;
}
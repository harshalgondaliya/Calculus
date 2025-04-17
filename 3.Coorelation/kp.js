function calculatePearson() {
    // Get input values
    const xValues = document.getElementById('xValues').value.trim();
    const yValues = document.getElementById('yValues').value.trim();

    // Validate input
    if (!xValues || !yValues) {
        showError('Please enter both X and Y values');
        return;
    }

    // Parse input values
    const xArray = xValues.split(',').map(x => parseFloat(x.trim()));
    const yArray = yValues.split(',').map(y => parseFloat(y.trim()));

    // Validate arrays
    if (xArray.length !== yArray.length) {
        showError('X and Y arrays must have the same number of values');
        return;
    }

    if (xArray.some(isNaN) || yArray.some(isNaN)) {
        showError('Please enter valid numbers');
        return;
    }

    // Calculate means
    const xMean = xArray.reduce((sum, val) => sum + val, 0) / xArray.length;
    const yMean = yArray.reduce((sum, val) => sum + val, 0) / yArray.length;

    // Calculate covariance and standard deviations
    let covariance = 0;
    let xVariance = 0;
    let yVariance = 0;

    for (let i = 0; i < xArray.length; i++) {
        const xDiff = xArray[i] - xMean;
        const yDiff = yArray[i] - yMean;
        covariance += xDiff * yDiff;
        xVariance += xDiff * xDiff;
        yVariance += yDiff * yDiff;
    }

    // Calculate Pearson's r
    const r = covariance / Math.sqrt(xVariance * yVariance);

    // Display results with animations
    displayResults(r, xArray, yArray, xMean, yMean, covariance, xVariance, yVariance);
}

function displayResults(r, xArray, yArray, xMean, yMean, covariance, xVariance, yVariance) {
    const resultDiv = document.getElementById('result');
    const stepsDiv = document.getElementById('steps');
    
    // Clear previous results
    resultDiv.innerHTML = '';
    stepsDiv.innerHTML = '';

    // Create result content
    const resultContent = document.createElement('div');
    resultContent.className = 'result-content';
    
    // Add r value with color coding
    const rValue = document.createElement('div');
    rValue.className = 'correlation-value';
    rValue.innerHTML = `
        <h3>Pearson's Correlation Coefficient (r):</h3>
        <p class="value ${getRClass(r)}">${r.toFixed(4)}</p>
        <p class="interpretation">${getRInterpretation(r)}</p>
    `;
    resultContent.appendChild(rValue);

    // Add scatter plot visualization
    const plotDiv = document.createElement('div');
    plotDiv.className = 'plot-container';
    plotDiv.innerHTML = createScatterPlot(xArray, yArray, xMean, yMean);
    resultContent.appendChild(plotDiv);

    // Add steps
    const stepsContent = document.createElement('div');
    stepsContent.className = 'steps-content';
    stepsContent.innerHTML = `
        <div class="step">
            <h4>Step 1: Calculate Means</h4>
            <p>X Mean = ${xMean.toFixed(4)}</p>
            <p>Y Mean = ${yMean.toFixed(4)}</p>
        </div>
        <div class="step">
            <h4>Step 2: Calculate Covariance</h4>
            <p>Covariance = ${covariance.toFixed(4)}</p>
        </div>
        <div class="step">
            <h4>Step 3: Calculate Variances</h4>
            <p>X Variance = ${xVariance.toFixed(4)}</p>
            <p>Y Variance = ${yVariance.toFixed(4)}</p>
        </div>
        <div class="step">
            <h4>Step 4: Calculate Pearson's r</h4>
            <p>r = Covariance / √(X Variance × Y Variance)</p>
            <p>r = ${covariance.toFixed(4)} / √(${xVariance.toFixed(4)} × ${yVariance.toFixed(4)})</p>
        </div>
    `;

    // Animate results
    resultDiv.appendChild(resultContent);
    stepsDiv.appendChild(stepsContent);

    // Add animations
    const elements = document.querySelectorAll('.result-content, .step');
    elements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        setTimeout(() => {
            element.style.transition = 'all 0.5s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 200);
    });
}

function getRClass(r) {
    if (Math.abs(r) >= 0.7) return 'strong';
    if (Math.abs(r) >= 0.3) return 'moderate';
    return 'weak';
}

function getRInterpretation(r) {
    const absR = Math.abs(r);
    if (absR >= 0.9) return 'Very strong linear relationship';
    if (absR >= 0.7) return 'Strong linear relationship';
    if (absR >= 0.5) return 'Moderate linear relationship';
    if (absR >= 0.3) return 'Weak linear relationship';
    return 'Very weak or no linear relationship';
}

function createScatterPlot(xArray, yArray, xMean, yMean) {
    // Create a simple ASCII scatter plot
    const plotSize = 20;
    const xMin = Math.min(...xArray);
    const xMax = Math.max(...xArray);
    const yMin = Math.min(...yArray);
    const yMax = Math.max(...yArray);
    
    let plot = '<div class="scatter-plot">';
    plot += '<pre>';
    
    for (let y = plotSize; y >= 0; y--) {
        for (let x = 0; x <= plotSize; x++) {
            const plotX = xMin + (x / plotSize) * (xMax - xMin);
            const plotY = yMin + (y / plotSize) * (yMax - yMin);
            
            if (xArray.some((val, i) => 
                Math.abs(val - plotX) < (xMax - xMin) / plotSize && 
                Math.abs(yArray[i] - plotY) < (yMax - yMin) / plotSize)) {
                plot += '●'; // Data point
            } else if (Math.abs(plotX - xMean) < (xMax - xMin) / plotSize && 
                      Math.abs(plotY - yMean) < (yMax - yMin) / plotSize) {
                plot += '+'; // Mean point
            } else if (y === Math.round(plotSize / 2)) {
                plot += '-'; // X-axis
            } else if (x === Math.round(plotSize / 2)) {
                plot += '|'; // Y-axis
            } else {
                plot += ' '; // Empty space
            }
        }
        plot += '\n';
    }
    
    plot += '</pre>';
    plot += '</div>';
    return plot;
}

function showError(message) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `
        <div class="error-message">
            <p>${message}</p>
        </div>
    `;
    document.getElementById('steps').innerHTML = '';
}

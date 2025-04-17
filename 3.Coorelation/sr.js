function calculateSpearman() {
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

    // Calculate ranks
    const xRanks = calculateRanks(xArray);
    const yRanks = calculateRanks(yArray);

    // Calculate differences in ranks
    const dSquared = xRanks.map((rank, i) => Math.pow(rank - yRanks[i], 2));
    const sumDSquared = dSquared.reduce((sum, val) => sum + val, 0);

    // Calculate Spearman's rho
    const n = xArray.length;
    const rho = 1 - (6 * sumDSquared) / (n * (n * n - 1));

    // Display results with animations
    displayResults(rho, xArray, yArray, xRanks, yRanks, dSquared);
}

function calculateRanks(array) {
    // Create array of objects with value and original index
    const indexedArray = array.map((value, index) => ({ value, index }));
    
    // Sort by value
    indexedArray.sort((a, b) => a.value - b.value);
    
    // Assign ranks, handling ties
    const ranks = new Array(array.length);
    let currentRank = 1;
    
    for (let i = 0; i < indexedArray.length; i++) {
        if (i > 0 && indexedArray[i].value === indexedArray[i-1].value) {
            // Handle ties by using the average rank
            let sum = currentRank;
            let count = 1;
            let j = i;
            
            while (j < indexedArray.length && indexedArray[j].value === indexedArray[i].value) {
                sum += currentRank + count;
                count++;
                j++;
            }
            
            const averageRank = sum / count;
            for (let k = i; k < j; k++) {
                ranks[indexedArray[k].index] = averageRank;
            }
            
            currentRank += count;
            i = j - 1;
        } else {
            ranks[indexedArray[i].index] = currentRank;
            currentRank++;
        }
    }
    
    return ranks;
}

function displayResults(rho, xArray, yArray, xRanks, yRanks, dSquared) {
    const resultDiv = document.getElementById('result');
    const stepsDiv = document.getElementById('steps');
    
    // Clear previous results
    resultDiv.innerHTML = '';
    stepsDiv.innerHTML = '';

    // Create result content
    const resultContent = document.createElement('div');
    resultContent.className = 'result-content';
    
    // Add rho value with color coding
    const rhoValue = document.createElement('div');
    rhoValue.className = 'correlation-value';
    rhoValue.innerHTML = `
        <h3>Spearman's Rank Correlation Coefficient (ρ):</h3>
        <p class="value ${getRhoClass(rho)}">${rho.toFixed(4)}</p>
        <p class="interpretation">${getRhoInterpretation(rho)}</p>
    `;
    resultContent.appendChild(rhoValue);

    // Add scatter plot visualization
    const plotDiv = document.createElement('div');
    plotDiv.className = 'plot-container';
    plotDiv.innerHTML = createScatterPlot(xArray, yArray);
    resultContent.appendChild(plotDiv);

    // Add steps
    const stepsContent = document.createElement('div');
    stepsContent.className = 'steps-content';
    stepsContent.innerHTML = `
        <div class="step">
            <h4>Step 1: Assign Ranks</h4>
            <p>X Ranks: ${xRanks.join(', ')}</p>
            <p>Y Ranks: ${yRanks.join(', ')}</p>
        </div>
        <div class="step">
            <h4>Step 2: Calculate Differences</h4>
            <p>d² values: ${dSquared.join(', ')}</p>
            <p>Sum of d² = ${dSquared.reduce((sum, val) => sum + val, 0)}</p>
        </div>
        <div class="step">
            <h4>Step 3: Calculate ρ</h4>
            <p>ρ = 1 - (6 × Σd²) / (n(n²-1))</p>
            <p>ρ = 1 - (6 × ${dSquared.reduce((sum, val) => sum + val, 0)}) / (${xArray.length}(${xArray.length}²-1))</p>
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

function getRhoClass(rho) {
    if (Math.abs(rho) >= 0.7) return 'strong';
    if (Math.abs(rho) >= 0.3) return 'moderate';
    return 'weak';
}

function getRhoInterpretation(rho) {
    const absRho = Math.abs(rho);
    if (absRho >= 0.9) return 'Very strong monotonic relationship';
    if (absRho >= 0.7) return 'Strong monotonic relationship';
    if (absRho >= 0.5) return 'Moderate monotonic relationship';
    if (absRho >= 0.3) return 'Weak monotonic relationship';
    return 'Very weak or no monotonic relationship';
}

function createScatterPlot(xArray, yArray) {
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
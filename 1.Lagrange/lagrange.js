function interpolate() {
    // Get input values
    const xValues = document.getElementById('x_values').value.split(',').map(x => parseFloat(x.trim()));
    const yValues = document.getElementById('y_values').value.split(',').map(y => parseFloat(y.trim()));
    const x = parseFloat(document.getElementById('interpolate').value);

    // Validate inputs
    if (xValues.length !== yValues.length) {
        showError('Number of x values must match number of y values');
        return;
    }

    if (xValues.length < 2) {
        showError('At least 2 points are required for interpolation');
        return;
    }

    if (isNaN(x)) {
        showError('Please enter a valid x value to interpolate');
        return;
    }

    // Calculate Lagrange interpolation
    let result = 0;
    let steps = 'Lagrange Interpolation Steps:\n\n';
    
    for (let i = 0; i < xValues.length; i++) {
        let term = yValues[i];
        let termSteps = `L${i}(x) = ${yValues[i]} * `;
        
        for (let j = 0; j < xValues.length; j++) {
            if (i !== j) {
                term *= (x - xValues[j]) / (xValues[i] - xValues[j]);
                termSteps += `(x - ${xValues[j]}) / (${xValues[i]} - ${xValues[j]}) * `;
            }
        }
        
        termSteps = termSteps.slice(0, -3); // Remove last " * "
        steps += `${termSteps}\n`;
        steps += `L${i}(${x}) = ${term.toFixed(6)}\n\n`;
        
        result += term;
    }

    // Display results with animation
    displayResults(result, steps);
}

function displayResults(result, steps) {
    const resultElement = document.getElementById('interpolated-value');
    const stepsElement = document.getElementById('calculation-steps');
    
    // Clear previous results
    resultElement.textContent = '';
    stepsElement.textContent = '';
    
    // Animate the result
    let currentValue = 0;
    const targetValue = result;
    const duration = 1000; // 1 second
    const stepsCount = 60;
    const increment = targetValue / stepsCount;
    const interval = duration / stepsCount;
    
    const animation = setInterval(() => {
        currentValue += increment;
        if (currentValue >= targetValue) {
            currentValue = targetValue;
            clearInterval(animation);
        }
        resultElement.textContent = currentValue.toFixed(6);
    }, interval);
    
    // Animate the steps
    let currentStep = '';
    const stepLines = steps.split('\n');
    let lineIndex = 0;
    
    const stepAnimation = setInterval(() => {
        if (lineIndex < stepLines.length) {
            currentStep += stepLines[lineIndex] + '\n';
            stepsElement.textContent = currentStep;
            lineIndex++;
        } else {
            clearInterval(stepAnimation);
        }
    }, 100);
}

function showError(message) {
    const resultElement = document.getElementById('interpolated-value');
    const stepsElement = document.getElementById('calculation-steps');
    
    resultElement.textContent = '';
    stepsElement.textContent = message;
    stepsElement.style.color = 'var(--error-color)';
}
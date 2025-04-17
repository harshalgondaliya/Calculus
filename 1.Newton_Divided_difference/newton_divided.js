function calculateInterpolation() {
    try {
        // Get input values
        const xValuesInput = document.getElementById("xValues").value.trim();
        const yValuesInput = document.getElementById("yValues").value.trim();
        const xInput = document.getElementById("x").value.trim();

        // Validate inputs
        if (!xValuesInput || !yValuesInput || !xInput) {
            throw new Error("Please fill in all fields");
        }

        // Convert comma-separated string values to arrays
        const xValues = xValuesInput.split(",").map(value => {
            const num = parseFloat(value.trim());
            if (isNaN(num)) {
                throw new Error("Invalid number in x values");
            }
            return num;
        });

        const yValues = yValuesInput.split(",").map(value => {
            const num = parseFloat(value.trim());
            if (isNaN(num)) {
                throw new Error("Invalid number in y values");
            }
            return num;
        });

        const x = parseFloat(xInput);
        if (isNaN(x)) {
            throw new Error("Invalid x value");
        }

        // Validate array lengths
        if (xValues.length !== yValues.length) {
            throw new Error("Number of x values must be equal to the number of y values");
        }

        if (xValues.length < 2) {
            throw new Error("At least 2 points are required for interpolation");
        }

        // Calculate interpolation
        const interpolatedValue = newtonInterpolation(x, xValues, yValues);
        
        // Display result with animation
        const resultElement = document.getElementById("result");
        resultElement.style.opacity = "0";
        setTimeout(() => {
            resultElement.innerHTML = `
                <strong>Divided difference value at f(${x}) = ${interpolatedValue.toFixed(4)}</strong>
                <br>
                <small>Using ${xValues.length} data points</small>
            `;
            resultElement.style.opacity = "1";
        }, 300);

    } catch (error) {
        // Display error message
        const resultElement = document.getElementById("result");
        resultElement.style.color = "red";
        resultElement.innerHTML = `<strong>Error:</strong> ${error.message}`;
    }
}

function newtonInterpolation(x, xValues, yValues) {
    const n = xValues.length;
    let result = yValues[0];
    const coefficients = [...yValues];

    // Calculate the divided differences
    for (let j = 1; j < n; j++) {
        for (let i = n - 1; i >= j; i--) {
            coefficients[i] = (coefficients[i] - coefficients[i - 1]) / (xValues[i] - xValues[i - j]);
        }
        result += coefficients[j] * productTerm(x, xValues, j);
    }
    return result;
}

function productTerm(x, xValues, j) {
    let product = 1;
    for (let k = 0; k < j; k++) {
        product *= (x - xValues[k]);
    }
    return product;
}

// Add scroll reveal animation
ScrollReveal().reveal('.container', {
    delay: 200,
    distance: '50px',
    origin: 'bottom',
    duration: 1000,
    easing: 'cubic-bezier(0.5, 0, 0, 1)',
});

// Add input validation
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', function() {
        this.style.borderColor = '#e1e1e1';
        document.getElementById('result').style.color = 'var(--second-color)';
    });
});
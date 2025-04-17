function calculateIntegral() {
    // Get input values
    const funcStr = document.getElementById('function').value;
    const a = parseFloat(document.getElementById('lowerLimit').value);
    const b = parseFloat(document.getElementById('upperLimit').value);
    const n = parseInt(document.getElementById('intervals').value);

    // Validate input
    if (isNaN(a) || isNaN(b) || isNaN(n)) {
        alert('Please enter valid numbers for all fields');
        return;
    }

    if (n <= 0) {
        alert('Number of intervals must be positive');
        return;
    }

    if (a >= b) {
        alert('Lower limit must be less than upper limit');
        return;
    }

    if (n % 2 !== 0) {
        alert('Number of intervals must be even for Simpson\'s 1/3 Rule');
        return;
    }

    // Calculate h (width of each interval)
    const h = (b - a) / n;

    // Create the function from the input string
    const f = new Function('x', 'return ' + funcStr.replace(/\^/g, '**'));

    // Calculate the integral using Simpson's 1/3 Rule
    let sumEven = 0;
    let sumOdd = 0;

    for (let i = 1; i < n; i++) {
        const x = a + i * h;
        if (i % 2 === 0) {
            sumEven += f(x);
        } else {
            sumOdd += f(x);
        }
    }

    const integral = (h / 3) * (f(a) + f(b) + 4 * sumOdd + 2 * sumEven);

    // Display results
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `
        <p><strong>Function:</strong> f(x) = ${funcStr}</p>
        <p><strong>Lower Limit (a):</strong> ${a}</p>
        <p><strong>Upper Limit (b):</strong> ${b}</p>
        <p><strong>Number of Intervals (n):</strong> ${n}</p>
        <p><strong>Width of Interval (h):</strong> ${h.toFixed(4)}</p>
        <p><strong>Approximate Integral:</strong> ${integral.toFixed(6)}</p>
    `;

    // Initialize ScrollReveal for results
    ScrollReveal().reveal('#result', {
        delay: 200,
        origin: 'bottom',
        distance: '20px',
        easing: 'ease-out'
    });
}

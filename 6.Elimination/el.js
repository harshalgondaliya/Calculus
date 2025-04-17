function solveEquations() {
    // Get coefficients from input fields
    const coefficients = {
        a11: parseFloat(document.getElementById('a11').value),
        a12: parseFloat(document.getElementById('a12').value),
        a13: parseFloat(document.getElementById('a13').value),
        b1: parseFloat(document.getElementById('b1').value),
        a21: parseFloat(document.getElementById('a21').value),
        a22: parseFloat(document.getElementById('a22').value),
        a23: parseFloat(document.getElementById('a23').value),
        b2: parseFloat(document.getElementById('b2').value),
        a31: parseFloat(document.getElementById('a31').value),
        a32: parseFloat(document.getElementById('a32').value),
        a33: parseFloat(document.getElementById('a33').value),
        b3: parseFloat(document.getElementById('b3').value)
    };

    // Validate inputs
    if (Object.values(coefficients).some(isNaN)) {
        showError("Please enter valid numbers for all coefficients");
        return;
    }

    // Create augmented matrix
    const matrix = [
        [coefficients.a11, coefficients.a12, coefficients.a13, coefficients.b1],
        [coefficients.a21, coefficients.a22, coefficients.a23, coefficients.b2],
        [coefficients.a31, coefficients.a32, coefficients.a33, coefficients.b3]
    ];

    const steps = [];
    let rank = 0;

    // Apply Gauss Elimination
    for (let i = 0; i < 3; i++) {
        // Find pivot row
        let pivotRow = i;
        for (let j = i + 1; j < 3; j++) {
            if (Math.abs(matrix[j][i]) > Math.abs(matrix[pivotRow][i])) {
                pivotRow = j;
            }
        }

        // Swap rows if necessary
        if (pivotRow !== i) {
            [matrix[i], matrix[pivotRow]] = [matrix[pivotRow], matrix[i]];
            steps.push({
                type: 'swap',
                rows: [i, pivotRow],
                matrix: JSON.parse(JSON.stringify(matrix))
            });
        }

        // Check if matrix is singular
        if (matrix[i][i] === 0) {
            showError("Matrix is singular (no unique solution exists)");
            return;
        }

        // Eliminate other rows
        for (let k = i + 1; k < 3; k++) {
            const factor = matrix[k][i] / matrix[i][i];
            for (let j = i; j <= 3; j++) {
                matrix[k][j] -= factor * matrix[i][j];
            }
            if (factor !== 0) {
                steps.push({
                    type: 'eliminate',
                    targetRow: k,
                    sourceRow: i,
                    factor: factor,
                    matrix: JSON.parse(JSON.stringify(matrix))
                });
            }
        }

        rank++;
    }

    // Back substitution
    const solution = {
        z: matrix[2][3] / matrix[2][2],
        y: (matrix[1][3] - matrix[1][2] * matrix[2][3] / matrix[2][2]) / matrix[1][1],
        x: (matrix[0][3] - matrix[0][1] * ((matrix[1][3] - matrix[1][2] * matrix[2][3] / matrix[2][2]) / matrix[1][1]) - matrix[0][2] * matrix[2][3] / matrix[2][2]) / matrix[0][0]
    };

    displayResults(solution, matrix, steps);
}

function displayResults(solution, matrix, steps) {
    const resultDiv = document.getElementById('result');
    const matrixDiv = document.getElementById('matrix');
    const stepsDiv = document.getElementById('steps');

    // Display solution
    resultDiv.innerHTML = `
        <div class="solution-values">
            <p>x = ${solution.x.toFixed(4)}</p>
            <p>y = ${solution.y.toFixed(4)}</p>
            <p>z = ${solution.z.toFixed(4)}</p>
        </div>
    `;

    // Display matrix
    matrixDiv.innerHTML = `
        <table>
            <tr>
                <th>x</th>
                <th>y</th>
                <th>z</th>
                <th>=</th>
            </tr>
            ${matrix.map(row => `
                <tr>
                    ${row.map(cell => `<td>${cell.toFixed(4)}</td>`).join('')}
                </tr>
            `).join('')}
        </table>
    `;

    // Display steps
    stepsDiv.innerHTML = '<h3>Solution Steps</h3>';
    steps.forEach((step, index) => {
        const stepDiv = document.createElement('div');
        stepDiv.className = 'step';
        stepDiv.innerHTML = `
            <h4>Step ${index + 1}: ${getStepDescription(step)}</h4>
            <table>
                <tr>
                    <th>x</th>
                    <th>y</th>
                    <th>z</th>
                    <th>=</th>
                </tr>
                ${step.matrix.map(row => `
                    <tr>
                        ${row.map(cell => `<td>${cell.toFixed(4)}</td>`).join('')}
                    </tr>
                `).join('')}
            </table>
        `;
        stepsDiv.appendChild(stepDiv);
    });

    // Animate results
    setTimeout(() => {
        resultDiv.classList.add('show');
        matrixDiv.classList.add('show');
        stepsDiv.classList.add('show');
    }, 100);
}

function getStepDescription(step) {
    switch (step.type) {
        case 'swap':
            return `Swapped rows ${step.rows[0] + 1} and ${step.rows[1] + 1}`;
        case 'eliminate':
            return `Eliminated row ${step.targetRow + 1} using row ${step.sourceRow + 1} with factor ${step.factor.toFixed(4)}`;
        default:
            return 'Unknown step';
    }
}

function showError(message) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `
        <div class="error-message">
            <i class='bx bx-error-circle'></i>
            <p>${message}</p>
        </div>
    `;
}
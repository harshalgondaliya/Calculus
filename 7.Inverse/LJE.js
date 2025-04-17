function solveEquations() {
    // Getting coefficients from input fields
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

    // Creating the augmented matrix
    const matrix = [
        [coefficients.a11, coefficients.a12, coefficients.a13, coefficients.b1],
        [coefficients.a21, coefficients.a22, coefficients.a23, coefficients.b2],
        [coefficients.a31, coefficients.a32, coefficients.a33, coefficients.b3]
    ];

    // Applying Gauss-Jordan Elimination
    let rank = 0;
    const steps = [];

    for (let i = 0; i < 3; i++) {
        // Search for nonzero entry in this column from row i downwards
        let nonzeroRow = -1;
        for (let j = i; j < 3; j++) {
            if (matrix[j][i] !== 0) {
                nonzeroRow = j;
                break;
            }
        }
        if (nonzeroRow === -1) continue;

        // Swap rows if necessary
        if (nonzeroRow !== i) {
            [matrix[i], matrix[nonzeroRow]] = [matrix[nonzeroRow], matrix[i]];
            steps.push({
                type: 'swap',
                rows: [i, nonzeroRow],
                matrix: JSON.parse(JSON.stringify(matrix))
            });
        }

        // Scale pivot row
        const pivot = matrix[i][i];
        for (let j = i; j <= 3; j++) {
            matrix[i][j] /= pivot;
        }
        steps.push({
            type: 'scale',
            row: i,
            pivot: pivot,
            matrix: JSON.parse(JSON.stringify(matrix))
        });

        // Eliminate other entries
        for (let k = 0; k < 3; k++) {
            if (k === i) continue;
            const factor = matrix[k][i];
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

    // Display results with animations
    displayResults(matrix, rank, steps);
}

function displayResults(matrix, rank, steps) {
    const resultDiv = document.getElementById('matrix');
    resultDiv.innerHTML = '';

    // Create solution section
    const solutionDiv = document.createElement('div');
    solutionDiv.className = 'solution-section';
    
    // Display final matrix
    const matrixTable = document.createElement('table');
    matrixTable.className = 'result-matrix';
    
    // Add header row
    const headerRow = document.createElement('tr');
    ['x', 'y', 'z', '='].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        headerRow.appendChild(th);
    });
    matrixTable.appendChild(headerRow);

    // Add data rows
    matrix.forEach((row, i) => {
        const tr = document.createElement('tr');
        row.forEach((cell, j) => {
            const td = document.createElement('td');
            td.textContent = cell.toFixed(4);
            tr.appendChild(td);
        });
        matrixTable.appendChild(tr);
    });

    solutionDiv.appendChild(matrixTable);

    // Add rank information
    const rankInfo = document.createElement('div');
    rankInfo.className = 'rank-info';
    rankInfo.innerHTML = `
        <p>Matrix Rank: ${rank}</p>
        <p>Augmented Rank: ${rank === 3 ? rank : rank + 1}</p>
    `;
    solutionDiv.appendChild(rankInfo);

    // Add solution type
    const solutionType = document.createElement('div');
    solutionType.className = 'solution-type';
    if (rank === 3) {
        solutionType.innerHTML = '<p class="unique-solution">Unique Solution Exists</p>';
    } else if (rank === 2) {
        solutionType.innerHTML = '<p class="infinite-solutions">Infinite Solutions Exist</p>';
    } else {
        solutionType.innerHTML = '<p class="no-solution">No Solution Exists</p>';
    }
    solutionDiv.appendChild(solutionType);

    // Add steps section
    if (steps.length > 0) {
        const stepsDiv = document.createElement('div');
        stepsDiv.className = 'steps-section';
        stepsDiv.innerHTML = '<h3>Solution Steps</h3>';
        
        steps.forEach((step, index) => {
            const stepDiv = document.createElement('div');
            stepDiv.className = 'step';
            stepDiv.innerHTML = `
                <h4>Step ${index + 1}: ${getStepDescription(step)}</h4>
                <table class="step-matrix">
                    ${step.matrix.map(row => `
                        <tr>${row.map(cell => `<td>${cell.toFixed(4)}</td>`).join('')}</tr>
                    `).join('')}
                </table>
            `;
            stepsDiv.appendChild(stepDiv);
        });
        
        solutionDiv.appendChild(stepsDiv);
    }

    resultDiv.appendChild(solutionDiv);
    
    // Animate the results
    setTimeout(() => {
        solutionDiv.classList.add('show');
    }, 100);
}

function getStepDescription(step) {
    switch (step.type) {
        case 'swap':
            return `Swapped rows ${step.rows[0] + 1} and ${step.rows[1] + 1}`;
        case 'scale':
            return `Scaled row ${step.row + 1} by ${(1/step.pivot).toFixed(4)}`;
        case 'eliminate':
            return `Eliminated row ${step.targetRow + 1} using row ${step.sourceRow + 1} with factor ${step.factor.toFixed(4)}`;
        default:
            return 'Unknown step';
    }
}

function showError(message) {
    const resultDiv = document.getElementById('matrix');
    resultDiv.innerHTML = `
        <div class="error-message">
            <i class='bx bx-error-circle'></i>
            <p>${message}</p>
        </div>
    `;
}
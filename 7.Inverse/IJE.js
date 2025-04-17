function createMatrix() {
    const rows = parseInt(document.getElementById('rows').value);
    const cols = parseInt(document.getElementById('cols').value);

    if (isNaN(rows) || isNaN(cols) || rows <= 0 || cols <= 0) {
        showError("Please enter valid dimensions");
        return;
    }

    if (rows !== cols) {
        showError("Matrix must be square for inverse calculation");
        return;
    }

    const matrixDiv = document.getElementById('matrix');
    matrixDiv.innerHTML = '';

    const table = document.createElement('table');
    table.className = 'input-matrix';

    for (let i = 0; i < rows; i++) {
        const tr = document.createElement('tr');
        for (let j = 0; j < cols; j++) {
            const td = document.createElement('td');
            const input = document.createElement('input');
            input.type = 'number';
            input.step = 'any';
            input.className = 'matrix-cell';
            input.id = `cell-${i}-${j}`;
            input.placeholder = `a${i+1}${j+1}`;
            td.appendChild(input);
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }

    matrixDiv.appendChild(table);
}

function calculateInverse() {
    const rows = parseInt(document.getElementById('rows').value);
    const cols = parseInt(document.getElementById('cols').value);

    if (isNaN(rows) || isNaN(cols)) {
        showError("Please create a matrix first");
        return;
    }

    // Get matrix values
    const matrix = [];
    for (let i = 0; i < rows; i++) {
        matrix[i] = [];
        for (let j = 0; j < cols; j++) {
            const value = parseFloat(document.getElementById(`cell-${i}-${j}`).value);
            if (isNaN(value)) {
                showError("Please enter valid numbers in all cells");
                return;
            }
            matrix[i][j] = value;
        }
    }

    // Create augmented matrix [A|I]
    const augmentedMatrix = [];
    for (let i = 0; i < rows; i++) {
        augmentedMatrix[i] = [...matrix[i]];
        for (let j = 0; j < rows; j++) {
            augmentedMatrix[i].push(i === j ? 1 : 0);
        }
    }

    const steps = [];

    // Apply Gauss-Jordan elimination
    for (let i = 0; i < rows; i++) {
        // Find pivot row
        let pivotRow = i;
        for (let j = i + 1; j < rows; j++) {
            if (Math.abs(augmentedMatrix[j][i]) > Math.abs(augmentedMatrix[pivotRow][i])) {
                pivotRow = j;
            }
        }

        // Swap rows if necessary
        if (pivotRow !== i) {
            [augmentedMatrix[i], augmentedMatrix[pivotRow]] = [augmentedMatrix[pivotRow], augmentedMatrix[i]];
            steps.push({
                type: 'swap',
                rows: [i, pivotRow],
                matrix: JSON.parse(JSON.stringify(augmentedMatrix))
            });
        }

        // Check if matrix is singular
        if (augmentedMatrix[i][i] === 0) {
            showError("Matrix is singular (no inverse exists)");
            return;
        }

        // Scale pivot row
        const pivot = augmentedMatrix[i][i];
        for (let j = i; j < 2 * rows; j++) {
            augmentedMatrix[i][j] /= pivot;
        }
        steps.push({
            type: 'scale',
            row: i,
            pivot: pivot,
            matrix: JSON.parse(JSON.stringify(augmentedMatrix))
        });

        // Eliminate other rows
        for (let k = 0; k < rows; k++) {
            if (k !== i) {
                const factor = augmentedMatrix[k][i];
                for (let j = i; j < 2 * rows; j++) {
                    augmentedMatrix[k][j] -= factor * augmentedMatrix[i][j];
                }
                if (factor !== 0) {
                    steps.push({
                        type: 'eliminate',
                        targetRow: k,
                        sourceRow: i,
                        factor: factor,
                        matrix: JSON.parse(JSON.stringify(augmentedMatrix))
                    });
                }
            }
        }
    }

    // Extract inverse matrix
    const inverseMatrix = [];
    for (let i = 0; i < rows; i++) {
        inverseMatrix[i] = augmentedMatrix[i].slice(rows);
    }

    displayResults(inverseMatrix, steps);
}

function displayResults(inverseMatrix, steps) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '';

    const solutionDiv = document.createElement('div');
    solutionDiv.className = 'solution-section';

    // Display inverse matrix
    const matrixTable = document.createElement('table');
    matrixTable.className = 'result-matrix';

    // Add header row
    const headerRow = document.createElement('tr');
    for (let i = 0; i < inverseMatrix[0].length; i++) {
        const th = document.createElement('th');
        th.textContent = `x${i+1}`;
        headerRow.appendChild(th);
    }
    matrixTable.appendChild(headerRow);

    // Add data rows
    inverseMatrix.forEach((row, i) => {
        const tr = document.createElement('tr');
        row.forEach(cell => {
            const td = document.createElement('td');
            td.textContent = cell.toFixed(4);
            tr.appendChild(td);
        });
        matrixTable.appendChild(tr);
    });

    solutionDiv.appendChild(matrixTable);

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
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `
        <div class="error-message">
            <i class='bx bx-error-circle'></i>
            <p>${message}</p>
        </div>
    `;
}
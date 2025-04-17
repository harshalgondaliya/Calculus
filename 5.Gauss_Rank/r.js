function createMatrixInput() {
    const rows = parseInt(document.getElementById('rows').value);
    const cols = parseInt(document.getElementById('cols').value);
    const matrixInput = document.getElementById('matrixInput');
    
    // Clear previous matrix
    matrixInput.innerHTML = '';
    
    // Create table structure
    const table = document.createElement('table');
    table.className = 'matrix-table';
    
    // Create input cells
    for (let i = 0; i < rows; i++) {
        const row = document.createElement('tr');
        for (let j = 0; j < cols; j++) {
            const cell = document.createElement('td');
            const input = document.createElement('input');
            input.type = 'number';
            input.step = 'any';
            input.placeholder = `a${i+1}${j+1}`;
            input.className = 'matrix-input';
            cell.appendChild(input);
            row.appendChild(cell);
        }
        table.appendChild(row);
    }
    
    matrixInput.appendChild(table);
    
    // Animate the matrix creation
    const inputs = matrixInput.getElementsByTagName('input');
    Array.from(inputs).forEach((input, index) => {
        setTimeout(() => {
            input.style.opacity = '1';
            input.style.transform = 'scale(1)';
        }, index * 50);
    });
}

function calculateRank() {
    const rows = parseInt(document.getElementById('rows').value);
    const cols = parseInt(document.getElementById('cols').value);
    const matrixInput = document.getElementById('matrixInput');
    const inputs = matrixInput.getElementsByTagName('input');
    
    // Create matrix from input values
    const matrix = [];
    for (let i = 0; i < rows; i++) {
        matrix[i] = [];
        for (let j = 0; j < cols; j++) {
            const value = parseFloat(inputs[i * cols + j].value);
            matrix[i][j] = isNaN(value) ? 0 : value;
        }
    }
    
    // Calculate rank using Gauss Elimination
    const steps = [];
    let rank = 0;
    
    // Make a copy of the matrix for manipulation
    const workingMatrix = JSON.parse(JSON.stringify(matrix));
    
    // Apply Gauss Elimination
    for (let i = 0; i < Math.min(rows, cols); i++) {
        // Find pivot row
        let pivotRow = i;
        for (let j = i + 1; j < rows; j++) {
            if (Math.abs(workingMatrix[j][i]) > Math.abs(workingMatrix[pivotRow][i])) {
                pivotRow = j;
            }
        }
        
        // Swap rows if necessary
        if (pivotRow !== i) {
            [workingMatrix[i], workingMatrix[pivotRow]] = [workingMatrix[pivotRow], workingMatrix[i]];
            steps.push({
                type: 'swap',
                rows: [i, pivotRow],
                matrix: JSON.parse(JSON.stringify(workingMatrix))
            });
        }
        
        // Check if current column is all zeros
        if (workingMatrix[i][i] === 0) {
            continue;
        }
        
        // Eliminate other rows
        for (let k = i + 1; k < rows; k++) {
            const factor = workingMatrix[k][i] / workingMatrix[i][i];
            if (factor !== 0) {
                for (let j = i; j < cols; j++) {
                    workingMatrix[k][j] -= factor * workingMatrix[i][j];
                }
                steps.push({
                    type: 'eliminate',
                    targetRow: k,
                    sourceRow: i,
                    factor: factor,
                    matrix: JSON.parse(JSON.stringify(workingMatrix))
                });
            }
        }
        
        rank++;
    }
    
    displayResults(rank, workingMatrix, steps);
}

function displayResults(rank, finalMatrix, steps) {
    const finalMatrixDiv = document.getElementById('finalMatrix');
    const rankDiv = document.getElementById('rank');
    const stepsDiv = document.getElementById('steps');
    
    // Display final matrix
    finalMatrixDiv.innerHTML = `
        <h3>Row Echelon Form</h3>
        <table>
            ${finalMatrix.map(row => `
                <tr>
                    ${row.map(cell => `<td>${cell.toFixed(4)}</td>`).join('')}
                </tr>
            `).join('')}
        </table>
    `;
    
    // Display rank
    rankDiv.innerHTML = `
        <div class="rank-value">
            <span>Matrix Rank: ${rank}</span>
        </div>
    `;
    
    // Display steps
    stepsDiv.innerHTML = '<h3>Solution Steps</h3>';
    steps.forEach((step, index) => {
        const stepDiv = document.createElement('div');
        stepDiv.className = 'step';
        stepDiv.innerHTML = `
            <h4>Step ${index + 1}: ${getStepDescription(step)}</h4>
            <table>
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
        finalMatrixDiv.classList.add('show');
        rankDiv.classList.add('show');
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
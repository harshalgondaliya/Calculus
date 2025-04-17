document.addEventListener('DOMContentLoaded', function() {
    const equationsInput = document.getElementById("equations");
    equationsInput.addEventListener("change", createInputTable);
    equationsInput.dispatchEvent(new Event("change"));
});

function createInputTable() {
    const n = parseInt(this.value);
    const inputTable = document.getElementById("inputTable");
    inputTable.innerHTML = "";

    // Create header row
    const headerRow = document.createElement("tr");
    for (let j = 0; j < n; j++) {
        const headerCell = document.createElement("th");
        headerCell.textContent = `x${j + 1}`;
        headerRow.appendChild(headerCell);
    }
    const constHeader = document.createElement("th");
    constHeader.textContent = "b";
    headerRow.appendChild(constHeader);
    inputTable.appendChild(headerRow);

    // Create input rows
    for (let i = 0; i < n; i++) {
        const row = document.createElement("tr");
        for (let j = 0; j < n; j++) {
            const cell = document.createElement("td");
            const input = document.createElement("input");
            input.type = "number";
            input.id = `coeff_${i}_${j}`;
            input.value = "0";
            input.step = "any";
            input.className = "matrix-input";
            cell.appendChild(input);
            row.appendChild(cell);
        }
        const constCell = document.createElement("td");
        const constInput = document.createElement("input");
        constInput.type = "number";
        constInput.id = `const_${i}`;
        constInput.value = "0";
        constInput.step = "any";
        constInput.className = "matrix-input";
        constCell.appendChild(constInput);
        row.appendChild(constCell);
        inputTable.appendChild(row);
    }
}

function gaussSeidel() {
    // Get user input for coefficients A and constants B
    const A = [];
    const B = [];
    const n = parseInt(document.getElementById("equations").value);
    
    // Validate input
    for (let i = 0; i < n; i++) {
        const coefficients = [];
        for (let j = 0; j < n; j++) {
            const value = parseFloat(document.getElementById(`coeff_${i}_${j}`).value);
            if (isNaN(value)) {
                showError(`Invalid coefficient at row ${i + 1}, column ${j + 1}`);
                return;
            }
            coefficients.push(value);
        }
        A.push(coefficients);
        
        const constValue = parseFloat(document.getElementById(`const_${i}`).value);
        if (isNaN(constValue)) {
            showError(`Invalid constant at row ${i + 1}`);
            return;
        }
        B.push(constValue);
    }

    // Check for diagonal dominance
    if (!isDiagonallyDominant(A)) {
        showError("Warning: Matrix is not diagonally dominant. Results may not converge.");
    }

    const tolerance = parseFloat(document.getElementById("tolerance").value);
    const maxIterations = parseInt(document.getElementById("maxIterations").value);

    if (isNaN(tolerance) || tolerance <= 0) {
        showError("Invalid tolerance value");
        return;
    }

    if (isNaN(maxIterations) || maxIterations < 1) {
        showError("Invalid number of iterations");
        return;
    }

    // Perform Gauss-Seidel iterations
    let X = new Array(n).fill(0); // Initial guess
    const results = []; // Store results for each iteration
    let iterations = 0;
    let error = Infinity;

    while (iterations < maxIterations && error > tolerance) {
        const Xnew = [...X];
        error = 0;

        for (let i = 0; i < n; i++) {
            let sum = 0;
            for (let j = 0; j < n; j++) {
                if (j !== i) {
                    sum += A[i][j] * Xnew[j]; // Use updated values
                }
            }
            Xnew[i] = (B[i] - sum) / A[i][i];
            error = Math.max(error, Math.abs(Xnew[i] - X[i]));
        }

        X = Xnew;
        results.push({
            iteration: iterations + 1,
            values: [...X],
            error: error
        });

        iterations++;
    }

    displayResults(X, results);
}

function isDiagonallyDominant(A) {
    const n = A.length;
    for (let i = 0; i < n; i++) {
        let sum = 0;
        for (let j = 0; j < n; j++) {
            if (j !== i) {
                sum += Math.abs(A[i][j]);
            }
        }
        if (Math.abs(A[i][i]) <= sum) {
            return false;
        }
    }
    return true;
}

function displayResults(finalX, iterationResults) {
    const output = document.getElementById("output");
    let html = "<div class='solution'>";
    
    // Display final solution
    html += "<h3>Final Solution</h3>";
    html += "<ul>";
    for (let i = 0; i < finalX.length; i++) {
        html += `<li>x${i + 1} = ${finalX[i].toFixed(6)}</li>`;
    }
    html += "</ul>";
    
    // Display iteration steps
    html += "<h3>Iteration Steps</h3>";
    html += "<table class='steps-table'>";
    html += "<thead><tr><th>Iteration</th>";
    for (let i = 0; i < finalX.length; i++) {
        html += `<th>x${i + 1}</th>`;
    }
    html += "<th>Error</th></tr></thead><tbody>";
    
    iterationResults.forEach(result => {
        html += `<tr><td>${result.iteration}</td>`;
        result.values.forEach(value => {
            html += `<td>${value.toFixed(6)}</td>`;
        });
        html += `<td>${result.error.toFixed(6)}</td></tr>`;
    });
    
    html += "</tbody></table></div>";
    output.innerHTML = html;
}

function showError(message) {
    const output = document.getElementById("output");
    output.innerHTML = `<div class="error-message">${message}</div>`;
} 
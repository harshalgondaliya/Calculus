// Initialize the input table when the page loads
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

function gaussJacobi() {
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

    const iterations = parseInt(document.getElementById("iterations").value);
    if (isNaN(iterations) || iterations < 1) {
        showError("Invalid number of iterations");
        return;
    }

    // Perform Gauss-Jacobi iterations
    let X = new Array(n).fill(0); // Initial guess
    const results = []; // Store results for each iteration

    for (let k = 0; k < iterations; k++) {
        const Xnew = [];
        for (let i = 0; i < n; i++) {
            let sum = 0;
            for (let j = 0; j < n; j++) {
                if (j !== i) {
                    sum += A[i][j] * X[j];
                }
            }
            Xnew[i] = (B[i] - sum) / A[i][i];
        }
        X = Xnew;
        results.push([...X]); // Store current iteration results
    }

    // Display results with animations
    displayResults(X, results);
}

function isDiagonallyDominant(A) {
    for (let i = 0; i < A.length; i++) {
        let sum = 0;
        for (let j = 0; j < A.length; j++) {
            if (i !== j) {
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
    output.innerHTML = "";

    // Create result content
    const resultContent = document.createElement("div");
    resultContent.className = "result-content";

    // Add final solution
    const solutionDiv = document.createElement("div");
    solutionDiv.className = "solution";
    solutionDiv.innerHTML = "<h3>Final Solution:</h3>";
    
    const solutionList = document.createElement("ul");
    for (let i = 0; i < finalX.length; i++) {
        const li = document.createElement("li");
        li.textContent = `x${i + 1} = ${finalX[i].toFixed(6)}`;
        solutionList.appendChild(li);
    }
    solutionDiv.appendChild(solutionList);
    resultContent.appendChild(solutionDiv);

    // Add iteration history
    const historyDiv = document.createElement("div");
    historyDiv.className = "iteration-history";
    historyDiv.innerHTML = "<h3>Iteration History:</h3>";
    
    const historyTable = document.createElement("table");
    const headerRow = document.createElement("tr");
    headerRow.innerHTML = "<th>Iteration</th>";
    for (let i = 0; i < finalX.length; i++) {
        headerRow.innerHTML += `<th>x${i + 1}</th>`;
    }
    historyTable.appendChild(headerRow);

    iterationResults.forEach((result, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${index + 1}</td>`;
        result.forEach(value => {
            row.innerHTML += `<td>${value.toFixed(6)}</td>`;
        });
        historyTable.appendChild(row);
    });
    historyDiv.appendChild(historyTable);
    resultContent.appendChild(historyDiv);

    output.appendChild(resultContent);

    // Add animations
    const elements = document.querySelectorAll('.solution, .iteration-history');
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

function showError(message) {
    const output = document.getElementById("output");
    output.innerHTML = `
        <div class="error-message">
            <p>${message}</p>
        </div>
    `;
} 
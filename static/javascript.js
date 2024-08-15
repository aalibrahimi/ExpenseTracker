// Data structure to store expenses
const expenses = [];

// Function to add an expense
function addExpense(date, category, amount) {
    expenses.push({ date: new Date(date), category, amount });
}

function updateDisplayedMonth() {
    const monthPicker = document.getElementById('monthPicker');
    const [year, month] = monthPicker.value.split('-');
    displayMonthlyExpenses(parseInt(month) - 1, parseInt(year));
}

// Function to add expense from form
function addExpenseFromForm() {
    const date = document.getElementById('expenseDate').value;
    const category = document.getElementById('expenseCategory').value;
    const amount = parseFloat(document.getElementById('expenseAmount').value);

    if (date && category && !isNaN(amount)) {
        //fomrating the date to mm/dd/yyyy
        const formattedDate = new Date(date).toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric'
        }).replace(/\//g, '-');

        const expenseData = { date: formattedDate, category, amount };
        console.log('Sending expense data:', expenseData);  // Log the data being sent

        fetch('http://localhost:5001/add_expense', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(expenseData),
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(errorData => {
                    throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error || 'Unknown error'}`);
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('Success:', data);
            updateDisplayedMonth();
            // Clear form
            document.getElementById('expenseDate').value = '';
            document.getElementById('expenseCategory').value = '';
            document.getElementById('expenseAmount').value = '';
        })
        .catch((error) => {
            console.error('Error:', error);
            alert(`Failed to add expense. Error: ${error.message}`);
        });
    } else {
        // alert('Please fill all fields correctly');
    }
}
// Function to get expenses for a specific month and year
function getMonthlyExpenses(month, year) {
    return expenses.filter(expense => 
        expense.date.getMonth() === month && 
        expense.date.getFullYear() === year
    );
}

// Function to calculate total expenses for a month
function calculateMonthlyTotal(month, year) {
    const monthlyExpenses = getMonthlyExpenses(month, year);
    return monthlyExpenses.reduce((total, expense) => total + expense.amount, 0);
}

// Function to display monthly expenses
function displayMonthlyExpenses(month, year) {
    fetch(`http://localhost:5001/get_expenses?month=${month + 1}&year=${year}`)
    // fetch('http://localhost:5001/get_expenses')
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(expenses => {
        const expenseList = document.getElementById('expenseList');
        expenseList.innerHTML = '';
        
        let total = 0;
        expenses.forEach(expense => {
            const li = document.createElement('li');
            li.textContent = `${expense.date} - ${expense.category}: $${expense.amount.toFixed(2)}`;
            expenseList.appendChild(li);
            total += expense.amount;
        });
        
        const totalElement = document.getElementById('total');
        totalElement.textContent = `Total: $${total.toFixed(2)}`;
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('Failed to fetch expenses. Please try again.');
    });
}
//Tab Switching
document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click',() => {
        const tabId = button.getAttribute('data-tab');
        switchTab(tabId);
    })
});
document.getElementById('graphType').addEventListener('change', loadGraphs);
function loadGraphs() {
    const graphType = document.getElementById('graphType').value;
    fetch(`http://localhost:5001/spending_by_categories`)
        .then(response => response.json())
        .then(data => {
            const categories = Object.keys(data);
            const amounts = Object.values(data);

            let trace;
            let layout;

            switch(graphType) {
                case 'bar':
                    trace = {
                        x: categories,
                        y: amounts,
                        type: 'bar'
                    };
                    layout = {
                        title: 'Spending by Category',
                        xaxis: { title: 'Category' },
                        yaxis: { title: 'Amount ($)' }
                    };
                    break;
                case 'pie':
                    trace = {
                        labels: categories,
                        values: amounts,
                        type: 'pie'
                    };
                    layout = {
                        title: 'Spending by Category'
                    };
                    break;
                case 'line':
                    trace = {
                        x: categories,
                        y: amounts,
                        type: 'scatter',
                        mode: 'lines+markers'
                    };
                    layout = {
                        title: 'Spending by Category',
                        xaxis: { title: 'Category' },
                        yaxis: { title: 'Amount ($)' }
                    };
                    break;
            }
            //enabling and creating a zoom in/zoom out function
            const config = {
                scrollZoom: true //enable zoom using the mouse wheel
            };
            Plotly.newPlot('graphContainer', [trace], layout, config);
            
            //event listener for refocusing when left clicking
            const graphContainer = document.getElementById('graphContainer');
            graphContainer.on('plotly_click', function() 
            {
                Plotly.relayout(graphContainer, {
                    'xaxis.autorange':true,
                    'yaxis.autorange':true
                });
            });
    
        })
        .catch(error => console.error('Error:', error));
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    const tabContent = document.getElementById(tabId);
    if (tabContent) {
        tabContent.classList.add('active');
    }
    const tabButton = document.querySelector(`.tab-button[data-tab="${tabId}"]`);
    if (tabButton) {
        tabButton.classList.add('active');
    }

    if (tabId === 'expenses') {
        updateDisplayedMonth();
    } else if (tabId === 'graphs') {
        loadGraphs();
    } else if (tabId === 'categories') {
        loadCategories();
    }
}
function loadCategories() 
{
    fetch('http://localhost:5001/get_categories')
        .then(response => response.json())
        .then(categories => {
            const categoryList = document.getElementById('categories');
            categoryList.innerHTML = '<h2>categories</h2>' +
                categories.map(category => `<li>${category}</li>`).join('') +
                '</ul>';
        })
        .catch(error => console.error('Error:', error))
}

// fetch('http://localhost:5001/get_expenses')
//     .then(response => {
//         if (!response.ok) {
//             throw new Error('Network response was not ok');
//         }
//         return response.json();
//     })
//     .then(expenses => {
//         // Process expenses
//     })
//     .catch(error => {
//         console.error('Error:', error);
//         // Display error message to user
//     });
// Set default month to current month
const today = new Date();
document.getElementById('monthPicker').value = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}`;
updateDisplayedMonth();

document.getElementById('monthPicker').addEventListener('change', updateDisplayedMonth);
document.querySelector('button').addEventListener('click', addExpenseFromForm);
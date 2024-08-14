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
        fetch('http://localhost:5001/add_expense', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ date, category, amount }),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            updateDisplayedMonth();
        })
        .catch((error) => {
            console.error('Error:', error);
        });

        // Clear form
        document.getElementById('expenseDate').value = '';
        document.getElementById('expenseCategory').value = '';
        document.getElementById('expenseAmount').value = '';
    } else {
        alert('Please fill all fields correctly');
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
    // fetch(`http://127.0.0.1:5001/get_expenses?month=${month + 1}&year=${year}`)
    fetch('http://localhost:5001/get_expenses')
    .then(response => response.json())
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
    });
}
//Tab Switching
document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click',() => {
        const tabId = button.getAttribute('data-tab');
        switchTab(tabId);
    })
});

function switchTab(tabId)
{
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    document.getElementById(tabId).classList.add('active');
    document.querySelector(`.tab-button[data-tab="${tabId}]`.classList.add('active'));

    //this is how we load content based on tab
    if (tabId === 'expenses')
    {
        updateDisplayedMonth();

    }else if (tabId === 'graphs') {
        loadGraphs()

    }
    else if (tabId === 'categories') {
        loadCategories();
    }
}
function loadGraphs()
{
    fetch('http://localhost:5001/plot_spending')
        .then(response => response.json())
        .then(data => {
            const graphContainer = document.getElementById('graphs');
            graphContainer.innerHTML = `<img src="data:image/png;base64,${data.plot}" alt="Spending Graph">`;
        })
        .catch(error => console.error('Error:', error));
        
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
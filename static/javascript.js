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
        fetch('http://127.0.0.1:5001/add_expense', {
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
    fetch(`http://127.0.0.1:5001/get_expenses?month=${month + 1}&year=${year}`)
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

// Set default month to current month
const today = new Date();
document.getElementById('monthPicker').value = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}`;
updateDisplayedMonth();

document.getElementById('monthPicker').addEventListener('change', updateDisplayedMonth);
document.querySelector('button').addEventListener('click', addExpenseFromForm);
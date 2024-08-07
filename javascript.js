     // Data structure to store expenses
        const expenses = [];

        // Function to add an expense
        function addExpense(date, category, amount) {
            expenses.push({ date: new Date(date), category, amount });
        }

        // Function to add expense from form
        function addExpenseFromForm() {
            const date = document.getElementById('expenseDate').value;
            const category = document.getElementById('expenseCategory').value;
            const amount = parseFloat(document.getElementById('expenseAmount').value);

            if (date && category && !isNaN(amount)) {
                addExpense(date, category, amount);
                updateDisplayedMonth();
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
            const monthlyExpenses = getMonthlyExpenses(month, year);
            const total = calculateMonthlyTotal(month, year);
            
            // Clear previous display
            const expenseList = document.getElementById('expenseList');
            expenseList.innerHTML = '';
            
            // Display each expense
            monthlyExpenses.forEach(expense => {
                const li = document.createElement('li');
                li.textContent = `${expense.date.toDateString()} - ${expense.category}: $${expense.amount.toFixed(2)}`;
                expenseList.appendChild(li);
            });
            
            // Display total
            const totalElement = document.getElementById('total');
            totalElement.textContent = `Total: $${total.toFixed(2)}`;
        }

        // Function to update displayed month based on selector
        function updateDisplayedMonth() {
            const monthPicker = document.getElementById('monthPicker');
            const [year, month] = monthPicker.value.split('-');
            displayMonthlyExpenses(parseInt(month) - 1, parseInt(year));
        }

        // Set default month to current month
        const today = new Date();
        document.getElementById('monthPicker').value = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}`;
        updateDisplayedMonth();

        // Example usage (you can remove these in production)
        addExpense('2024-08-01', 'Groceries', 50);
        addExpense('2024-08-15', 'Utilities', 100);
        addExpense('2024-09-01', 'Rent', 1000);
        updateDisplayedMonth();
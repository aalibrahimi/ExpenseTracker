document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard JavaScript loaded');

    const expenses = [];

    function addExpense(date, category, amount) {
        expenses.push({ date: new Date(date), category, amount });
    }

    function updateDisplayedMonth() {
        const monthPicker = document.getElementById('monthPicker');
        const [year, month] = monthPicker.value.split('-');
        displayMonthlyExpenses(parseInt(month) - 1, parseInt(year));
    }

    function addExpenseFromForm() {
        const date = document.getElementById('expenseDate').value;
        const category = document.getElementById('expenseCategory').value;
        const amount = parseFloat(document.getElementById('expenseAmount').value);

        if (date && category && !isNaN(amount)) {
            const formattedDate = new Date(date).toISOString().split('T')[0];
            const expenseData = { date: formattedDate, category, amount };
            console.log('Sending expense data:', expenseData);

            fetch('http://localhost:5001/add_expense', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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
                document.getElementById('expenseDate').value = '';
                document.getElementById('expenseCategory').value = '';
                document.getElementById('expenseAmount').value = '';
            })
            .catch(error => console.error('Error:', error));
        }
    }

    function displayMonthlyExpenses(month, year) {
        fetch(`http://localhost:5001/get_expenses?month=${month + 1}&year=${year}`)
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
                li.textContent = `${expense.date} - ${expense.category}: $${parseFloat(expense.amount).toFixed(2)}`;
                expenseList.appendChild(li);
                total += parseFloat(expense.amount);
            });
            
            const totalElement = document.getElementById('total');
            totalElement.textContent = `Total: $${total.toFixed(2)}`;
        })
        .catch(error => console.error('Error:', error));
    }

    function loadGraphs() {
        const graphType = document.getElementById('graphType').value;
        fetch(`http://localhost:5001/spending_by_categories`)
            .then(response => response.json())
            .then(data => {
                const categories = data.categories;
                const amounts = data.amounts;

                let trace, layout;

                switch(graphType) {
                    case 'bar':
                        trace = { x: categories, y: amounts, type: 'bar' };
                        layout = {
                            title: 'Spending by Category',
                            xaxis: { title: 'Category' },
                            yaxis: { title: 'Amount ($)' }
                        };
                        break;
                    case 'pie':
                        trace = { labels: categories, values: amounts, type: 'pie' };
                        layout = { title: 'Spending by Category' };
                        break;
                    case 'line':
                        trace = { x: categories, y: amounts, type: 'scatter', mode: 'lines+markers' };
                        layout = {
                            title: 'Spending by Category',
                            xaxis: { title: 'Category' },
                            yaxis: { title: 'Amount ($)' }
                        };
                        break;
                }

                const config = { scrollZoom: true };
                Plotly.newPlot('graphContainer', [trace], layout, config);
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

    function loadCategories() {
        fetch('http://localhost:5001/get_categories')
            .then(response => response.json())
            .then(categories => {
                const categoryList = document.getElementById('categories');
                categoryList.innerHTML = '<h2>Categories</h2>' +
                    categories.map(category => `<li>${category}</li>`).join('') +
                    '</ul>';
            })
            .catch(error => console.error('Error:', error));
    }

    function fetchData() {
        fetch('/get_expenses?month=8&year=2024')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch expenses');
                }
                return response.json();
            })
            .then(data => {
                console.log('Expenses fetched:', data);
                // Handle the fetched data (e.g., display it on the page)
            })
            .catch(error => console.error('Error:', error));
    }

    // Event Listeners
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            switchTab(tabId);
        });
    });

    document.getElementById('graphType').addEventListener('change', loadGraphs);

    const monthPicker = document.getElementById('monthPicker');
    if (monthPicker) {
        const today = new Date();
        monthPicker.value = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}`;
        monthPicker.addEventListener('change', updateDisplayedMonth);
    }

    const addExpenseButton = document.querySelector('button');
    if (addExpenseButton) {
        addExpenseButton.addEventListener('click', addExpenseFromForm);
    }

    // Initial load
    if (isAuthenticated()) {
        fetchData();
    } else {
        console.log('User is not authenticated; waiting for login.');
    }

    updateDisplayedMonth();
});
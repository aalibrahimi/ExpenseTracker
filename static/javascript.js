//commented out 3 catch alerts
// Data structure to store expenses
const expenses = []; // An array to store expense objects. Each object will contain a date, category, and amount.

// Function to add an expense
function addExpense(date, category, amount) {
    // Adds a new expense object to the expenses array.
    // The date is converted to a Date object for easier manipulation later.
    expenses.push({ date: new Date(date), category, amount });
}

function updateDisplayedMonth() {
    // Updates the displayed expenses based on the selected month and year.
    const monthPicker = document.getElementById('monthPicker');
    const [year, month] = monthPicker.value.split('-'); // Splits the selected value (format: YYYY-MM) into year and month.
    displayMonthlyExpenses(parseInt(month) - 1, parseInt(year)); // Calls the function to display expenses for the selected month and year.
}

// Function to add expense from form
function addExpenseFromForm() {
    // Gets values from the form fields.
    const date = document.getElementById('expenseDate').value;
    const category = document.getElementById('expenseCategory').value;
    const amount = parseFloat(document.getElementById('expenseAmount').value);

    if (date && category && !isNaN(amount)) {
        // Formatting the date to YYYY-MM-DD
        const formattedDate = new Date(date).toISOString().split('T')[0];

        // Preparing the expense data to send to the server.
        const expenseData = { date: formattedDate, category, amount };
        console.log('Sending expense data:', expenseData); // Logs the data being sent for debugging purposes.

        // Sends the expense data to the server using a POST request.
        fetch('http://localhost:5001/add_expense', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(expenseData),
        })
        .then(response => {
            if (!response.ok) {
                // If the response is not OK, parse the error message and throw an error.
                return response.json().then(errorData => {
                    throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error || 'Unknown error'}`);
                });
            }
            return response.json(); // Converts the response to JSON.
        })
        .then(data => {
            console.log('Success:', data); // Logs the success message.
            updateDisplayedMonth(); // Updates the displayed expenses to include the new one.
            // Clears the form fields after the expense is successfully added.
            document.getElementById('expenseDate').value = '';
            document.getElementById('expenseCategory').value = '';
            document.getElementById('expenseAmount').value = '';
        })
        // .catch((error) => {
        //     // Logs any errors and displays an alert to the user.
        //     console.error('Error:', error);
        //     alert(`Failed to add expense. Error: ${error.message}`);
        // });
    } else {
        // alert('Please fill all fields correctly'); // Uncomment this line if you want to notify the user to fill in all fields.
    }
}

// Function to get expenses for a specific month and year
function getMonthlyExpenses(month, year) {
    // Filters the expenses array to return only those that match the given month and year.
    return expenses.filter(expense => 
        expense.date.getMonth() === month && 
        expense.date.getFullYear() === year
    );
}

// Function to calculate total expenses for a month
function calculateMonthlyTotal(month, year) {
    // Gets the expenses for the specified month and year, then sums up the amounts.
    const monthlyExpenses = getMonthlyExpenses(month, year);
    return monthlyExpenses.reduce((total, expense) => total + expense.amount, 0);
}

// Function to display monthly expenses
function displayMonthlyExpenses(month, year) {
    // Fetches the expenses from the server for the given month and year.
    fetch(`http://localhost:5001/get_expenses?month=${month + 1}&year=${year}`)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json(); // Converts the response to JSON.
    })
    .then(expenses => {
        const expenseList = document.getElementById('expenseList');
        expenseList.innerHTML = ''; // Clears the current list of expenses.
        
        let total = 0;
        expenses.forEach(expense => {
            // Creates a list item for each expense and adds it to the DOM.
            const li = document.createElement('li');
            li.textContent = `${expense.date} - ${expense.category}: $${parseFloat(expense.amount).toFixed(2)}`;
            expenseList.appendChild(li);
            total += parseFloat(expense.amount); // Sums up the total amount spent.
        });
        
        const totalElement = document.getElementById('total');
        totalElement.textContent = `Total: $${total.toFixed(2)}`; // Displays the total amount spent.
    })
    .catch((error) => {
        console.error('Error:', error);
        // alert('Failed to fetch expenses. Please try again.'); // Alerts the user if there was an error fetching the expenses.
    });
}

//Tab Switching
document.querySelectorAll('.tab-button').forEach(button => {
    // Adds a click event listener to each tab button to switch between tabs.
    button.addEventListener('click',() => {
        const tabId = button.getAttribute('data-tab');
        switchTab(tabId); // Calls the function to switch tabs.
    });
});

document.getElementById('graphType').addEventListener('change', loadGraphs); // Loads the graphs when the graph type is changed.

function loadGraphs() {
    // Fetches the spending data by category from the server.
    const graphType = document.getElementById('graphType').value;
    fetch(`http://localhost:5001/spending_by_categories`)
        .then(response => response.json())
        .then(data => {
            const categories = data.categories; // Extracts the categories from the response.
            const amounts = data.amounts; // Extracts the amounts from the response.

            let trace;
            let layout;

            switch(graphType) {
                case 'bar':
                    // Creates a bar chart trace.
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
                    // Creates a pie chart trace.
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
                    // Creates a line chart trace.
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
            // Enables zooming in and out using the mouse wheel.
            const config = {
                scrollZoom: true 
            };
            Plotly.newPlot('graphContainer', [trace], layout, config);
            
            // Adds an event listener to reset zoom when the graph is clicked.
            const graphContainer = document.getElementById('graphContainer');
            graphContainer.on('plotly_click', function() {
                Plotly.relayout(graphContainer, {
                    'xaxis.autorange':true,
                    'yaxis.autorange':true
                });
            });
    
        })
        .catch(error => console.error('Error:', error)); // Logs any errors.
}

function switchTab(tabId) {
    // Switches between tabs by changing the active tab and content.
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active'); // Removes active class from all tab contents.
    });
    
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active'); // Removes active class from all tab buttons.
    });
    const tabContent = document.getElementById(tabId);
    if (tabContent) {
        tabContent.classList.add('active'); // Activates the selected tab content.
    }
    const tabButton = document.querySelector(`.tab-button[data-tab="${tabId}"]`);
    if (tabButton) {
        tabButton.classList.add('active'); // Activates the selected tab button.
    }

    if (tabId === 'expenses') {
        updateDisplayedMonth(); // Updates the displayed expenses if the "expenses" tab is selected.
    } else if (tabId === 'graphs') {
        loadGraphs(); // Loads graphs if the "graphs" tab is selected.
    } else if (tabId === 'categories') {
        loadCategories(); // Loads categories if the "categories" tab is selected.
    }
}

function loadCategories() {
    // Fetches the list of categories from the server and displays them.
    fetch('http://localhost:5001/get_categories')
        .then(response => response.json()) // Converts the server response to JSON.
        .then(categories => {
            const categoryList = document.getElementById('categories');
            // Creates the HTML content to display the list of categories.
            categoryList.innerHTML = '<h2>Categories</h2>' +
                categories.map(category => `<li>${category}</li>`).join('') + // Maps over the categories array to create list items for each category.
                '</ul>'; // Closes the unordered list.
        })
        .catch(error => console.error('Error:', error)); // Logs any errors encountered during the fetch operation.
}

// This fetch operation checks the user's authentication status and retrieves expenses if authenticated.
fetch('/get_expenses')
    .then(response => {
        if (!response.ok) {
            // If the user is not authenticated (status 401), redirect to the login page.
            if (response.status === 401) {
                window.location.href = '/login'; // Redirects to the login page if the user is not logged in.
            }
            throw new Error('Failed to fetch expenses'); // Throws an error if fetching expenses fails for any other reason.
        }
        return response.json(); // Converts the response to JSON.
    })
    .then(data => {
        // Process and display data (this is a placeholder comment for further implementation).
    })
    // .catch(error => {
    //     // Alerts the user if fetching expenses fails and logs the error to the console.
    //     alert('Failed to fetch expenses. Please try again.');
    //     console.error('Error:', error);
    // });

//code to ensure that user is loggined in before fetching  data
function isAuthenticated() {
    // You can determine if a user is authenticated by checking a specific cookie,
    // or by making a small API request to check the session status.
    return !!document.cookie.match(/session=([^;]+)/);
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
        // .catch(error => {
        //     console.error('Error:', error);
        //     alert('Failed to fetch expenses. Please try again.');
        // });
}
// Dark mode toggle
document.addEventListener('DOMContentLoaded', function() {
    const darkModeToggle = document.getElementById('toggle-dark-mode');
    const body = document.body;

    // Check if dark mode preference is stored in localStorage
    if (localStorage.getItem('darkMode') === 'enabled') {
        body.classList.add('dark-mode');
    }

    darkModeToggle.addEventListener('click', function(e) {
        e.preventDefault();
        body.classList.toggle('dark-mode');

        // Store the preference in localStorage
        if (body.classList.contains('dark-mode')) {
            localStorage.setItem('darkMode', 'enabled');
        } else {
            localStorage.setItem('darkMode', 'disabled');
        }
    });
});



// Only fetch data if the user is authenticated
document.addEventListener('DOMContentLoaded', function () {
    if (isAuthenticated()) {
        fetchData();
    } else {
        console.log('User is not authenticated; waiting for login.');
    }
});
//--------------------------------//-------------------------
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            // Perform login AJAX request here
            console.log('Login form submitted', email, password);
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            // Perform registration AJAX request here
            console.log('Register form submitted', email, password);
        });
    }
});

function toggleForm() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    if (loginForm.style.display === 'none') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    }
}

document.getElementById('loginForm').addEventListener('submit', function(e) {
console.log('Form submitted');
});
//-------
// Automatically sets the month picker to the current month and year.
const today = new Date();
document.getElementById('monthPicker').value = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}`; // Formats the date to "YYYY-MM".
updateDisplayedMonth(); // Updates the displayed expenses to match the current month and year.

// Adds an event listener to the month picker to update the displayed expenses when the user changes the month.
document.getElementById('monthPicker').addEventListener('change', updateDisplayedMonth);

// Adds an event listener to the button (presumably the "Add Expense" button) to trigger the function that adds an expense from the form.
document.querySelector('button').addEventListener('click', addExpenseFromForm);

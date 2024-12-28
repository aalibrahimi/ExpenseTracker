document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard JavaScript loaded');

    // Store active tab ID
    let activeTabId = 'expenses';

    function updateDisplayedMonth() {
        console.log('Updating displayed month');
        const monthPicker = document.getElementById('monthPicker');
        if (!monthPicker) {
            console.log('Month picker not found');
            return;
        }
        
        const [year, month] = monthPicker.value.split('-');
        displayMonthlyExpenses(parseInt(month) - 1, parseInt(year));
    }

    function addExpenseFromForm() {
        console.log('Add expense function called');
    const date = document.getElementById('expenseDate').value;
    const category = document.getElementById('expenseCategory').value;
    const amount = parseFloat(document.getElementById('expenseAmount').value);

    console.log('Form values:', { date, category, amount });
        if (date && category && !isNaN(amount)) {
            const formattedDate = new Date(date).toISOString().split('T')[0];
            const formData = new FormData();
            formData.append('date', formattedDate);
            formData.append('category', category);
            formData.append('amount', amount);

            // Get CSRF token
            const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
            if (!csrftoken) {
                console.error('CSRF token not found!');
                return;
            }

            fetch('/add-expense/', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': csrftoken
                },
                body: formData,
                credentials: 'include'
            })
            .then(response => {
                console.log('Response received:', response.status);
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
            .catch(error => {
                console.error('Error:', error);
                alert('Failed to add expense. Please try again.');
            });
        } else {
            alert('Please fill in all fields correctly.');
        }
    }

    function displayMonthlyExpenses(month, year) {
        console.log('Fetching expenses for:', { month: month + 1, year });
        fetch(`/get-expenses/?month=${month + 1}&year=${year}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(expenses => {
            console.log('Received expenses:', expenses);
            const expenseList = document.getElementById('expenseList');
            if (!expenseList) return;
            
            expenseList.innerHTML = '';
            
            let total = 0;
            expenses.forEach(expense => {
                const li = document.createElement('li');
                li.textContent = `${expense.date} - ${expense.category}: $${parseFloat(expense.amount).toFixed(2)}`;
                expenseList.appendChild(li);
                total += parseFloat(expense.amount);
            });
            
            // Update all total displays
            const totalElements = {
                total: document.getElementById('total'),
                monthlyTotal: document.getElementById('monthlyTotal'),
                expenseCount: document.getElementById('expenseCount')
            };

            if (totalElements.total) {
                totalElements.total.textContent = `Total: $${total.toFixed(2)}`;
            }
            if (totalElements.monthlyTotal) {
                totalElements.monthlyTotal.textContent = `$${total.toFixed(2)}`;
            }
            if (totalElements.expenseCount) {
                totalElements.expenseCount.textContent = expenses.length;
            }
        })
        .catch(error => console.error('Error:', error));
    }

    function loadGraphs() {
        console.log('Loading graphs...');
        const graphType = document.getElementById('graphType')?.value || 'bar';
        fetch('/spending-by-categories/')
            .then(response => response.json())
            .then(data => {
                console.log('Graph data:', data);
                if (!data.categories || !data.amounts) {
                    console.log('No data available for graphs');
                    return;
                }

                const trace = {
                    x: data.categories,
                    y: data.amounts,
                    type: graphType === 'pie' ? 'pie' : graphType === 'line' ? 'scatter' : 'bar',
                    mode: graphType === 'line' ? 'lines+markers' : undefined,
                    labels: graphType === 'pie' ? data.categories : undefined,
                    values: graphType === 'pie' ? data.amounts : undefined
                };

                const layout = {
                    title: 'Spending by Category',
                    xaxis: graphType !== 'pie' ? { title: 'Category' } : undefined,
                    yaxis: graphType !== 'pie' ? { title: 'Amount ($)' } : undefined,
                    height: 400,
                    margin: { t: 50, b: 50, l: 50, r: 50 }
                };

                const config = { responsive: true };
                const graphContainer = document.getElementById('graphContainer');
                if (graphContainer) {
                    Plotly.newPlot('graphContainer', [trace], layout, config);
                    
                    // Update top category in stats
                    const topCategory = document.getElementById('topCategory');
                    if (topCategory && data.categories.length > 0) {
                        topCategory.textContent = data.categories[0];
                    }
                }
            })
            .catch(error => console.error('Error loading graphs:', error));
    }

    function switchTab(tabId) {
        console.log('Switching to tab:', tabId);
        
        // Hide all tab contents and deactivate all buttons
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        document.querySelectorAll('.tab-button').forEach(button => {
            button.classList.remove('active');
        });
    
        // Show selected tab and activate its button
        const selectedTab = document.getElementById(tabId);
        const selectedButton = document.querySelector(`.tab-button[data-tab="${tabId}"]`);
        
        if (selectedTab) {
            selectedTab.classList.add('active');
        }
        if (selectedButton) {
            selectedButton.classList.add('active');
        }
    
        // Load tab-specific content
        if (tabId === 'expenses') {
            updateDisplayedMonth();
        } else if (tabId === 'graphs') {
            loadGraphs();
        }
    }
    
    // Update form submission handling
    document.getElementById('expenseForm').addEventListener('submit', function(e) {
        e.preventDefault();
        addExpenseFromForm();
    });
    
    // Make sure tab buttons are properly set up
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            console.log('Tab clicked:', tabId);
            switchTab(tabId);
        });
    });

    // Set up event listeners
    function initializeEventListeners() {
        console.log('Initializing event listeners...');

        // Tab buttons
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const tabId = e.target.getAttribute('data-tab');
                switchTab(tabId);
            });
        });

        // Month picker
        const monthPicker = document.getElementById('monthPicker');
        if (monthPicker) {
            const today = new Date();
            monthPicker.value = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}`;
            monthPicker.addEventListener('change', updateDisplayedMonth);
        }

        // Add expense button
        const addExpenseButton = document.getElementById('addExpenseButton');
        if (addExpenseButton) {
            addExpenseButton.addEventListener('click', (e) => {
                e.preventDefault();
                addExpenseFromForm();
            });
        }

        // Graph type selector
        const graphTypeSelect = document.getElementById('graphType');
        if (graphTypeSelect) {
            graphTypeSelect.addEventListener('change', loadGraphs);
        }
    }

    // Initialize everything
    initializeEventListeners();
    switchTab('expenses'); // Start with expenses tab
});

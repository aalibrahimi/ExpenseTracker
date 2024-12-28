// types/expense.ts
interface Expense {
    date: string;
    category: string;
    amount: number;
  }
  
  interface GraphData {
    categories: string[];
    amounts: number[];
  }
  
  // components/ExpenseTracker.tsx
  import { useEffect, useState, useRef } from 'react';
  import Plotly from 'plotly.js-dist-min';
  
  interface TotalElements {
    total: HTMLElement | null;
    monthlyTotal: HTMLElement | null;
    expenseCount: HTMLElement | null;
  }
  
  export default function ExpenseTracker() {
    const [activeTabId, setActiveTabId] = useState<string>('expenses');
    const expenseFormRef = useRef<HTMLFormElement>(null);
    const graphContainerRef = useRef<HTMLDivElement>(null);
  
    const updateDisplayedMonth = () => {
      console.log('Updating displayed month');
      const monthPicker = document.getElementById('monthPicker') as HTMLInputElement;
      if (!monthPicker) {
        console.log('Month picker not found');
        return;
      }
      
      const [year, month] = monthPicker.value.split('-');
      displayMonthlyExpenses(parseInt(month) - 1, parseInt(year));
    };
  
    const addExpenseFromForm = async () => {
      console.log('Add expense function called');
      const dateInput = document.getElementById('expenseDate') as HTMLInputElement;
      const categoryInput = document.getElementById('expenseCategory') as HTMLSelectElement;
      const amountInput = document.getElementById('expenseAmount') as HTMLInputElement;
  
      const date = dateInput.value;
      const category = categoryInput.value;
      const amount = parseFloat(amountInput.value);
  
      console.log('Form values:', { date, category, amount });
  
      if (date && category && !isNaN(amount)) {
        const formattedDate = new Date(date).toISOString().split('T')[0];
        const formData = new FormData();
        formData.append('date', formattedDate);
        formData.append('category', category);
        formData.append('amount', amount.toString());
  
        // Get CSRF token
        const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]') as HTMLInputElement;
        if (!csrftoken?.value) {
          console.error('CSRF token not found!');
          return;
        }
  
        try {
          const response = await fetch('/add-expense/', {
            method: 'POST',
            headers: {
              'X-CSRFToken': csrftoken.value
            },
            body: formData,
            credentials: 'include'
          });
  
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error || 'Unknown error'}`);
          }
  
          const data = await response.json();
          console.log('Success:', data);
          updateDisplayedMonth();
          
          // Clear form
          dateInput.value = '';
          categoryInput.value = '';
          amountInput.value = '';
        } catch (error) {
          console.error('Error:', error);
          alert('Failed to add expense. Please try again.');
        }
      } else {
        alert('Please fill in all fields correctly.');
      }
    };
  
    const displayMonthlyExpenses = async (month: number, year: number) => {
      console.log('Fetching expenses for:', { month: month + 1, year });
      try {
        const response = await fetch(`/get-expenses/?month=${month + 1}&year=${year}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const expenses: Expense[] = await response.json();
        console.log('Received expenses:', expenses);
        
        const expenseList = document.getElementById('expenseList');
        if (!expenseList) return;
        
        expenseList.innerHTML = '';
        
        let total = 0;
        expenses.forEach(expense => {
          const li = document.createElement('li');
          li.textContent = `${expense.date} - ${expense.category}: $${parseFloat(expense.amount.toString()).toFixed(2)}`;
          expenseList.appendChild(li);
          total += expense.amount;
        });
        
        const totalElements: TotalElements = {
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
          totalElements.expenseCount.textContent = expenses.length.toString();
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
  
// Continuing ExpenseTracker.tsx...

const loadGraphs = async () => {
    console.log('Loading graphs...');
    const graphType = (document.getElementById('graphType') as HTMLSelectElement)?.value || 'bar';
    
    try {
      const response = await fetch('/spending-by-categories/');
      const data: GraphData = await response.json();
      
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
      
      if (graphContainerRef.current) {
        Plotly.newPlot(graphContainerRef.current, [trace], layout, config);
        
        // Update top category in stats
        const topCategory = document.getElementById('topCategory');
        if (topCategory && data.categories.length > 0) {
          topCategory.textContent = data.categories[0];
        }
      }
    } catch (error) {
      console.error('Error loading graphs:', error);
    }
  };

  const switchTab = (tabId: string) => {
    console.log('Switching to tab:', tabId);
    setActiveTabId(tabId);
    
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-button').forEach(button => {
      button.classList.remove('active');
    });

    const selectedTab = document.getElementById(tabId);
    const selectedButton = document.querySelector(`.tab-button[data-tab="${tabId}"]`);
    
    if (selectedTab) {
      selectedTab.classList.add('active');
    }
    if (selectedButton) {
      selectedButton.classList.add('active');
    }

    if (tabId === 'expenses') {
      updateDisplayedMonth();
    } else if (tabId === 'graphs') {
      loadGraphs();
    }
  };

  useEffect(() => {
    // Initialize event listeners
    const initializeEventListeners = () => {
      console.log('Initializing event listeners...');

      // Month picker setup
      const monthPicker = document.getElementById('monthPicker') as HTMLInputElement;
      if (monthPicker) {
        const today = new Date();
        monthPicker.value = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}`;
        monthPicker.addEventListener('change', updateDisplayedMonth);
      }

      // Graph type selector setup
      const graphTypeSelect = document.getElementById('graphType') as HTMLSelectElement;
      if (graphTypeSelect) {
        graphTypeSelect.addEventListener('change', loadGraphs);
      }
    };

    initializeEventListeners();
    switchTab('expenses'); // Start with expenses tab

    // Cleanup function
    return () => {
      const monthPicker = document.getElementById('monthPicker');
      const graphTypeSelect = document.getElementById('graphType');
      
      if (monthPicker) {
        monthPicker.removeEventListener('change', updateDisplayedMonth);
      }
      if (graphTypeSelect) {
        graphTypeSelect.removeEventListener('change', loadGraphs);
      }
    };
  }, []); // Empty dependency array since we want this to run once on mount

  return (
    <div className="expense-tracker">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Monthly Spend</div>
          <div className="stat-value" id="monthlyTotal">$0.00</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Most Spent On</div>
          <div className="stat-value" id="topCategory">-</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Expenses</div>
          <div className="stat-value" id="expenseCount">0</div>
        </div>
      </div>

      <nav className="tabs">
        <button 
          className={`tab-button ${activeTabId === 'expenses' ? 'active' : ''}`}
          data-tab="expenses"
          onClick={() => switchTab('expenses')}
        >
          Expenses
        </button>
        <button 
          className={`tab-button ${activeTabId === 'graphs' ? 'active' : ''}`}
          data-tab="graphs"
          onClick={() => switchTab('graphs')}
        >
          Graphs
        </button>
        <button 
          className={`tab-button ${activeTabId === 'categories' ? 'active' : ''}`}
          data-tab="categories"
          onClick={() => switchTab('categories')}
        >
          Categories
        </button>
      </nav>

      <main>
        <div id="expenses" className={`tab-content ${activeTabId === 'expenses' ? 'active' : ''}`}>
          <form 
            id="expenseForm" 
            className="expense-form" 
            onSubmit={(e) => {
              e.preventDefault();
              addExpenseFromForm();
            }}
            ref={expenseFormRef}
          >
            <div className="form-inputs">
              <input type="date" id="expenseDate" name="date" required />
              <select id="expenseCategory" name="category" required>
                <option value="" disabled selected>Select Category</option>
                <option value="Groceries">Groceries</option>
                <option value="Rent">Rent</option>
                <option value="Insurance">Insurance</option>
                <option value="Dining Out">Dining Out</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Clothes">Clothes</option>
                <option value="Transportation">Transportation</option>
                <option value="Other">Other</option>
              </select>
              <input 
                type="number" 
                id="expenseAmount" 
                name="amount" 
                placeholder="Amount" 
                step="0.01" 
                required 
              />
              <button type="submit" id="addExpenseButton" className="add-expense-btn">
                Add Expense
              </button>
            </div>
          </form>

          <div className="month-selector">
            <label htmlFor="monthPicker">Select Month:</label>
            <input type="month" id="monthPicker" />
          </div>

          <div className="expense-list-container">
            <ul id="expenseList"></ul>
            <p id="total" className="total-amount"></p>
          </div>
        </div>

        <div id="graphs" className={`tab-content ${activeTabId === 'graphs' ? 'active' : ''}`}>
          <select id="graphType" className="graph-select">
            <option value="bar">Bar Chart</option>
            <option value="pie">Pie Chart</option>
            <option value="line">Line Chart</option>
          </select>
          <div id="graphContainer" ref={graphContainerRef} className="graph-container"></div>
        </div>

        <div id="categories" className={`tab-content ${activeTabId === 'categories' ? 'active' : ''}`}>
          <div className="categories-list">
            {/* Categories will be populated by JavaScript */}
          </div>
        </div>
      </main>
    </div>
  );
}
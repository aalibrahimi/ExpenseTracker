import csv
import os
import re
from datetime import datetime
import matplotlib.pyplot as plt
import sqlite3

multiTransaction = []
predefinedCategories = [] 

def initialize_db(): 
    connection = sqlite3.connect('expense_tracker.db')
    #cursor allows user to work with the sql queries
    cursor = connection.cursor()
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE
        )
        ''')
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT,
        description TEXT,
        amount REAL,
        category_id INTEGER,
        FOREIGN KEY (category_id) REFERENCES categories(id)
    )
    ''')
    #Commiting the save items into the database so info is not lost
    connection.commit()
    #Best practice to close the database for resource management
    connection.close()


# Add a transaction
def transy(date, description, amount, category):
    connection = sqlite3.connect('expense_tracker.db')
    cursor = connection.cursor()

     # Insert category if it doesn't exist
     # The ignore keyword ignores the category name if it already exists
    cursor.execute('INSERT OR IGNORE INTO categories (name) VALUES (?)', (category,))

    # Get the category ID
    # Since there is an id slot in the categories table
    # We can use that id and associate it with a certain category
    # The ? is the name of the category and that ? is stored
    # in the tuple category (category, ))
    # It is then fetched using the fetchone method and it will return the one value
    # which is the 0th index 
    cursor.execute('SELECT id FROM categories WHERE name = ?', (category,))
    category_id = cursor.fetchone()[0]

    # Insert the transaction
    # This allows us to insert our values for our four categories
    cursor.execute('INSERT INTO transactions (date, description, amount, category_id) VALUES (?, ?, ?, ?)', 
                   (date, description, amount, category_id))
    
    connection.commit()
    connection.close()

# Load information from the database
def loadInfo():
    #global acccesses the two list in the class
    global multiTransaction, predefinedCategories
    connection = sqlite3.connect('expense_tracker.db')
    cursor = connection.cursor()

    cursor.execute('SELECT name FROM categories')
    #this takes all categories that already exist and retrieves all the
    # rows from the query result
    # the row[0] is the category of the query row so that is fetched 
    # extend gets all the data so we dont have a nested structure
    predefinedCategories.extend([row[0] for row in cursor.fetchall()])

       # Load transactions
    cursor.execute('''
    SELECT t.date, t.description, t.amount, c.name
    FROM transactions t
    JOIN categories c ON t.category_id = c.id
    ''')
    rows = cursor.fetchall()
    multiTransaction = [{'date': row[0], 'description': row[1], 'amount': row[2], 'category': row[3]} for row in rows]
    connection.close()

# Function to get categories
def getCategories():
    connection = sqlite3.connect('expense_tracker.db')
    cursor = connection.cursor()
    cursor.execute('SELECT name FROM categories')
    categories = [row[0] for row in cursor.fetchall()]
    connection.close()
    return categories

# Function to compute spending by category
def spendingByCategories():
    connection = sqlite3.connect('expense_tracker.db')
    cursor = connection.cursor()
    cursor.execute('''
    SELECT c.name, SUM(t.amount)
    FROM transactions t
    JOIN categories c ON t.category_id = c.id
    GROUP BY c.name
    ''')
    categories = {row[0]: row[1] for row in cursor.fetchall()}
    connection.close()
    return categories

'''
def loadInfo():
    if os.path.exists(TRANSACTION_FILE):
        with open(TRANSACTION_FILE, mode='r') as file:
            reader = csv.reader(file)
            section = None
            for row in reader:
                if row and row[0].startswith("#"):
                    section = row[0]
                elif section == "# Categories":
                    if row:
                        predefinedCategories.append(row[0])
                elif section == "# Transactions":
                    if row[0] == 'date':  # Skip the header row
                        continue
                    if len(row) == 4:
                        try:
                            transaction = {
                                'date': row[0],
                                'description': row[1],
                                'amount': float(row[2]),
                                'category': row[3]
                            }
                            multiTransaction.append(transaction)
                        except ValueError as e:
                            print(f"Error processing row: {row}, {e}")
                    else:
                        print(f"Unexpected row format: {row}")
'''

# Function to format the date
def formatDate(date):
    # \d matches any digit (equivalent to [0-9])
    # {8} specifies exactly 8 occurrences of the preceding element (\d) 
    # if re.match(r"^\d{8}$", date):
    #     return f"{date[:2]}-{date[2:4]}-{date[4:]}"
    # else:
    #     return None
     try:
        return datetime.strptime(date, "%m%d%Y").strftime("%m/%d/%Y")
     except ValueError:
        return "incorrect value"

def validateAmount(amount):
    try:
        return float(amount)
    except ValueError:
        return None

'''def getCategories():
     transactionCategories = set(transaction['category'] for transaction in multiTransaction)
     allCategories = sorted(set(predefinedCategories + list(transactionCategories)))
     return allCategories
'''
'''
def spendingByCategories():
    categories = {}
    for transaction in multiTransaction:
        category = transaction['category']
        amount = float(transaction['amount'])
        categories[category] = categories.get(category, 0) + amount
    return categories  # Move this outside the loop
    '''
def plotSpending():
    categories = spendingByCategories()
    plt.figure(figsize=(10, 6))
    plt.bar(categories.keys(), categories.values())
    plt.title('Spending by Category')
    plt.xlabel('Category')
    plt.ylabel('Amount ($)')
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.show()

def main():
    initialize_db()
    loadInfo()
if __name__ == "__main__":
    main()
    while True:
        print("\nCredit Card Tracker Expense\n1. Add transaction\n2. View Transaction\n3. View Spending by Categories\n4. Plot Spending\n5. Exit")
        decision = input("Pick an option: ")
        if decision == '1':
            date = input("Enter date MMDDYYYY: ") 
            formatted_date = formatDate(date)

            description = input("What was this transaction for: ")
            amount = input("How much was the transaction?: ")
            # category = input("What category of spending is this under?: ")
            correctAmount = validateAmount(amount)

            if not formatted_date:
                print("Invalid date format. Please enter in MMDDYYYY format.")
                continue
            elif not correctAmount:
                print("you entered wrong input for price")
                continue
            print("Available catogories:", ", ". join(getCategories()))
            category = input("what category of spending is this under?: ")



            transy(formatted_date, description, correctAmount, category)
        elif decision == '2':
            display()

        # elif decision == '3':
        #     categories = spendingByCategories()
        #     for category, amount in categories.items():
        #         print(f"{category}: ${amount:.2f}")
        elif decision == '3':
            print("Debug: Entering option 3")  # Debug print
            categories = spendingByCategories()
            print(f"Debug: Categories returned: {categories}")  # Debug print
            if not categories:
                print("No spending data to display.")
            else:
                for category, amount in categories.items():
                    print(f"{category}: ${amount:.2f}")

        elif decision == '4':
            plotSpending()
        elif decision == '5':
            print("Exiting program see ya!")
            exit()
        else:
            print("invalid inputo!")
#python expensy.py  
# transy('222222', 'groceries', 20, 'food')
# display()
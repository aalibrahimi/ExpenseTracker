import csv
import os
import re
from datetime import datetime
import matplotlib.pyplot as lot

# FolderName = 'EXPENSETRACKER'
# TRANSACTION_FILE = os.path.join(FolderName, 'transaction.csv')
TRANSACTION_FILE = 'transaction.csv'
multiTransaction = []
predefinedCategories = []  #pulls category I added within the csv file
#empty list to keep track of our transactions

# if not os.path.exists(FolderName):
#     os.makedirs(FolderName)




#creating a function that contains a list for what to keep track of: amount, category, description, and date
def transy(date, description, amount, category):
    transaction = {
        'date' : date,
        'description' : description,
        'amount': amount,
        'category': category
    }

    multiTransaction.append(transaction)
    saveInfo()
#this function is so we could display our multiTransaction
def display():
    for transaction in multiTransaction:
        print(f"{transaction['date']}, Descritpion: {transaction['description']}, Amount: {transaction['amount']}, category: {transaction['category']} ")

def saveInfo():
    with open(TRANSACTION_FILE, mode='w', newline='') as file:
        writer = csv.writer(file)
        # Write the categories section
        writer.writerow(["# Categories"])
        for category in predefinedCategories:
            writer.writerow([category])
        # Write the transactions section
        writer.writerow(["# Transactions"])
        transaction_writer = csv.DictWriter(file, fieldnames=['date', 'description', 'amount', 'category'])
        transaction_writer.writeheader()  # This writes 'date,description,amount,category'
        for transaction in multiTransaction:
            transaction_writer.writerow(transaction)


# def loadInfo():
#     if os.path.exists(TRANSACTION_FILE):
#         #r = read-
#         with open(TRANSACTION_FILE, mode ='r') as file:
#             reader = csv.DictReader(file)
#             for row in reader:
#                 transaction = {
#                     'date': row['date'],
#                     'description': row['description'],
#                     'amount' : row['amount'],
#                     'category': row['category']
                        
#                 }
#                 multiTransaction.append(transaction)
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

def getCategories():
     transactionCategories = set(transaction['category'] for transaction in multiTransaction)
     allCategories = sorted(set(predefinedCategories + list(transactionCategories)))
     return allCategories

def spendingByCategories():
    categories = {}
    for transaction in multiTransaction:
        category = transaction['category']
        amount = float(transaction['amount'])
        categories[category] = categories.get(category, 0) + amount
    return categories  # Move this outside the loop
def plotSpending():
    categories = spendingByCategories()
    lot.figure(figsize=(10, 6))
    lot.bar(categories.keys(), categories.values())
    lot.title('Spending by Category')
    lot.xlabel('Category')
    lot.ylabel('Amount ($)')
    lot.xticks(rotation=45)
    lot.tight_layout()
    lot.show()

def main():
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
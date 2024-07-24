import csv
import os
import re


# FolderName = 'EXPENSETRACKER'
# TRANSACTION_FILE = os.path.join(FolderName, 'transaction.csv')
TRANSACTION_FILE = 'transaction.csv'
#empty list to keep track of our transactions

# if not os.path.exists(FolderName):
#     os.makedirs(FolderName)


multiTransaction = []

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
    with open(TRANSACTION_FILE, mode = 'w', newline='') as file:
        writer = csv.DictWriter(file, fieldnames=['date', 'description', 'amount', 'category'])
        writer.writeheader()
        writer.writerows(multiTransaction)

def loadInfo():
    if os.path.exists(TRANSACTION_FILE):
        #r = read-
        with open(TRANSACTION_FILE, mode ='r') as file:
            reader = csv.DictReader(file)
            for row in reader:
                transaction = {
                    'date': row['date'],
                    'description': row['description'],
                    'amount' : float(row['amount']),
                    'category': row['category']
                        
                }
                multiTransaction.append(transaction)

# Function to format the date
def formatDate(date):
    # \d matches any digit (equivalent to [0-9])
    # {8} specifies exactly 8 occurrences of the preceding element (\d) 
    if re.match(r"^\d{8}$", date):
        return f"{date[:2]}-{date[2:4]}-{date[4:]}"
    else:
        return None



def main():
    loadInfo()

if __name__ == "__main__":
    main()
    while True:
        print("\nCredit Card Tracker Expense\n1. Add transaction\n2. View Transaction\n3. Exit")

        decision = input("Pick an option: ")
        if decision == '1':
            date = input("Enter date DDMMYYYY: ") 
            formatted_date = formatDate(date)
            if not formatted_date:
                print("Invalid date format. Please enter in MMDDYYYY format.")
                continue

            description = input("What was this transaction for: ")
            amount = input("How much was the transaction?: ")
            category = input("What category of spending is this under?: ")

            transy(formatted_date, description, amount, category)
        elif decision == '2':
            display()
        elif decision == '3':
            print("Exiting program see ya!")
            exit()
        else:
            print("invalid inputo!")
#python expensy.py  
# transy('222222', 'groceries', 20, 'food')
# display()
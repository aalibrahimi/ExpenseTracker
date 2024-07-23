#empty list to keep trach of our transactions
transactions = []

def transy(date, description, amount, category):
    transaction = {
        'date' : date,
        'description' : description,
        'amount': amount,
        'category': category
    }

    transactions.append(transaction)

#this function is so we could display our transactions
def display():
    for transaction in transaction:
        print(f"{transaction['date']}, Descritpion: {transactions['description']}, Amount: {transactions['amount']}, category: {transactions['category']} ")

transy('222222', 'groceries', 20, 'food')
display()
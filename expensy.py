#empty list to keep track of our transactions
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
    for transaction in transactions:
        print(f"{transaction['date']}, Descritpion: {transaction['description']}, Amount: {transaction['amount']}, category: {transaction['category']} ")

transy('222222', 'groceries', 20, 'food')
display()
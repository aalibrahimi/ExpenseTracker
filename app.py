from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import json
from datetime import datetime

app = Flask(__name__)
CORS(app) # This is what allows our frontend to make request to this API

#In-memory storage for expenses (replace with database in production)
expenses = []

@app.route('/add_expense', methods=['POST'])
def add_expense():
    data = request.json
    expense = {
        'date': datetime.strptime(data['date'], '%Y-%m-%d'),
        'category': data['category'],
        'amount': float(data['amount'])
    }
    expenses.append(expense)
    return jsonify({'message': 'Expense added succcesfully'}), 201
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_expenses', methods=['GET'])
def get_expenses():
    month = int(request.args.get('month'))
    year = int(request.args.get('year'))
    monthly_expenses = [
        exp for exp in expenses
        if exp['date'].month == month and exp['date'].year == year
    ]
    return jsonify([
        {
            'date': exp['date'].strftime('%Y-%m-%d'),
            'category': exp['category'],
            'amount': exp['amount']
        } for exp in monthly_expenses
        
    ])

if __name__ == '__main__':
    app.run(debug=True, port=5001)
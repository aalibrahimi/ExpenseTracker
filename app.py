from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from datetime import datetime
from expensy import (transy, display, loadInfo, saveInfo, spendingByCategories, 
                     plotSpending, formatDate, validateAmount, getCategories, multiTransaction)
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import io
import base64
from flask import jsonify, request
from datetime import datetime
import traceback

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5001"}})

# Load existing transactions when the app starts
loadInfo()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/add_expense', methods=['POST'])
def add_expense():
    try:
        data = request.json
        if not data or 'date' not in data or 'category' not in data or 'amount' not in data:
            return jsonify({"error": "Missing required fields"}), 400

        date = datetime.strptime(data['date'], '%m-%d-%Y').strftime('%m-%d-%Y')
        category = data['category']
        amount = validateAmount(data['amount'])

        if amount is None:
            return jsonify({"error": "Invalid amount"}), 400

        transy(date, amount, category)
        saveInfo()
        return jsonify({'message': 'Expense added successfully'}), 201
    except ValueError as ve:
        return jsonify({"error": f"Invalid data format: {str(ve)}"}), 400
    except Exception as e:
        print(f"Error in add_expense: {str(e)}")  # Log the error
        return jsonify({"error": str(e)}), 500


@app.route('/get_expenses', methods=['GET'])
def get_expenses():
    try:
        month = request.args.get('month', type=int)
        year = request.args.get('year', type=int)
        
        print(f"Received request for expenses: month={month}, year={year}")  # Debug log
        
        if month is None or year is None:
            return jsonify({"error": "Month and year are required parameters"}), 400

        filtered_expenses = []
        for expense in multiTransaction:
            try:
                expense_date = datetime.strptime(expense['date'], '%m-%d-%Y')
                if expense_date.month == month and expense_date.year == year:
                    filtered_expenses.append(expense)
            except ValueError as ve:
                print(f"Error parsing date for expense: {expense}. Error: {str(ve)}")
                # Skip this expense and continue with the next one
                continue

        print(f"Filtered expenses: {filtered_expenses}")  # Debug log
        return jsonify(filtered_expenses)

    except Exception as e:
        error_message = f"An error occurred: {str(e)}\n{traceback.format_exc()}"
        print(error_message)  # Log the full error traceback
        return jsonify({"error": "An internal server error occurred. Please try again later."}), 500

@app.route('/get_categories', methods=['GET'])
def get_categories():
    return jsonify(getCategories())

@app.route('/spending_by_categories', methods=['GET'])
def spending_by_categories():
    categories = spendingByCategories()
    return jsonify(categories)

@app.route('/plot_spending', methods=['GET'])
def plot_spending():
    graph_type = request.args.get('type', 'bar')
    plot_data = plotSpending(graph_type)
    if plot_data:
        return jsonify({'plot': plot_data})
    else:
        return jsonify({'error': 'No data to plot'}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5001)
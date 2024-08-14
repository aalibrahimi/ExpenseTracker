from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import json
from datetime import datetime
from expensy import (transy, display, loadInfo, saveInfo, spendingByCategories, 
                     plotSpending, formatDate, validateAmount, getCategories, multiTransaction)
import io
import base64


app = Flask(__name__)
# CORS(app, resources={r"/*": {"origins": "*"}})
CORS(app, resources={r"/*": {"origins": "http://localhost:5001"}})
# CORS(app, resources={r"/*": {"origins": "http://localhost:YOUR_FRONTEND_PORT"}})

# Load existing transactions when the app starts
loadInfo()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/add_expense', methods=['POST'])
def add_expense():
    data = request.json
    date = formatDate(data['date'])
    amount = validateAmount(data['amount'])
    if date and amount is not None:
        transy(date, data['description'], amount, data['category'])
        saveInfo()
        return jsonify({'message': 'Expense added successfully'}), 201
    else:
        return jsonify({'message': 'Invalid date or amount'}), 400

@app.route('/get_expenses', methods=['GET'])
def get_expenses():
    # month = int(request.args.get('month'))
    # year = int(request.args.get('year'))
    # expenses = [exp for exp in multiTransaction 
    #             if datetime.strptime(exp['date'], '%m/%d/%Y').month == month 
    #             and datetime.strptime(exp['date'], '%m/%d/%Y').year == year]
    # return jsonify(expenses)
    return jsonify(multiTransaction)

@app.route('/get_categories', methods=['GET'])
def get_categories():
    return jsonify(getCategories())

@app.route('/spending_by_categories', methods=['GET'])
def spending_by_categories():
    return jsonify(spendingByCategories())

@app.route('/plot_spending', methods=['GET'])
def plot_spending():
    # graph_type = request.args.get('type', 'bar')
    # # Note: This won't work directly as plotSpending() shows a plot.
    # # You might need to save the plot as an image and return its URL,
    # # or use a JavaScript charting library on the frontend.
    # plotSpending(graph_type)
    # return jsonify({'message': 'Plot generated'}), 200
    graph_type = request.args.get('type', 'bar')
    plt_buffer = io.BytesIO()
    plot_spending(graph_type, plt_buffer)
    plot_data = base64.b64encode(plt_buffer.getvalue()).decode()
    return jsonify({'plot': plot_data})

if __name__ == '__main__':
    app.run(debug=True, port=5001)
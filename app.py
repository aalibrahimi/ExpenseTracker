from flask import Flask, request, jsonify, render_template, url_for, flash, redirect
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
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_login import LoginManager, UserMixin, login_user, current_user, logout_user, login_required
from flask_wtf import FlaskForm
from flask_migrate import Migrate
from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import DataRequired, Email, EqualTo, ValidationError
from flask_login import login_user, current_user, logout_user, login_required
import webbrowser
from config import SECRET_KEY, SQLALCHEMY_DATABASE_URI

app = Flask(__name__)

#config.py
app.config['SECRET_KEY'] = SECRET_KEY 
app.config['SQLALCHEMY_DATABASE_URI'] = SQLALCHEMY_DATABASE_URI


db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
migrate = Migrate(app, db)  # Initialize Flask-Migrate with your app and db
login_manager = LoginManager(app)
login_manager.login_view = 'login'

#First class is handling login through Sql
class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    email = db.Column(db.String(150), unique = True, nullable=False)
    password_hash = db.Column(db.Text, nullable=False)

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

#second Class is handling data tracking expense information
class Expense(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)  # This is correct
    category = db.Column(db.String(100), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)


# database for storing login and expenses now we have to create the registration and login functions
class RegistrationForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired()])
    email = StringField('Email', validators=[DataRequired(), Email()])
    password= PasswordField('Password', validators=[DataRequired()])    #PasswordFields keeps the password hidden
    confirm_password = PasswordField('Confirm Password', validators =[DataRequired(), EqualTo('password')])
    submit = SubmitField('Sign Up')

    def validate_username(self, username):
        user = User.query.filter_by(username=username.data).first()
        if user:
            raise ValidationError('That username is already Taken. Please Enter a different username')
    
    def validate_email(self, email):
        user = User.query.filter_by(email=email.data).first()
        if user:
            raise ValidationError('That email is already in use. Please Enter a different email')

class LoginForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired()])
    submit = SubmitField('Login')



#-----------------------------------------------------------------//--------------------------------------------------------------------------------------------------------------------
#ROUTES-----------------------------------------------------------------//--------------------------------------------------------------------------------------------------------------
#-----------------------------------------------------------------//--------------------------------------------------------------------------------------------------------------------
# Main routes
@app.route('/landing')
def landing():
    return render_template('landing.html')

@app.route('/index')
@login_required
def index():
    return render_template('index.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('landing'))
    form = RegistrationForm()
    if form.validate_on_submit():
        hashed_password = bcrypt.generate_password_hash(form.password.data).decode('utf-8')
        user = User(username=form.username.data, email=form.email.data, password_hash=hashed_password)
        db.session.add(user)
        db.session.commit()
        flash('Your account has been created! You can now log in.', 'success')
        return redirect(url_for('login'))
    return render_template('register.html', title='Register', form=form)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('landing'))
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data).first()
        if user and user.check_password(form.password.data):
            login_user(user)
            return redirect(url_for('landing'))
        else:
            flash('Login unsuccessful. Please check email and password.', 'danger')
    return render_template('login.html', title='Login', form=form)

@app.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('landing'))

@app.route('/')
def root():
    return redirect(url_for('landing'))

@app.route('/check_auth')
def check_auth():
    is_authenticated = current_user.is_authenticated
    return jsonify({'is_authenticated': is_authenticated})

# Expense-related routes
@app.route('/add_expense', methods=['POST'])
@login_required
def add_expense():
    try:
        data = request.json
        date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        category = data['category']
        amount = data['amount']

        new_expense = Expense(user_id=current_user.id, date=date, category=category, amount=amount)
        db.session.add(new_expense)
        db.session.commit()
        return jsonify({'message': 'Expense added successfully'}), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error in add_expense: {str(e)}")
        return jsonify({"error": "An internal error occurred."}), 500

@app.route('/get_expenses', methods=['GET'])
@login_required
def get_expenses():
    try:
        month = request.args.get('month', type=int)
        year = request.args.get('year', type=int)

        expenses = Expense.query.filter(
            db.extract('month', Expense.date) == month,
            db.extract('year', Expense.date) == year,
            Expense.user_id == current_user.id
        ).all()

        formatted_expenses = [
            {
                'date': expense.date.strftime('%m-%d-%Y'),
                'category': expense.category,
                'amount': float(expense.amount)
            } for expense in expenses
        ]

        return jsonify(formatted_expenses)
    except Exception as e:
        print(f"Error in get_expenses: {str(e)}")
        return jsonify({"error": "An internal server error occurred. Please try again later."}), 500

@app.route('/get_categories', methods=['GET'])
def get_categories():
    return jsonify(getCategories())

@app.route('/spending_by_categories', methods=['GET'])
@login_required
def spending_by_categories():
    try:
        spending_data = db.session.query(
            Expense.category,
            db.func.sum(Expense.amount).label('total')
        ).filter(Expense.user_id == current_user.id).group_by(Expense.category).all()

        categories = [item.category for item in spending_data]
        amounts = [float(item.total) for item in spending_data]

        return jsonify({
            'categories': categories,
            'amounts': amounts
        })
    except Exception as e:
        print(f"Error in spending_by_categories: {str(e)}")
        return jsonify({"error": "An internal server error occurred."}), 500

@app.route('/plot_spending', methods=['GET'])
@login_required
def plot_spending():
    try:
        spending_by_category = db.session.query(
            Expense.category,
            db.func.sum(Expense.amount).label('total')
        ).filter(Expense.user_id == current_user.id).group_by(Expense.category).all()

        if not spending_by_category:
            return jsonify({"error": "No spending data available"}), 404

        categories = [record.category for record in spending_by_category]
        amounts = [float(record.total) for record in spending_by_category]

        return jsonify({
            'categories': categories,
            'amounts': amounts,
            'graph_type': request.args.get('graph_type', 'bar')
        })
    except Exception as e:
        print(f"Error generating plot data: {str(e)}")
        return jsonify({"error": "An internal server error occurred."}), 500

if __name__ == '__main__':
    url = "http://localhost:5001"
    webbrowser.open(url)
    app.run(debug=True, port=5001)
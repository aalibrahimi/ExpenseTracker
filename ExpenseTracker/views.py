# views.py
from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.models import User
from django.db.models import Sum
from django.utils.dateparse import parse_date
from django.contrib import messages
from .models import Expense
from .forms import RegistrationForm, LoginForm

def root(request):
    return redirect("landing")

def landing(request):
    return render(request, "ExpenseTracker/landing.html")

@login_required
def index(request):
    return render(request, "ExpenseTracker/index.html")


def login_view(request):
    if request.user.is_authenticated:
        return redirect('index')
    return render(request, "ExpenseTracker/login.html", {
        'clerk_publishable_key': "pk_test_cmFwaWQtbWFybW90LTEzLmNsZXJrLmFjY291bnRzLmRldiQ"
    })

# def register_view(request):
#     if request.user.is_authenticated:
#         return redirect("index")
    
#     if request.method == "POST":
#         register_form = RegistrationForm(request.POST)
#         if register_form.is_valid():
#             username = register_form.cleaned_data["username"]
#             email = register_form.cleaned_data["email"]
#             password = register_form.cleaned_data["password"]
            
#             try:
#                 # Create the user
#                 user = User.objects.create_user(
#                     username=username,
#                     email=email,
#                     password=password
#                 )
#                 # Log the user in after registration
#                 login(request, user)
#                 messages.success(request, "Registration successful! Welcome!")
#                 return redirect("index")  # Redirect to index instead of login
#             except Exception as e:
#                 messages.error(request, f"Registration failed: {str(e)}")
#     else:
#         register_form = RegistrationForm()
    
#     return render(request, "ExpenseTracker/login.html", {
#         "register_form": register_form,
#         "show_registration": True
#     })

# def logout_view(request):
#     logout(request)
#     messages.info(request, "You have been logged out.")
#     return redirect("landing")

@login_required
def add_expense(request):
    if request.method == "POST":
        try:
            print("Received expense data:", request.POST)  # Debug print
            date = request.POST.get("date")
            category = request.POST.get("category")
            amount = request.POST.get("amount")

            if not all([date, category, amount]):
                return JsonResponse({"error": "Missing required fields"}, status=400)

            expense = Expense.objects.create(
                user=request.user,
                date=date,
                category=category,
                amount=amount
            )
            print("Created expense:", expense)  # Debug print
            return JsonResponse({"message": "Expense added successfully"}, status=201)
        except Exception as e:
            print("Error adding expense:", str(e))  # Debug print
            return JsonResponse({"error": str(e)}, status=500)
    
    return JsonResponse({"error": "Invalid request method"}, status=405)

@login_required
def get_expenses(request):
    try:
        month = int(request.GET.get("month"))
        year = int(request.GET.get("year"))
        
        expenses = Expense.objects.filter(
            user=request.user,
            date__year=year,
            date__month=month
        ).order_by('date')
        
        formatted_expenses = [{
            "date": expense.date.strftime("%Y-%m-%d"),
            "category": expense.category,
            "amount": float(expense.amount)
        } for expense in expenses]
        
        return JsonResponse(formatted_expenses, safe=False)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@login_required
def spending_by_categories(request):
    try:
        spending_data = Expense.objects.filter(
            user=request.user
        ).values("category").annotate(
            total=Sum("amount")
        ).order_by('-total')
        
        categories = [data["category"] for data in spending_data]
        amounts = [float(data["total"]) for data in spending_data]
        
        return JsonResponse({
            "categories": categories,
            "amounts": amounts
        })
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@login_required
def plot_spending(request):
    try:
        spending_data = Expense.objects.filter(
            user=request.user
        ).values("category").annotate(
            total=Sum("amount")
        ).order_by('-total')
        
        categories = [data["category"] for data in spending_data]
        amounts = [float(data["total"]) for data in spending_data]
        
        return JsonResponse({
            "categories": categories,
            "amounts": amounts,
            "graph_type": request.GET.get("graph_type", "bar")
        })
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
from django.urls import path
from . import views

urlpatterns = [
    path("", views.root, name="root"),
    path("landing/", views.landing, name="landing"),
    path("index/", views.index, name="index"),
    path("login/", views.login_view, name="login"),
    path("logout/", views.logout_view, name="logout"),  # Add this
    path("register/", views.login_view, name="register"),  # This will redirect to login with Clerk
    path("add-expense/", views.add_expense, name="add_expense"),
    path("get-expenses/", views.get_expenses, name="get_expenses"),
    path("spending-by-categories/", views.spending_by_categories, name="spending_by_categories"),
    path("plot-spending/", views.plot_spending, name="plot_spending"),
]
from django.db import models
from django.contrib.auth.models import User

class Expense(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)  # Link to the Django User model
    date = models.DateField()  # Date of the expense
    category = models.CharField(max_length=100)  # Category of the expense
    amount = models.DecimalField(max_digits=10, decimal_places=2)  # Amount of the expense

    def __str__(self):
        return f"{self.category} - {self.amount}"

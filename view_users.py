from app import app, db, User

# Push the application context
with app.app_context():
    # Perform the query within the application context
    users = User.query.all()

    # Loop through the users and print their details
    for user in users:
        print(f"ID: {user.id}, Username: {user.username}, Email: {user.email}")

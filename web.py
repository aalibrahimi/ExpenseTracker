import webbrowser
import threading
import signal
from waitress import serve
import sys
from flask import Flask, render_template, request

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/submit', methods=['POST'])
def submit():
    name = request.form['name']
    return f'Hello, {name}!'

# add a 'stop' button to stop server from running without having to close terminal
# Work on styling when possible bc base element of code is done


# ---

def open_browser():
    url = "http://127.0.0.1:5000/"
    webbrowser.open(url)

def run_flask_app():
    serve(app, host='127.0.0.1', port=5000)

def signal_handler(sig, frame):
    print('Shutting down gracefully...')
    sys.exit(0)


if __name__ == '__main__':
    # Register the signal handler for graceful shutdown
    signal.signal(signal.SIGINT, signal_handler)

    # # Start the Flask server in a new thread and ensure it stays alive
    server_thread = threading.Thread(target=run_flask_app, daemon=True)
    server_thread.start()

    # Open the browser after a short delay
    threading.Timer(2, open_browser).start()

    # Keep the main thread alive to let the server thread run
    server_thread.join()
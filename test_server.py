from flask import Flask, send_file
import os

app = Flask(__name__)

@app.route('/')
def home():
    return send_file('index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    try:
        return send_file(filename)
    except:
        return f"File not found: {filename}", 404

if __name__ == '__main__':
    print("=" * 60)
    print("TEST SERVER RUNNING")
    print("Open: http://localhost:5000")
    print("=" * 60)
    app.run(debug=True, port=5000)

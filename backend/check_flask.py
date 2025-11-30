try:
    import flask
    with open('flask_status.txt', 'w') as f:
        f.write('Flask is installed')
except ImportError:
    with open('flask_status.txt', 'w') as f:
        f.write('Flask is NOT installed')

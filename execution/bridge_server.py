from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import subprocess
import os
import sys

app = Flask(__name__, static_folder='../web')
CORS(app)

# Root directory of the project
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(app.static_folder, path)

@app.route('/api/execute', methods=['POST'])
def execute_command():
    data = request.json
    command = data.get('command')
    
    if not command:
        return jsonify({'error': 'No command provided'}), 400
    
    # Safety check: Only allow python commands for now to prevent total system takeover
    # but allow them to run from execution/
    if not command.startswith('python '):
        return jsonify({'error': 'Only python commands are allowed for safety.'}), 403

    try:
        # Execute the command from the project root
        result = subprocess.run(
            command,
            shell=True,
            cwd=PROJECT_ROOT,
            capture_output=True,
            text=True,
            timeout=30
        )
        
        return jsonify({
            'stdout': result.stdout,
            'stderr': result.stderr,
            'exit_code': result.returncode
        })
    except subprocess.TimeoutExpired:
        return jsonify({'error': 'Command timed out'}), 504
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Run on port 8080 to match existing setup
    app.run(host='0.0.0.0', port=8080, debug=True)

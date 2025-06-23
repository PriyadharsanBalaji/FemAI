import os
import json
import logging
from flask import Flask, render_template, request, Response, stream_template
from fea_solver import FEASolver
import time
import re

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Create the app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key")

def extract_number(s):
    """Extract first valid float number from string `s`."""
    if not s or not isinstance(s, str):
        return None
    
    
    cleaned = re.sub(r'[^\d\.\-\+\se]', '', s.strip())
    
    # Try to find a number in various formats
    patterns = [
        r"[-+]?\d*\.\d+",  # Decimal numbers
        r"[-+]?\d+\.\d*",  # Numbers ending with decimal
        r"[-+]?\d+",       # Integers
        r"\d+\.?\d*e[-+]?\d+"  # Scientific notation
    ]
    
    for pattern in patterns:
        match = re.search(pattern, cleaned)
        if match:
            try:
                return float(match.group())
            except (ValueError, AttributeError):
                continue
    
    return None

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/solve', methods=['POST'])
def solve_problem():
    try:
       
        if request.is_json:
            data = request.get_json()
            problem = data.get('problem', '').strip() if data else ''
        else:
            problem = request.form.get('problem', '').strip()
            
        if not problem:
            return json.dumps({'error': 'Problem description is required'})

        
        fea_solver = FEASolver()
        
        
        final_result = fea_solver.solve(problem)
        
       
        response_gem = final_result.get("response_gem", "")
        
        
        num_value = extract_number(response_gem)
        
        
        result = {
            'status': 'complete',
            'gemini_response': response_gem,
            'numerical_value': round(num_value, 5) if num_value else None
        }
        
        return json.dumps(result)
        
    except Exception as e:
        logging.error(f"Error processing problem: {str(e)}")
        return json.dumps({'error': f'An error occurred: {str(e)}'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

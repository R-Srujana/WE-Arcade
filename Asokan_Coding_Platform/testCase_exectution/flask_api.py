import subprocess
import os
import tempfile
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
import traceback

app = Flask(__name__)
CORS(app)

# MongoDB setup
client = MongoClient("mongodb://localhost:27017/")
db = client["coding_platform"]
questions_collection = db["questions"]

# Add a test route for the root URL
@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Flask API is running!"})

# Add a test route to check if the server is alive
@app.route("/ping", methods=["GET"])
def ping():
    return jsonify({"status": "alive"})

# Function to execute user code
def execute_code(code, language, test_cases):
    file_ext = {"python": ".py", "c": ".c", "cpp": ".cpp", "java": ".java"}
    compile_cmd = None
    run_cmd = None
    temp_dir = tempfile.mkdtemp()

    if language not in file_ext:
        return {"error": "Unsupported language"}

    filename = os.path.join(temp_dir, "Main" + file_ext[language])

    try:
        # Save code to a temporary file
        with open(filename, "w") as f:
            f.write(code)

        # Set up compilation and run commands based on language
        if language == "python":
            run_cmd = ["python3", filename]
        elif language == "c":
            compile_cmd = ["gcc", filename, "-o", os.path.join(temp_dir, "a.out")]
            run_cmd = [os.path.join(temp_dir, "a.out")]
        elif language == "cpp":
            compile_cmd = ["g++", filename, "-o", os.path.join(temp_dir, "a.out")]
            run_cmd = [os.path.join(temp_dir, "a.out")]
        elif language == "java":
            compile_cmd = ["javac", filename]
            run_cmd = ["java", "-cp", temp_dir, "Main"]

        # Compile if needed
        if compile_cmd:
            compile_result = subprocess.run(compile_cmd, capture_output=True, text=True)
            if compile_result.returncode != 0:
                return {
                    "error": "Compilation failed",
                    "details": compile_result.stderr,
                    "passed": 0,
                    "failed": 0,
                    "test_results": []
                }

        results = {
            "passed": 0,
            "failed": 0,
            "test_results": [],
            "total_tests": len(test_cases),
            "remaining_passed": 0,  # For remaining test cases
            "remaining_failed": 0   # For remaining test cases
        }

        # Run all test cases
        for index, test in enumerate(test_cases):
            try:
                input_data = str(test["input"]).strip() + '\n'
                expected_output = str(test["expected_output"]).strip()

                result = subprocess.run(
                    run_cmd,
                    input=input_data,
                    capture_output=True,
                    text=True,
                    timeout=5,
                    encoding='utf-8'
                )
                
                # Extract the last line of output (ignoring prompts)
                actual_output = result.stdout.strip().split('\n')[-1].strip()

                # Format normalization
                def normalize_output(output):
                    # Remove any trailing/leading whitespace
                    output = output.strip()
                    # Remove common prompt texts
                    output = output.replace("Enter a number:", "").strip()
                    output = output.replace("Enter a number: ", "").strip()
                    # Try converting to number if possible
                    try:
                        # Try integer first
                        return str(int(output))
                    except ValueError:
                        try:
                            # Try float if integer fails
                            return str(float(output))
                        except ValueError:
                            # If not a number, return as string
                            return output

                normalized_actual = normalize_output(actual_output)
                normalized_expected = normalize_output(expected_output)
                
                # Compare normalized outputs
                status = "passed" if normalized_actual == normalized_expected else "failed"
                
                # For first 3 test cases
                if index < 3:
                    if status == "passed":
                        results["passed"] += 1
                    else:
                        results["failed"] += 1
                    
                    test_result = {
                        "input": test["input"],
                        "expected": expected_output,
                        "actual": actual_output,
                        "status": status,
                        "error": result.stderr if result.stderr else None
                    }
                    results["test_results"].append(test_result)
                # For remaining test cases
                else:
                    if status == "passed":
                        results["remaining_passed"] += 1
                    else:
                        results["remaining_failed"] += 1

            except subprocess.TimeoutExpired:
                if index < 3:
                    results["failed"] += 1
                    test_result = {
                        "input": test["input"],
                        "expected": expected_output,
                        "actual": "Timeout Error",
                        "status": "failed",
                        "error": "Code execution timed out"
                    }
                    results["test_results"].append(test_result)
                else:
                    results["remaining_failed"] += 1

        return results

    except Exception as e:
        return {"error": str(e), "details": traceback.format_exc()}

# API route to submit code
@app.route("/submit_code", methods=["POST"])
def submit_code():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        print("Received data:", data)  # Debug log

        question_id = data.get("question_id")
        code = data.get("code")
        language = data.get("language")

        if not all([question_id, code, language]):
            return jsonify({"error": "Missing required fields"}), 400

        # Handle both string and ObjectId formats
        try:
            if isinstance(question_id, str):
                if not ObjectId.is_valid(question_id):
                    # If it's not a valid ObjectId, try finding by numeric ID
                    question = questions_collection.find_one({"id": int(question_id)})
                else:
                    # If it's a valid ObjectId string, convert and find
                    object_id = ObjectId(question_id)
                    question = questions_collection.find_one({"_id": object_id})
            else:
                # If it's already an ObjectId or other format
                question = questions_collection.find_one({"_id": question_id})
        except Exception as e:
            print(f"Error processing question ID: {str(e)}")
            return jsonify({"error": f"Invalid question ID: {question_id}"}), 400

        if not question:
            return jsonify({"error": f"Question not found with ID: {question_id}"}), 404

        # Get test cases (handle both possible keys)
        test_cases = question.get("testCases") or question.get("test_cases")
        if not test_cases:
            return jsonify({"error": "No test cases found for this question"}), 404

        # Format test cases
        formatted_test_cases = []
        for test in test_cases:
            formatted_test = {
                "input": str(test.get("input", "")),
                "expected_output": str(test.get("output", ""))
            }
            formatted_test_cases.append(formatted_test)

        result = execute_code(code, language, formatted_test_cases)
        return jsonify(result)

    except Exception as e:
        print(f"Error in submit_code: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    # Run on port 5001 to avoid conflict with your React dev server
    app.run(host='0.0.0.0', port=5001, debug=True)

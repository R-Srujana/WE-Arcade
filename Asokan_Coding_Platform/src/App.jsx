import React, { useState, useEffect, useRef } from "react";
import AceEditor from "react-ace";
import Select from "react-select";
import axios from "axios";
import SquidGame from "../../frontend/src/Components/Squid_game/squid_game.jsx";

// Import Ace editor modes
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/mode-csharp";
import "ace-builds/src-noconflict/mode-ruby";
import "ace-builds/src-noconflict/mode-php";
import "ace-builds/src-noconflict/mode-golang";
import "ace-builds/src-noconflict/mode-typescript";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/theme-github";

const languages = [
  { value: "python", label: "Python", template: "def solution():\n    # Write your code here\n    pass\n" },
  { value: "javascript", label: "JavaScript", template: "function solution() {\n    // Write your code here\n}\n" },
  { value: "java", label: "Java", template: "import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}\n" },
  { value: "csharp", label: "C#", template: "using System;\n\npublic class Solution {\n    public static void Main() {\n        // Write your code here\n    }\n}\n" },
  { value: "ruby", label: "Ruby", template: "def solution\n    # Write your code here\nend\n" },
  { value: "php", label: "PHP", template: "<?php\nfunction solution() {\n    // Write your code here\n}\n?>\n" },
  { value: "golang", label: "Go", template: "package main\n\nimport \"fmt\"\n\nfunc solution() {\n    // Write your code here\n}\n\nfunc main() {\n    solution()\n}\n" },
  { value: "typescript", label: "TypeScript", template: "function solution(): void {\n    // Write your code here\n}\n" },
];

// Add a constant for the API URL
const FLASK_API_URL = "http://localhost:5001";

function App() {
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);
  const [code, setCode] = useState(languages[0].template);
  const [output, setOutput] = useState("");
  const [question, setQuestion] = useState(null);
  const [theme, setTheme] = useState("monokai");
  const [showSubmission, setShowSubmission] = useState(false);
  const [autoStartGame, setAutoStartGame] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [codeOutput, setCodeOutput] = useState("");
  const [testResults, setTestResults] = useState(null);
  const [isSubmission, setIsSubmission] = useState(false);
  const [buttonsDisabled, setButtonsDisabled] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const squidGameRef = useRef(null);

  useEffect(() => {
    fetchQuestion();
  }, []);

  const fetchQuestion = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get("http://localhost:5000/api/questions/random");
      console.log("API Response:", response.data); // Debug log
      setQuestion(response.data);
    } catch (error) {
      console.error("Error fetching question:", error);
      setError("Failed to fetch question. Please make sure the backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleNextQuestion = () => {
    fetchQuestion();
    setCode(selectedLanguage.template);
    setOutput("");
    setShowSubmission(false);
    setAutoStartGame(false);
    setTestResults(null);
    setButtonsDisabled(false);
    setGameCompleted(false);
  };

  const handleLanguageChange = (selected) => {
    setSelectedLanguage(selected);
    setCode(selected.template);
    // Reset states when language changes
    setTestResults(null);
    setOutput("");
  };

  const handleRunCode = async () => {
    try {
      setIsSubmission(false);
      setTestResults(null);
      setOutput("Running code...");
      
      const response = await axios.post(`${FLASK_API_URL}/submit_code`, {
        question_id: question._id,
        code: code,
        language: selectedLanguage.value
      });

      if (response.data.error) {
        setOutput(`Error: ${response.data.error}\n${response.data.details || ''}`);
        setTestResults(null);
      } else {
        // Display only first 3 test cases results
        let outputText = "Test Results (First 3 Cases):\n\n";
        
        response.data.test_results.forEach((test, index) => {
          outputText += `Test Case ${index + 1}:\n`;
          outputText += `Input: ${test.input}\n`;
          outputText += `Expected Output: ${test.expected}\n`;
          outputText += `Your Output: ${test.actual}\n`;
          outputText += `Status: ${test.status.toUpperCase()}\n`;
          if (test.error) {
            outputText += `Error: ${test.error}\n`;
          }
          outputText += "\n";
        });

        // Add summary for first 3 cases
        outputText += `\nSummary (First 3 Cases):\n`;
        outputText += `Passed: ${response.data.passed} tests\n`;
        outputText += `Failed: ${response.data.failed} tests\n`;
        
        setOutput(outputText);
        setTestResults(response.data.test_results);
        setShowSubmission(false);
      }
    } catch (error) {
      console.error("Error running code:", error);
      setOutput(`Error: ${error.message}`);
      setTestResults(null);
    }
  };

  const handleGameComplete = () => {
    setGameCompleted(true);
    setButtonsDisabled(true);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmission(true);
      setOutput("Submitting code...");
      setButtonsDisabled(true);
      
      const response = await axios.post(`${FLASK_API_URL}/submit_code`, {
        question_id: question._id,
        code: code,
        language: selectedLanguage.value
      });

      if (response.data.error) {
        setOutput(`Error: ${response.data.error}\n${response.data.details || ''}`);
        setShowSubmission(false);
        setButtonsDisabled(false);
      } else {
        let outputText = `Submission Results (Remaining Cases):\n\n`;
        outputText += `Passed: ${response.data.remaining_passed} tests\n`;
        outputText += `Failed: ${response.data.remaining_failed} tests\n`;
        
        setOutput(outputText);
        setShowSubmission(true);
        setAutoStartGame(true);
      }
    } catch (error) {
      console.error("Error submitting code:", error);
      setOutput(`Error: ${error.message}`);
      setShowSubmission(false);
      setButtonsDisabled(false);
    }
  };

  const TestCaseTable = ({ results }) => {
    if (!results || results.length === 0) return null;
    
    return (
      <table style={styles.testTable}>
        <thead>
          <tr>
            <th>Test Case</th>
            <th>Input</th>
            <th>Expected Output</th>
            <th>Your Output</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{result.input}</td>
              <td>{result.expected}</td>
              <td>{result.actual}</td>
              <td style={{
                color: result.status === 'passed' ? '#4CAF50' : '#f44336',
                fontWeight: 'bold'
              }}>
                {result.status.toUpperCase()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.leftPanel}>
        {!showSubmission ? (
          <>
            {/* Question display */}
            {loading ? (
              <div style={styles.loading}>Loading question...</div>
            ) : error ? (
              <div style={styles.error}>{error}</div>
            ) : question ? (
              <div style={styles.questionContainer}>
                <h2>{question.title}</h2>
                <p>{question.description}</p>
                {question.testCases && (
                  <div style={styles.testCases}>
                    <h3>Sample Test Cases:</h3>
                    <ul>
                      {question.testCases.slice(0, 3).map((testCase, index) => (
                        <li key={index}>
                          Input: {testCase.input} → Output: {testCase.output}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div style={styles.error}>No question available</div>
            )}
          </>
        ) : (
          <SquidGame 
            ref={squidGameRef}
            autoStart={autoStartGame} 
            onGameComplete={handleGameComplete}
          />
        )}
      </div>

      <div style={styles.rightPanel}>
        <div style={styles.compilerHeader}>
          <Select
            value={selectedLanguage}
            onChange={handleLanguageChange}
            options={languages}
            styles={selectStyles}
            isDisabled={buttonsDisabled}
          />
          <button
            style={{ 
              ...styles.button, 
              backgroundColor: "#4CAF50",
              opacity: buttonsDisabled ? 0.5 : 1
            }}
            onClick={handleRunCode}
            disabled={buttonsDisabled}
          >
            Run Code
          </button>
          <button
            style={{ 
              ...styles.button, 
              backgroundColor: "#2196F3",
              opacity: buttonsDisabled ? 0.5 : 1
            }}
            onClick={handleSubmit}
            disabled={buttonsDisabled}
          >
            Submit
          </button>
          <button
            style={{ 
              ...styles.button, 
              backgroundColor: "#FF9800",
              opacity: (buttonsDisabled && !gameCompleted) ? 0.5 : 1
            }}
            onClick={handleNextQuestion}
            disabled={buttonsDisabled && !gameCompleted}
          >
            Next Question
          </button>
        </div>

        <div style={styles.compilerContainer}>
          <div style={styles.editorContainer}>
            <AceEditor
              mode={selectedLanguage.value}
              theme={theme}
              onChange={setCode}
              name="code-editor"
              width="100%"
              height="400px"
              fontSize={14}
              showPrintMargin={false}
              showGutter={true}
              highlightActiveLine={true}
              value={code}
              setOptions={{
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: true,
                enableSnippets: true,
                showLineNumbers: true,
                tabSize: 2,
              }}
            />
          </div>
          <div style={styles.outputContainer}>
            <h3 style={styles.outputTitle}>Output:</h3>
            <div style={styles.outputBox}>
              <pre style={styles.outputText}>{output}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    padding: "10px",
    gap: "20px",
    overflow: "hidden",
  },
  leftPanel: {
    flex: "1",
    padding: "20px",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    overflowY: "auto", // Allow scroll if content is long
  },
  questionContainer: {
    marginBottom: "20px",
  },
  testCases: {
    marginTop: "20px",
    padding: "15px",
    backgroundColor: "#fff",
    borderRadius: "4px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  rightPanel: {
    flex: "1",
    display: "flex",
    flexDirection: "column",
    maxHeight: "100vh",
    overflow: "hidden",
  },
  compilerHeader: {
    display: "flex",
    gap: "10px",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: "8px", 
  },
  compilerContainer: {
    flex: "1",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    overflow: "hidden",
  },
  editorContainer: {
    height: "400px",
    overflow: "hidden",
  },
  button: {
    padding: "8px 12px",
    fontSize: "14px",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  outputContainer: {
    flex: "1",
    minHeight: "200px",
    maxHeight: "calc(100vh - 500px)",
    overflow: "auto",
  },
  outputTitle: {
    fontSize: "16px",
    fontWeight: "bold",
    marginBottom: "5px",
  },
  outputBox: {
    backgroundColor: "#f5f5f5",
    borderRadius: "8px",
    padding: "10px",
    height: "100%",
    overflowY: "auto",
    fontFamily: "monospace",
  },
  outputText: {
    margin: 0,
    whiteSpace: "pre-wrap",
    fontSize: "14px",
    color: "#333",
  },
  submissionContainer: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    overflow: "hidden",
  },
  error: {
    padding: "20px",
    backgroundColor: "#ffebee",
    color: "#c62828",
    borderRadius: "8px",
    marginBottom: "20px",
  },
  loading: {
    padding: "20px",
    color: "#666",
    textAlign: "center",
  },
  testTable: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: '#fff',
    borderRadius: '4px',
    overflow: 'hidden',
    fontSize: '14px',
  },
  'th, td': {
    border: '1px solid #ddd',
    padding: '8px',
    textAlign: 'left',
  },
  th: {
    backgroundColor: '#f5f5f5',
    fontWeight: 'bold',
  },
  tr: {
    '&:nth-child(even)': {
      backgroundColor: '#f9f9f9',
    },
    '&:hover': {
      backgroundColor: '#f5f5f5',
    },
  },
  testTableContainer: {
    marginTop: "10px",
    backgroundColor: "#fff",
    padding: "10px",
    borderRadius: "4px",
    border: "1px solid #ddd"
  }
};

const selectStyles = {
  container: (base) => ({
    ...base,
    width: "150px",
  }),
  control: (base) => ({
    ...base,
    fontSize: "12px",
  }),
  menu: (base) => ({
    ...base,
    fontSize: "12px",
  }),
};

export default App;


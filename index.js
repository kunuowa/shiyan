const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2'); // Import MySQL library
require('dotenv').config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MySQL Database Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Alena2017.', // Ensure this is correct
  database: 'psy_evaluation_system', // Ensure this matches the database in peb.sql
});

const fetchTestResults = () => {
    axios
      .get(`http://localhost:5000/api/results/${subjectId}/${currentQuestionnaire.questionnaireId}`)
      .then((res) => {
        setTestResults(res.data); // Store the results in state
      })
      .catch((err) => {
        console.error('Error fetching test results:', err);
        setError('Failed to fetch test results. Please try again.');
      });
  };

  const submitResponses = () => {
    if (!Object.keys(responses).length) {
      alert('Please answer the questions before submitting.');
      return;
    }
  
    setLoading(true);
    axios
      .post('http://localhost:5000/api/responses', {
        subjectId,
        questionnaireId: currentQuestionnaire.questionnaireId,
        responses,
      })
      .then(() => {
        alert('Responses submitted successfully!');
        fetchTestResults(); // Fetch and display the results
        setCurrentQuestionnaire(null);
        setResponses({});
        setQuestions([]);
        setError('');
      })
      .catch((err) => {
        console.error('Error submitting responses:', err);
        alert('Failed to submit responses. Please try again.');
      })
      .finally(() => setLoading(false));
  };
  

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.message);
    process.exit(1); // Exit if connection fails
  } else {
    console.log('Connected to MySQL database');
  }
});

// Basic Test Route
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// --- CRUD Endpoints ---

// Get all questionnaires
app.get('/api/questionnaires', (req, res) => {
  const sql = 'SELECT * FROM questionnaires';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching questionnaires:', err.message);
      res.status(500).json({ error: 'Failed to fetch questionnaires' });
    } else {
      res.json(results);
    }
  });
});

// Add a new questionnaire
app.post('/api/questionnaires', (req, res) => {
  const { title, category } = req.body;
  if (!title || !category) {
    return res.status(400).json({ error: 'Title and category are required' });
  }

  const sql = 'INSERT INTO questionnaires (title, category) VALUES (?, ?)';
  db.query(sql, [title, category], (err, result) => {
    if (err) {
      console.error('Error adding questionnaire:', err.message);
      res.status(500).json({ error: 'Failed to add questionnaire' });
    } else {
      res.status(201).json({ id: result.insertId, title, category });
    }
  });
});

// Fetch all questions
app.get('/api/questions', (req, res) => {
  const sql = `
    SELECT q.question_id, q.questionnaire_id, q.question_text, a.answer_text, a.score 
    FROM questions q
    LEFT JOIN answers a ON q.question_id = a.question_id
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching questions:', err.message);
      res.status(500).json({ error: 'Failed to fetch questions' });
    } else {
      // Group questions with their answers
      const questionsMap = {};
      results.forEach((row) => {
        const { question_id, questionnaire_id, question_text, answer_text, score } = row;
        if (!questionsMap[question_id]) {
          questionsMap[question_id] = {
            question_id,
            questionnaire_id,
            question_text,
            answers: [],
          };
        }
        if (answer_text) {
          questionsMap[question_id].answers.push({ text: answer_text, score });
        }
      });
      res.json(Object.values(questionsMap));
    }
  });
});

// Add a new question with answers
app.post('/api/questions', (req, res) => {
    const { questionnaireId, text: questionText, answers } = req.body;
  
    // Validate the payload
    if (!questionnaireId || !questionText || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        error: 'Invalid request. Ensure "questionnaireId", "text", and "answers" are provided, and "answers" is a non-empty array.',
      });
    }
  
    console.log('Received payload:', req.body); // Debugging log
  
    // Insert the question into the database
    const questionSql = 'INSERT INTO questions (questionnaire_id, question_text) VALUES (?, ?)';
    db.query(questionSql, [questionnaireId, questionText], (err, questionResult) => {
      if (err) {
        console.error('Error adding question:', err.message);
        return res.status(500).json({ error: 'Failed to add question' });
      }
  
      const questionId = questionResult.insertId;
      const answerValues = answers.map((answer) => [questionId, answer.text, answer.score]);
  
      // Insert the answers into the database
      const answerSql = 'INSERT INTO answers (question_id, answer_text, score) VALUES ?';
      db.query(answerSql, [answerValues], (answerErr) => {
        if (answerErr) {
          console.error('Error adding answers:', answerErr.message);
          return res.status(500).json({ error: 'Failed to add answers' });
        }
  
        res.status(201).json({ message: 'Question and answers added successfully' });
      });
    });
  });
  

// Delete a questionnaire
app.delete('/api/questionnaires/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM questionnaires WHERE id = ?';
  db.query(sql, [id], (err) => {
    if (err) {
      console.error('Error deleting questionnaire:', err.message);
      res.status(500).json({ error: 'Failed to delete questionnaire' });
    } else {
      res.json({ message: 'Questionnaire deleted successfully' });
    }
  });
});

// Delete a question
app.delete('/api/questions/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM questions WHERE question_id = ?';
  db.query(sql, [id], (err) => {
    if (err) {
      console.error('Error deleting question:', err.message);
      res.status(500).json({ error: 'Failed to delete question' });
    } else {
      res.json({ message: 'Question deleted successfully' });
    }
  });
});

// Get all subjects
app.get('/api/subjects', (req, res) => {
    const sql = 'SELECT * FROM subjects'; // Assuming there's a 'subjects' table in your database
    db.query(sql, (err, results) => {
      if (err) {
        console.error('Error fetching subjects:', err.message);
        res.status(500).json({ error: 'Failed to fetch subjects' });
      } else {
        res.json(results);
      }
    });
  });

  // Add a new subject
app.post('/api/subjects', (req, res) => {
    const { name, age, gender, contact } = req.body;
    if (!name || !age || !gender || !contact) {
      return res.status(400).json({ error: 'Name, age, gender, and contact are required' });
    }
  
    const sql = 'INSERT INTO subjects (name, age, gender, contact) VALUES (?, ?, ?, ?)';
    db.query(sql, [name, age, gender, contact], (err, result) => {
      if (err) {
        console.error('Error adding subject:', err.message);
        res.status(500).json({ error: 'Failed to add subject' });
      } else {
        res.status(201).json({ id: result.insertId, name, age, gender, contact });
      }
    });
  });
 
  // Assign a questionnaire to a subject
app.post('/api/assignments', (req, res) => {
    const { subjectId, questionnaireId } = req.body;
    if (!subjectId || !questionnaireId) {
      return res.status(400).json({ error: 'Subject ID and Questionnaire ID are required' });
    }
  
    const sql = 'INSERT INTO assignments (subject_id, questionnaire_id) VALUES (?, ?)';
    db.query(sql, [subjectId, questionnaireId], (err, result) => {
      if (err) {
        console.error('Error assigning questionnaire:', err.message);
        res.status(500).json({ error: 'Failed to assign questionnaire' });
      } else {
        res.status(201).json({ id: result.insertId, subjectId, questionnaireId });
      }
    });
  });

  // Get all reports
app.get('/api/reports', (req, res) => {
    const sql = `
      SELECT a.id AS assignment_id, s.name AS subject_name, q.title AS questionnaire_title,
        r.total_score, r.factor_scores, r.conclusion
      FROM reports r
      JOIN assignments a ON a.id = r.assignment_id
      JOIN subjects s ON s.id = a.subject_id
      JOIN questionnaires q ON q.id = a.questionnaire_id
    `;
    db.query(sql, (err, results) => {
      if (err) {
        console.error('Error fetching reports:', err.message);
        res.status(500).json({ error: 'Failed to fetch reports' });
      } else {
        res.json(results);
      }
    });
  });

  // Add a new report after the test is completed
app.post('/api/reports', (req, res) => {
    const { assignmentId, totalScore, factorScores, conclusion } = req.body;
    if (!assignmentId || !totalScore || !factorScores || !conclusion) {
      return res.status(400).json({ error: 'Assignment ID, total score, factor scores, and conclusion are required' });
    }
  
    const sql = 'INSERT INTO reports (assignment_id, total_score, factor_scores, conclusion) VALUES (?, ?, ?, ?)';
    db.query(sql, [assignmentId, totalScore, JSON.stringify(factorScores), conclusion], (err, result) => {
      if (err) {
        console.error('Error generating report:', err.message);
        res.status(500).json({ error: 'Failed to generate report' });
      } else {
        res.status(201).json({ id: result.insertId, assignmentId, totalScore, factorScores, conclusion });
      }
    });
  });

// Get a specific test result by subjectId and questionnaireId
app.get('/api/results/:subjectId/:questionnaireId', (req, res) => {
    const { subjectId, questionnaireId } = req.params;
  
    const sql = `
      SELECT r.total_score, r.factor_scores, r.conclusion
      FROM reports r
      JOIN assignments a ON a.id = r.assignment_id
      WHERE a.subject_id = ? AND a.questionnaire_id = ?
    `;
  
    db.query(sql, [subjectId, questionnaireId], (err, results) => {
      if (err) {
        console.error('Error fetching test results:', err.message);
        return res.status(500).json({ error: 'Failed to fetch test results' });
      }
  
      if (results.length === 0) {
        return res.status(404).json({ error: 'No results found for this test' });
      }

      // Example function to calculate total score based on answers (simplified logic)
        const calculateTotalScore = (answers) => {
        return answers.reduce((total, answer) => total + answer.score, 0);
     };
  
  
      const report = results[0];
      res.json({
        totalScore: report.total_score,
        factorScores: JSON.parse(report.factor_scores),
        conclusion: report.conclusion
      });
    });
  });

  // Get all assignments for a specific subject
app.get('/api/assignments/:subjectId', (req, res) => {
    const { subjectId } = req.params;
  
    const sql = `
      SELECT a.id, q.title AS questionnaireTitle, q.id AS questionnaireId
      FROM assignments a
      JOIN questionnaires q ON a.questionnaire_id = q.id
      WHERE a.subject_id = ?
    `;
  
    db.query(sql, [subjectId], (err, results) => {
      if (err) {
        console.error('Error fetching assignments:', err.message);
        res.status(500).json({ error: 'Failed to load assignments' });
      } else {
        res.json(results);
      }
    });
  });

// Fetch questions for a specific questionnaire
app.get('/api/questionnaires/:questionnaireId/questions', (req, res) => {
    const { questionnaireId } = req.params;
  
    const sql = `
      SELECT q.question_id AS id, q.question_text AS text, a.answer_text AS answer, a.score
      FROM questions q
      LEFT JOIN answers a ON q.question_id = a.question_id
      WHERE q.questionnaire_id = ?
    `;
  
    db.query(sql, [questionnaireId], (err, results) => {
      if (err) {
        console.error('Error fetching questions:', err.message);
        res.status(500).json({ error: 'Failed to fetch questions' });
      } else {
        // Format questions with their answers
        const questionsMap = {};
        results.forEach((row) => {
          const { id, text, answer, score } = row;
          if (!questionsMap[id]) {
            questionsMap[id] = { id, text, answers: [] };
          }
          if (answer) {
            questionsMap[id].answers.push({ text: answer, score });
          }
        });
  
        res.json(Object.values(questionsMap));
      }
    });
  });
  

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

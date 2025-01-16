-- Create the database if it does not exist
CREATE DATABASE IF NOT EXISTS psy_evaluation_system;

-- Use the database
USE psy_evaluation_system;

-- Table: Subjects - Stores information about the subjects (test-takers)
CREATE TABLE IF NOT EXISTS subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    gender ENUM('Male', 'Female') NOT NULL,
    age INT NOT NULL,
    contact VARCHAR(20) UNIQUE -- Ensures unique contact numbers
);

-- Table: Questionnaires - Stores tests and their categories
CREATE TABLE IF NOT EXISTS questionnaires (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL
);

-- Table: Assignments - Links subjects with questionnaires
CREATE TABLE IF NOT EXISTS assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject_id INT NOT NULL,
    questionnaire_id INT NOT NULL,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (questionnaire_id) REFERENCES questionnaires(id) ON DELETE CASCADE
);

-- Table: Questions - Stores questions for each questionnaire
CREATE TABLE IF NOT EXISTS questions (
    question_id INT AUTO_INCREMENT PRIMARY KEY,
    questionnaire_id INT NOT NULL,
    question_text TEXT NOT NULL,
    FOREIGN KEY (questionnaire_id) REFERENCES questionnaires(id) ON DELETE CASCADE
);

-- Table: Answers - Stores multiple-choice answers for each question
CREATE TABLE IF NOT EXISTS answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT NOT NULL,
    answer_text VARCHAR(255) NOT NULL,
    score INT NOT NULL,
    FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE
);

-- Table: Responses - Stores subject responses to questions
CREATE TABLE IF NOT EXISTS responses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject_id INT NOT NULL,
    questionnaire_id INT NOT NULL,
    question_id INT NOT NULL,
    answer TEXT NOT NULL,
    score INT NOT NULL,  -- Tracks the score for the chosen answer
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (questionnaire_id) REFERENCES questionnaires(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE
);

-- Table: Reports - Stores generated reports for each subject's completed questionnaire
CREATE TABLE IF NOT EXISTS reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    assignment_id INT NOT NULL,  -- Reference to the assignment
    total_score INT NOT NULL,    -- Overall score of the test
    factor_scores JSON NOT NULL, -- A JSON column to store factor scores (e.g., mood, anxiety, etc.)
    conclusion TEXT NOT NULL,    -- A textual conclusion (e.g., "Moderate anxiety detected")
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE
);

-- Insert sample data into the Questionnaires table
INSERT INTO questionnaires (title, category) VALUES 
    ('Depression Test', 'Mental Health'),
    ('Anxiety Test', 'Mental Health'),
    ('Stress Test', 'Mental Health');

-- Insert sample data into the Subjects table
INSERT INTO subjects (name, gender, age, contact) VALUES
    ('John Doe', 'Male', 30, '123-456-7890'),
    ('Jane Smith', 'Female', 25, '987-654-3210');

-- Insert sample data into the Questions table
INSERT INTO questions (questionnaire_id, question_text) VALUES 
    (1, 'How are you feeling today?'),
    (1, 'Rate your mood on a scale of 1-10.'),
    (1, 'Have you been feeling anxious recently?'),
    (2, 'Do you often feel nervous or on edge?'),
    (2, 'Do you find it hard to relax?'),
    (3, 'Do you experience difficulty sleeping due to stress?'),
    (3, 'How do you usually cope with stress?');

-- Insert sample data into the Answers table
INSERT INTO answers (question_id, answer_text, score) VALUES
    (1, 'Great', 3),
    (1, 'Good', 2),
    (1, 'Okay', 1),
    (1, 'Bad', 0),
    (2, '1', 1),
    (2, '5', 5),
    (2, '10', 10),
    (3, 'Yes', 2),
    (3, 'No', 0),
    (4, 'Often', 3),
    (4, 'Sometimes', 2),
    (4, 'Rarely', 1),
    (5, 'Easily', 2),
    (5, 'With Difficulty', 0),
    (6, 'Exercise', 2),
    (6, 'Talk to Someone', 3),
    (6, 'Other', 1);

-- Insert sample data into the Assignments table
INSERT INTO assignments (subject_id, questionnaire_id) VALUES
    (1, 1),  -- John Doe is assigned the Depression Test
    (1, 2),  -- John Doe is assigned the Anxiety Test
    (2, 3);  -- Jane Smith is assigned the Stress Test

-- Insert sample data into the Responses table
INSERT INTO responses (subject_id, questionnaire_id, question_id, answer, score) VALUES
    (1, 1, 1, 'Great', 3),
    (1, 1, 2, '5', 5),
    (1, 1, 3, 'Yes', 2),
    (1, 2, 4, 'Often', 3),
    (1, 2, 5, 'Easily', 2),
    (2, 3, 6, 'Exercise', 2),
    (2, 3, 7, 'Other', 1);

-- Insert sample data into the Reports table
INSERT INTO reports (assignment_id, total_score, factor_scores, conclusion) VALUES
    (1, 45, '{"mood": 15, "anxiety": 20, "sleep": 10}', 'Moderate depression detected'),
    (2, 30, '{"mood": 10, "anxiety": 15, "sleep": 5}', 'Mild anxiety detected');

-- Create indexes to improve query performance
CREATE INDEX idx_subject_questionnaire ON responses (subject_id, questionnaire_id);
CREATE INDEX idx_subject_questionnaire_assignments ON assignments (subject_id, questionnaire_id);

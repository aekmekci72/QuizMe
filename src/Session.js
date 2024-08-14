import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';

function QuestionsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { questions: initialQuestions, notes } = location.state;
  const [questions, setQuestions] = useState(initialQuestions);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitAnswer = () => {
    const currentQuestion = questions[currentQuestionIndex];
    setLoading(true);
    setIsSubmitting(true);

    fetch('https://quizme-j6kd.onrender.com/get_feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userAnswer, question: currentQuestion, notes }),
    })
      .then((response) => response.json())
      .then((data) => {
        setLoading(false);
        setIsSubmitting(false);
        if (data) {
          setFeedback(data);
          setUserAnswer('');

        } else {
          setFeedback('No feedback received.');
          setUserAnswer('');

        }
      })
      .catch((error) => {
        console.error('Error:', error);
        setLoading(false);
        setFeedback('Failed to get feedback.');
      });

  };

  const handleMarkCorrect = () => {
    const remainingQuestions = questions.filter((_, index) => index !== currentQuestionIndex);
    setQuestions(remainingQuestions);
    if (remainingQuestions.length === 0) {
      setShowConfetti(true);
    }
    setFeedback('');
  };

  const handleMarkIncorrect = () => {
    const currentQuestion = questions[currentQuestionIndex];
    const updatedQuestions = [...questions.slice(1), currentQuestion];

    setQuestions(updatedQuestions);
    setFeedback('');
  };

  const handleRedoQuestions = () => {
    setQuestions(initialQuestions);
    setShowConfetti(false);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="questions-container">
      {questions.length > 0 && (
        <div className="question-card">
          <p>{questions[currentQuestionIndex]}</p>
          {!feedback && (
            <>
              <textarea
                className="answer-input"
                placeholder="Type your answer here..."
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                disabled={isSubmitting}
              />
              <button className="submit-answer-button" onClick={handleSubmitAnswer} disabled={isSubmitting}>
                Submit Answer
              </button>
            </>
          )}
        </div>
      )}
      {loading && (
        <div className="loading-card">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Generating feedback...</p>
          </div>
        </div>
      )}
      {feedback && !loading && (
        <div className="feedback-card">
          <p>{feedback}</p>
          <div className="feedback-buttons">
            <button className="mark-correct-button" onClick={handleMarkCorrect}>
              Next
            </button>
            <button className="mark-incorrect-button" onClick={handleMarkIncorrect}>
              Review Later
            </button>
          </div>
        </div>
      )}
      {showConfetti && (
        <div className="congratulations-card">
          <Confetti />
          <h2>Great Job!</h2>
          <p>All questions completed.</p>
          <div className="congratulations-buttons">
            <button className="go-home-button" onClick={handleGoHome}>
              Study New Notes
            </button>
            <button className="redo-questions-button" onClick={handleRedoQuestions}>
              Review Questions
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuestionsPage;
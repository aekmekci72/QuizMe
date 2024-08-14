import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const [notes, setNotes] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('https://quizme-j6kd.onrender.com/increment_counter')
      .then(response => response.text())
      .then(data => {
      })
      .catch(error => {
        console.error('Error fetching visit count:', error);
      });
  }, []);

  useEffect(() => {
    const aboutSection = document.querySelector('.about-section');
    let lastScrollTop = 0;

    const handleScroll = () => {
      const sectionTop = aboutSection.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;
      const currentScrollTop = window.scrollY;

      // Check if scrolling down
      if (currentScrollTop > lastScrollTop) {
        if (sectionTop < windowHeight - 100) {
          aboutSection.classList.add('visible');
        }
      } else {
        // Check if scrolling up
        if (sectionTop > windowHeight - 100) {
          aboutSection.classList.remove('visible');
        }
      }
      lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop; // For Mobile or negative scrolling
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleStartSession = () => {
    const num = (Math.max(numQuestions,5));
    fetch('https://quizme-j6kd.onrender.com/get_questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ notes,  num}),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          navigate('/session', { state: { questions: data, notes } });
        } else {
          alert('No questions found.');
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        alert('Failed to fetch questions.');
      });
  };

  return (
    <div>
      <div className="home-container">
        <header className="app-header">
          <h1>QuizMe</h1>
          <p>Your AI companion for test readiness and confidence</p>
        </header>
        <div className="chatbot-container">
          <textarea
            className="notes-input"
            placeholder="Enter your notes here..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <div className="control-panel">
            <input
              type="number"
              className="num-questions-input"
              min="1"
              value={numQuestions}
              onChange={(e) => setNumQuestions(e.target.value)}
              placeholder="Number of Questions"
            />
            <button className="start-session-button" onClick={handleStartSession} >
              Start Test Prep Session
            </button>
          </div>
        </div>
      </div>
      <div className="about-container">
        <div className="about-section">
          <h2>About</h2>
          <p>QuizMe is an educational platform designed to enhance your test preparation experience by leveraging artificial intelligence. Developed with Mistral AI, QuizMe generates personalized questions and provides insightful feedback based on your study materials. The goal is to empower learners by ensuring they achieve competency and confidence in their subject areas.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Home;
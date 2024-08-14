import React, { useState } from 'react';
import ReactDOM from 'react-dom';

import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import './App.css';
import Home from './App';
import Session from './Session';
import reportWebVitals from './reportWebVitals';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/session" element={<Session />} />
        
      </Routes>
    </Router>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

reportWebVitals();

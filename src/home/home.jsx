import React, { useState, useEffect } from 'react';
import './home.css'; // use for emoji background and overrides
import { getAuth, signOut } from 'firebase/auth';
import { app } from '../config/config';
import { useNavigate } from 'react-router-dom';



export default function Home() {
  const auth = getAuth(app);
  const user = auth.currentUser?.email || 'Unknown';
  const navigate = useNavigate();


  const [selectedCard, setSelectedCard] = useState(null);
  const [expense, setExpense] = useState({
    title: '',
    amount: '',
    category: '',
    date: ''
  });
  useEffect(() => {
    const EMOJIS = ["💶", "💴", "💵", "💷", "💰", "💸", "🪙", "💳"];
    const container = document.querySelector(".emoji-bg");
    if (!container) return;
  
    container.innerHTML = ""; // Clear previous emojis
  
    for (let i = 0; i < 30; i++) {
      const emoji = document.createElement("div");
      emoji.className = "emoji";
      emoji.innerText = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
  
      emoji.style.position = "absolute";
      emoji.style.top = `${Math.random() * 100}%`;
      emoji.style.left = `${Math.random() * 100}%`;
      emoji.style.fontSize = `${2 + Math.random() * 3}rem`;
      emoji.style.opacity = "0.08";
      emoji.style.userSelect = "none";
      emoji.style.transform = `rotate(${Math.random() * 360}deg)`;
      emoji.style.pointerEvents = "none";
      container.appendChild(emoji);
    }
  }, []);

  const handleLogout = () => {
    signOut(auth).then(() => console.log('Signed out')).catch(console.error);
  };

  return (
    <div className="home-container">
    <div className="emoji-bg"></div>

    <h1>Welcome to the Dashboard</h1>
    <p>You are logged in as: <strong>{user}</strong></p>

    <div className="card-container">
      <div className="option-card" onClick={() => navigate('/add-expense')}>➕ Add Expense</div>
      <div className="option-card" onClick={() => navigate('/view-expenses')}>📊 View Expenses</div>
      <div className="option-card" onClick={() => navigate('/edit-expenses')}>✏️ Edit Expenses</div>
    </div>

    <button className="logout-button" onClick={handleLogout}>Logout</button>
  </div>
);
}


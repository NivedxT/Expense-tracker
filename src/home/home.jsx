import React, { useState, useEffect } from 'react';
import './home.css';
import { getAuth, signOut } from 'firebase/auth';
import { app } from '../config/config';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';

export default function Home() {
  const auth = getAuth(app);
  const user = auth.currentUser?.email || 'Unknown';
  const navigate = useNavigate();

  const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: '#fff',
    padding: theme.spacing(4),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    borderRadius: '20px',
    boxShadow: theme.shadows[3],
    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
    cursor: 'pointer',
    fontSize: '1.3rem', // Larger text
    fontWeight: 'bold',  // Bolder text
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: theme.shadows[8],
    },
    ...theme.applyStyles && theme.applyStyles('dark', {
      backgroundColor: '#1A2027',
    }),
  }));

  useEffect(() => {
    const EMOJIS = ["💶", "💴", "💵", "💷", "💰", "💸", "🪙", "💳"];
    const container = document.querySelector(".emoji-bg");
    if (!container) return;

    container.innerHTML = "";

    for (let i = 0; i < 40; i++) {
      const emoji = document.createElement("div");
      emoji.className = "emoji";
      emoji.innerText = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
      emoji.style.position = "absolute";
      emoji.style.top = `${Math.random() * 100}%`;
      emoji.style.left = `${Math.random() * 100}%`;
      emoji.style.fontSize = `${2 + Math.random() * 2}rem`;
      emoji.style.opacity = "0.38";
      emoji.style.userSelect = "none";
      emoji.style.transform = `rotate(${Math.random() * 360}deg)`;
      emoji.style.animationDuration = `${Math.random() * 10 + 5}s`;
      emoji.style.animationDelay = `${Math.random() * 5}s`;
      container.appendChild(emoji);
    }
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error.message);
    }
  };

  return (
    <Box sx={{ flexGrow: 1, padding: 3, textAlign: 'center', position: 'relative', minHeight: '100vh' }}>
      <div className="emoji-bg"></div>

      <Box sx={{ position: 'relative', zIndex: 1, padding: 2 }}>
        <h1>Welcome to the Dashboard</h1>
        <p sx={{ marginBottom: '40px' }}>You are logged in as: <strong>{user}</strong></p>

        <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }} justifyContent="center"
              sx={{ marginTop: '40px' }}>
          <Grid item xs={8} sm={4} md={4}>
            <Item onClick={() => navigate('/add-expense')}>
              ➕ Add Expense
            </Item>
          </Grid>
          <Grid item xs={8} sm={4} md={4}>
            <Item onClick={() => navigate('/view-expenses')}>
              📊 View Expenses
            </Item>
          </Grid>
          <Grid item xs={8} sm={4} md={4}>
            <Item onClick={() => navigate('/manage-categories')}>
              📂 Manage Categories
            </Item>
          </Grid>
          {/* NEW: Analytics Card */}
          <Grid item xs={8} sm={4} md={4}>
            <Item onClick={() => navigate('/analytics')}>
              📈 Analytics
            </Item>
          </Grid>
        </Grid>
        <button className="logout-button" onClick={handleLogout}>Logout</button>
      </Box>
    </Box>
  );
}
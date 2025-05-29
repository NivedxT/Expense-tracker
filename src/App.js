import './App.css';
import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './login/login';
import Home from './home/home';
import AddExpense from './components/AddExpense';
import ViewExpenses from './components/ViewExpenses';
import EditExpenses from './components/EditExpenses';
import { onAuthStateChanged } from 'firebase/auth'; // Only need onAuthStateChanged for App.js
import { auth } from './config/config';
import ManageCategories from './components/ManageCategories';
import Analytics from './components/Analytics'; // Import the new Analytics component


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Changed to camelCase

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    });
  }, [auth]);


  return (
    <div>
      <Routes>
        {isLoggedIn ? (
          <>
            <Route path="/" element={<Home />} /> {/* Home as default logged-in route */}
            <Route path="/home" element={<Home />} /> {/* Explicit home route */}
            <Route path="/add-expense" element={<AddExpense />} />
            <Route path="/view-expenses" element={<ViewExpenses />} />
            <Route path="/edit/:id" element={<EditExpenses />} />
            <Route path="/manage-categories" element={<ManageCategories />} />
            <Route path="/analytics" element={<Analytics />} /> {/* NEW: Analytics Route */}
          </>
        ) : (
          <Route path="/" element={<Login />} /> // Login as default logged-out route
        )}
      </Routes>
    </div>
  );
}

export default App;
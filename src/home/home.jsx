// src/home/Home.jsx
import React, { useState } from 'react';
import './home.css';
import { useLocation } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { app } from '../config/config';

export default function Home() {
    const auth = getAuth(app); // ✅ Define auth here
    const user = auth.currentUser?.email || 'Unknown';
    
    const [expense, setExpense] = useState({
        title: '',
        amount: '',
        category: '',
        date: ''
      });
    const [expenseList, setExpenseList] = useState([]); // ⬅ Store expenses here
      
    const handleChange = (e) => {
        setExpense({
          ...expense,
          [e.target.name]: e.target.value
        });
      };
      
      
    const handleAddExpense = (e) => {
        e.preventDefault();
      
        // 🆕 Load existing expenses from localStorage
        const existingExpenses = JSON.parse(localStorage.getItem('expenses')) || [];
      
        // 🆕 Add the new expense with a timestamp
        const updatedExpenses = [...existingExpenses, { ...expense, timestamp: new Date() }];
      
        // 🆕 Save back to localStorage
        localStorage.setItem('expenses', JSON.stringify(updatedExpenses));
      
        console.log("Expense saved locally:", expense);
      
        // 🆕 Reset form input
        setExpense({
          title: '',
          amount: '',
          category: '',
          date: ''
        });
      
        // 🆕 (Optional) Reload from localStorage if needed later
        const savedExpenses = JSON.parse(localStorage.getItem('expenses')) || [];
    };
      

    const handleLogout = () => {
    signOut(auth).then(() => {
      console.log('User signed out');
      // Optionally, redirect to login or homepage
    }).catch((error) => {
      console.error('Sign out error', error);
    });
  };

  return (
    <div className="home-container">
      <h1>Welcome to the Dashboard</h1>
      <p className="login-message">You are logged in as: <strong>{getAuth(app).currentUser.email}</strong></p>

      <div className="dashboard-options">
        <form onSubmit={handleAddExpense} className="expense-form">
          <input type="text" name="title" placeholder="Title" onChange={handleChange} required />
          <input type="number" name="amount" placeholder="Amount" onChange={handleChange} required />
          <select name="category" onChange={handleChange} required>
  <option value="">Select Category</option>
  <option value="Food & Drinks">🍔 Food & Drinks</option>
  <option value="Fuel">⛽ Fuel</option>
  <option value="Groceries">🛒 Groceries</option>
  <option value="Commute">🚌 Commute</option>
  <option value="Utility Bills">💡 Utility Bills</option>
  <option value="Fitness">🏋️ Fitness</option>
  <option value="Medical">💊 Medical</option>
  <option value="Money Transfers">💸 Money Transfers</option>
  <option value="Rent">🏠 Rent</option>
  <option value="ATM Withdrawal">🏧 ATM Withdrawal</option>
  <option value="Shopping">🛍️ Shopping</option>
  <option value="Others">📝 Others</option>
</select>
          <input type="date" name="date" onChange={handleChange} required />
          <button type="submit">Add Expense</button>
        </form>
      </div>
      
      <div className="logout-button-container">
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}

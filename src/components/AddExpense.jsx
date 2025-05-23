import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddExpense.css';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../config/config';

export default function AddExpense() {
  const navigate = useNavigate();
  const [expense, setExpense] = useState({
    title: '',
    amount: '',
    category: '',
    date: ''
  });

  useEffect(() => {
    const EMOJIS = ["➕","💸"];
    const container = document.querySelector(".emoji-bg");
    if (!container) return;

    container.innerHTML = "";

    for (let i = 0; i < 30; i++) {
      const emoji = document.createElement("div");
      emoji.className = "emoji";
      emoji.innerText = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];

      emoji.style.position = "absolute";
      emoji.style.top = `${Math.random() * 100}%`;
      emoji.style.left = `${Math.random() * 100}%`;
      emoji.style.fontSize = `${2 + Math.random() * 3}rem`;
      emoji.style.opacity = "0.06";
      emoji.style.userSelect = "none";
      emoji.style.transform = `rotate(${Math.random() * 360}deg)`;
      emoji.style.pointerEvents = "none";
      container.appendChild(emoji);
    }
  }, []);

  const handleChange = (e) => {
    setExpense({ ...expense, [e.target.name]: e.target.value });
  };

  const handleAddExpense = async(e) => {
    e.preventDefault();
console.log(expense);

   await addDoc(collection(db, 'expenses'), {
      title: expense.title,
      amount: parseFloat(expense.amount),
      category: expense.category,
      date: expense.date
    });
    alert('Expense added to Firestore!');
    setExpense({
      title: '',
        amount: '',
        category: '',
        date: ''
    });
   // or redirect to ViewExpenses
};

  return (
    <div className="add-expense-container">
      <div className="emoji-bg"></div>
      <h2 className="elegant-heading">➕ Add New Expense</h2>
      <form onSubmit={handleAddExpense} className="expense-form">
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={expense.title}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="amount"
          placeholder="Amount"
          value={expense.amount}
          onChange={handleChange}
          required
        />
        <select
          name="category"
          value={expense.category}
          onChange={handleChange}
          required
        >
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
        <input
          type="date"
          name="date"
          value={expense.date}
          onChange={handleChange}
          required
        />
        <button type="submit">Add Expense</button>
      </form>
    </div>
  );
}

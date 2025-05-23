import React, { useEffect, useState } from 'react';
import './ViewExpenses.css';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../config/config'; // Make sure these are correctly exported

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a29bfe', '#fd79a8', '#e17055', '#fab1a0'];

export default function ViewExpenses() {
  const [expenses, setExpenses] = useState([]);
  const [filteredCategory, setFilteredCategory] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const expensesCollection = collection(db, 'expenses',);
        const snapshot = await getDocs(expensesCollection);
        const fetchedExpenses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setExpenses(fetchedExpenses);
      } catch (error) {
        console.error("Error fetching expenses from Firestore:", error);
      }
    };

    fetchExpenses();
    generateFloatingEmojis();
  }, []);

  const generateFloatingEmojis = () => {
    const EMOJIS = ['💶', '🔎', '💵', '👀'];
    const container = document.querySelector('.emoji-bg');
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
      emoji.style.opacity = "0.08";
      emoji.style.userSelect = "none";
      emoji.style.transform = `rotate(${Math.random() * 360}deg)`;
      emoji.style.pointerEvents = "none";
      container.appendChild(emoji);
    }
  };

  const filteredExpenses = expenses.filter(exp => {
    const matchesCategory = !filteredCategory || exp.category === filteredCategory;
    const matchesFromDate = !fromDate || new Date(exp.date) >= new Date(fromDate);
    const matchesToDate = !toDate || new Date(exp.date) <= new Date(toDate);
    return matchesCategory && matchesFromDate && matchesToDate;
  });

  const categoryTotals = filteredExpenses.reduce((acc, expense) => {
    const category = expense.category || 'Uncategorized';
    acc[category] = (acc[category] || 0) + parseFloat(expense.amount);
    return acc;
  }, {});

  const pieData = Object.entries(categoryTotals).map(([name, value]) => ({ name, value }));

  return (
   
<div className="view-expenses-wrapper p-4">
    <div>
    <div className="">
<h2 className="p-4">📊 Expense Breakdown</h2>
</div>
    </div>
   
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie dataKey="value" data={pieData} cx="50%" cy="50%" outerRadius={80} label>
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>

    <div className="filter-bar">
      <select
        className="filter-dropdown"
        value={filteredCategory}
        onChange={e => setFilteredCategory(e.target.value)}
      >
        <option value="">All Categories</option>
        {[...new Set(expenses.map(e => e.category))].map((cat, idx) => (
          <option key={idx} value={cat}>{cat}</option>
        ))}
      </select>

      <input type="date" className="filter-date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
      <input type="date" className="filter-date" value={toDate} onChange={e => setToDate(e.target.value)} />
    </div>

    <div className="expense-table-section">
      {filteredExpenses.length === 0 ? (
        <p>No expenses found.</p>
      ) : (
        <table className="expense-table">
          <thead>
            <tr>
              <th>Title 👀</th>
              <th>Amount 💰</th>
              <th>Category</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.map((expense, index) => (
              <tr key={index}>
                <td>{expense.title}</td>
                <td>₹{expense.amount}</td>
                <td>{expense.category}</td>
                <td>{new Date(expense.date).toLocaleDateString()}</td>
                <td>
                  {/* Delete logic for Firestore can be added later */}
                  <Link to={`/edit-expense/${expense.id}`}>
                    <button className="edit-button">✏️</button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  </div>
    
    
  );
}

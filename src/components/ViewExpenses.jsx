import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { db, auth } from '../config/config';
import { collection, getDocs, query, where, doc, deleteDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './ViewExpenses.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A18CFF'];

const ViewExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const navigate = useNavigate();

  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

  const handleDelete = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this expense?");
    if (!confirm) return;

    try {
      await deleteDoc(doc(db, "expenses", id));
      alert("Expense deleted successfully!");
      setExpenses((prev) => prev.filter((exp) => exp.id !== id));
    } catch (error) {
      console.error("Error deleting expense:", error);
      alert("Failed to delete expense. Please try again.");
    }
  };

  useEffect(() => {
    const fetchExpenses = async () => {
      const q = query(collection(db, "expenses"), where("uid", "==", auth.currentUser.uid));
      const querySnapshot = await getDocs(q);
      const expensesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setExpenses(expensesData);
      setFilteredExpenses(expensesData);

      const uniqueCategories = [...new Set(expensesData.map(exp => exp.category))];
      setCategories(uniqueCategories);
    };

    fetchExpenses();
  }, []);

  useEffect(() => {
    const EMOJIS = ['💸', '📉', '🧾', '📊'];
    const container = document.querySelector('.emoji-bg');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < 60; i++) {
      const emoji = document.createElement('div');
      emoji.className = 'emoji';
      emoji.innerText = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
      emoji.style.top = `${Math.random() * 100}%`;
      emoji.style.left = `${Math.random() * 100}%`;
      emoji.style.fontSize = `${2 + Math.random() * 2}rem`;
      emoji.style.opacity = '0.66';
      emoji.style.position = 'absolute';
      emoji.style.userSelect = 'none';
      emoji.style.pointerEvents = 'none';
      emoji.style.transform = `rotate(${Math.random() * 360}deg)`;
      container.appendChild(emoji);
    }
  }, []);

  useEffect(() => {
    let filtered = [...expenses];
    if (selectedCategory) {
      filtered = filtered.filter(exp => exp.category === selectedCategory);
    }
    if (startDate) {
      filtered = filtered.filter(exp => new Date(exp.date) >= new Date(startDate));
    }
    if (endDate) {
      filtered = filtered.filter(exp => new Date(exp.date) <= new Date(endDate));
    }
    setFilteredExpenses(filtered);
  }, [selectedCategory, startDate, endDate, expenses]);

  const data = Object.values(filteredExpenses.reduce((acc, exp) => {
    acc[exp.category] = acc[exp.category] || { name: exp.category, value: 0 };
    acc[exp.category].value += Number(exp.amount);
    return acc;
  }, {}));

  const handleOpenLink = (data) => {
    window.open(data.receiptUrl, '_blank');
  };

  return (
    <div className="view-expenses-page">
      <div className="emoji-bg"></div>
      <div className="view-expenses-container">
        <div className="left-panel">
          <h2>📊 Expense Breakdown</h2>
          <PieChart width={400} height={400}>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={140}
              label
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ fontWeight: 'bold', borderRadius: '8px' }}
              formatter={(value, name) => [`₹${value}`, name]}
            />
            <Legend />
          </PieChart>
          <div style={{
            marginTop: '1rem',
            fontSize: '1.25rem',
            fontWeight: 'bold',
            textAlign: 'center'
          }}>
            💸 Total Expense: ₹{totalAmount}
          </div>
        </div>

        <div className="right-panel">
        <div style={{
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '20px',
  gap: '10px',
  flexWrap: 'wrap'
}}>
  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
    <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
      <option value="">All Categories</option>
      {categories.map((cat, idx) => (
        <option key={idx} value={cat}>{cat}</option>
      ))}
    </select>
    <input type="date" onChange={(e) => setStartDate(e.target.value)} />
    <input type="date" onChange={(e) => setEndDate(e.target.value)} />
  </div>

            <button
              onClick={() => navigate('/add-expense')}
              style={{
                backgroundColor: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                 transition: 'all 0.2s ease-in-out'
              }}
              onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)'}
              onMouseOut={e => e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.1)'}
            >
              ➕
            </button>
          </div>

          <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
            <table>
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
                {filteredExpenses.map(exp => (
                  <tr key={exp.id}>
                    <td>{exp.title}</td>
                    <td>₹{exp.amount}</td>
                    <td>{exp.category}</td>
                    <td>{new Date(exp.date).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button onClick={() => navigate(`/edit/${exp.id}`)}>✏️</button>
                        <button onClick={() => handleDelete(exp.id)}>🗑️</button>
                        <button
                          disabled={!exp.receiptUrl || exp.receiptUrl === 'No receipt uploaded'}
                          onClick={() => handleOpenLink(exp)}
                        >
                          👀
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewExpenses;

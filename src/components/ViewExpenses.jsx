import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Legend } from 'recharts';
import { db, auth } from '../config/config';
import { collection, getDocs } from 'firebase/firestore';
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

  useEffect(() => {
    const fetchExpenses = async () => {
      const querySnapshot = await getDocs(collection(db, 'expenses'));
      const expensesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setExpenses(expensesData);
      setFilteredExpenses(expensesData);
      const uniqueCategories = [...new Set(expensesData.map(exp => exp.category))];
      setCategories(uniqueCategories);
    };
    fetchExpenses();
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

  return (
    <div className="view-expenses-page">
      <div className="floating-emojis">💰 💸 🧾 🪙 📝 💵</div>
      <div className="view-expenses-container">
        <div className="left-panel">
          <h2>📊 Expense Breakdown</h2>
          <PieChart width={400} height={400}>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={140} label>
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </div>

        <div className="right-panel">
          <div className="filters">
            <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>

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
                    <button onClick={() => navigate(`/edit/${exp.id}`)}>✏️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ViewExpenses;

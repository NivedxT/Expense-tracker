import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './EditExpenses.css';

export default function EditExpenses() {
  const { id } = useParams(); // this is actually index
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: '',
    date: ''
  });

  useEffect(() => {
    const storedExpenses = JSON.parse(localStorage.getItem('expenses')) || [];
    const expenseToEdit = storedExpenses[parseInt(id)];
    if (expenseToEdit) {
      setFormData(expenseToEdit);
    } else {
      alert("Expense not found");
      navigate('/view-expenses');
    }
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    const storedExpenses = JSON.parse(localStorage.getItem('expenses')) || [];
    storedExpenses[parseInt(id)] = formData;
    localStorage.setItem('expenses', JSON.stringify(storedExpenses));
    alert("Expense updated successfully!");
    navigate('/view-expenses');
  };

  return (
    <div className="edit-expense-container">
      <h2>✏️ Edit Expense</h2>
      <div className="edit-form">
        <label>
          Title:
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
          />
        </label>

        <label>
          Amount:
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
          />
        </label>

        <label>
          Category:
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
          />
        </label>

        <label>
          Date:
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
          />
        </label>

        <button className="save-button" onClick={handleSave}>💾 Save</button>
      </div>
    </div>
  );
}

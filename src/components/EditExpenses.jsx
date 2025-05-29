// EditExpenses.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './EditExpense.css';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/config';

export default function EditExpenses() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [expense, setExpense] = useState({
    title: '',
    amount: '',
    category: '',
    date: ''
  });

  useEffect(() => {
    const fetchExpense = async () => {
      if (!id) return;
      const docRef = doc(db, 'expenses', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setExpense(docSnap.data());
      } else {
        console.log("No such document!");
      }
    };
    fetchExpense();
  }, [id]);

  useEffect(() => {
    const EMOJIS = ["📝", "💸"];
    const container = document.querySelector(".emoji-bg");
    if (!container) return;

    container.innerHTML = "";

    for (let i = 0; i < 40; i++) {
      const emoji = document.createElement("div");
      emoji.className = "emoji";
      emoji.innerText = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
      emoji.style.top = `${Math.random() * 100}%`;
      emoji.style.left = `${Math.random() * 100}%`;
      emoji.style.fontSize = `${2 + Math.random() * 3}rem`;
      emoji.style.transform = `rotate(${Math.random() * 360}deg)`;
      container.appendChild(emoji);
    }
  }, []);
  
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [fileURL, setFileURL] = useState('');


  const handleChange = (e) => {
    setExpense({ ...expense, [e.target.name]: e.target.value });
  };
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setFileURL(URL.createObjectURL(selectedFile));
    }
  };
  
  const handleCancelFile = () => {
    setFile(null);
    setFileName('');
    setFileURL('');
  };
  
  const handlePreviewFile = () => {
    if (fileURL) window.open(fileURL, '_blank');
  };
  
  const handleUpdateExpense = async (e) => {
    e.preventDefault();
    await updateDoc(doc(db, 'expenses', id), {
      title: expense.title,
      amount: parseFloat(expense.amount),
      category: expense.category,
      date: expense.date
    });
    alert('Expense Updated!');
    navigate('/view');
  };

  return (
    <div className="edit-expense-container">
      <div className="emoji-bg"></div>

      <div className="edit-expense-content">
      <h1 className="elegant-heading">
  <span style={{ color: '#6c63ff', marginRight: '0.5rem' }}></span>📝 Edit Expense
</h1>

        <form onSubmit={handleUpdateExpense} className="edit-expense-form">
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
          <input
  type="date"
  name="date"
  value={expense.date}
  onChange={handleChange}
  required
/>

<label className="custom-file-upload">
  📎 Upload Receipt
  <input type="file" onChange={handleFileChange} />
</label>

{file && (
  <div className="file-info-box">
    <p className="file-success">
      ✅ File ready to upload: <strong>{fileName}</strong>
    </p>
    <div className="file-actions">
      <button className="icon-btn" onClick={handlePreviewFile}>👁️</button>
      <button className="icon-btn" onClick={handleCancelFile}>❌</button>
    </div>
  </div>
)}


<button type="submit">Update Expense</button>
        </form>
      </div>
    </div>
  );
}

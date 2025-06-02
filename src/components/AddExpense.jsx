import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddExpense.css';
import { addDoc, collection, getDocs } from 'firebase/firestore';
import { app, auth, db } from '../config/config';
import { onAuthStateChanged } from 'firebase/auth';
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";

export default function AddExpense() {
  const [userId, setUserId] = useState(null); // Changed from 'userid' to 'userId'
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  const [file, setFile] = useState(null); // Changed from 'setfile' to 'setFile'
  const [expense, setExpense] = useState({
    title: '',
    amount: '',
    category: '',
    date: ''
  });
  const [validationError, setValidationError] = useState(''); // Added for input validation

  const storage = getStorage(app);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });
  }, [auth]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const snapshot = collection(db, 'categories');
        const data = await getDocs(snapshot);
        const categoriesList = data.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCategories(categoriesList);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const EMOJIS = ["➕", "💸"];
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
      emoji.style.opacity = "0.66";
      emoji.style.userSelect = "none";
      emoji.style.transform = `rotate(${Math.random() * 360}deg)`;
      emoji.style.pointerEvents = "none";
      container.appendChild(emoji);
    }
  }, []);

  const handleChange = (e) => {
    setExpense({ ...expense, [e.target.name]: e.target.value });
    if (validationError) { // Clear validation error on input change
      setValidationError('');
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (validationError) { // Clear validation error on file selection
      setValidationError('');
    }
  };

  const uploadFileAndGetURL = async (fileToUpload) => { // Renamed parameter for clarity
    try {
      const uniqueName = `${Date.now()}_${fileToUpload.name}`;
      const storageRef = ref(storage, `expense/${uniqueName}`);
      const snapshot = await uploadBytes(storageRef, fileToUpload);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error("File upload failed:", error);
      return null;
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();

    // --- Input Validation ---
    if (!expense.title || !expense.amount || !expense.category || !expense.date) {
      setValidationError('Please fill in all required fields (Title, Amount, Category, Date).');
      return;
    }
    setValidationError(''); // Clear error if validation passes

    let fileUrl = 'No receipt uploaded';
    if (file) {
      fileUrl = await uploadFileAndGetURL(file);
    }

    try {
  
      await addDoc(collection(db, 'expenses'), {
        title: expense.title,
        amount: parseFloat(expense.amount),
        category: expense.category,
        date: expense.date,
        userId: userId, // Changed 'uid' to 'userId' for consistency
        receiptUrl: fileUrl,
        createdAt: new Date().toISOString(), // Added timestamp
      });
      console.log('Expense added to Firestore!'); // Changed alert to console.log
      setExpense({
        title: '',
        amount: '',
        category: '',
        date: ''
      });
      setFile(null); // Clear file input after submission
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = ''; // Clear file input element value
      navigate('/view-expenses'); // Redirect to ViewExpenses
    } catch (error) {
      console.error('Error adding expense:', error);
      console.log('Failed to add expense. Please try again.'); // Changed alert to console.log
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  };

  const handlePreviewFile = () => {
    if (file) {
      window.open(URL.createObjectURL(file), '_blank');
    }
  };

  return (
    <div className="add-expense-container">
      <div className="emoji-bg"></div>
      <div className="expense-form-content"> {/* Added this wrapper for z-index */}
        <h2 className="elegant-heading">➕ Add New Expense</h2>
        {validationError && ( // Display validation error
          <p style={{ color: 'red', fontWeight: 'bold', marginBottom: '15px', textAlign: 'center' }}>
            {validationError}
          </p>
        )}
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
            <option value="">Select Category</option> {/* Added default option */}
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
          <input
            type="date"
            name="date"
            value={expense.date}
            onChange={handleChange}
            required
          />
          <label className="custom-file-upload">
            📎 Upload Receipt
            <input
              type="file"
              onChange={handleFileChange}
            />
          </label>

          {file && (
            <div className="upload-status">
              <div className="upload-status-text">
                ✅ File ready to upload:
                <span className="upload-filename">{file.name}</span>
              </div>
              <div className="file-action-buttons">
                <button
                  type="button"
                  className="status-icon-button"
                  title="Preview"
                  onClick={handlePreviewFile}
                >
                  👁️
                </button>
                <button
                  type="button"
                  className="status-icon-button"
                  title="Remove"
                  onClick={handleRemoveFile}
                >
                  ❌
                </button>
              </div>
            </div>
          )}
          <button type="submit">Add Expense</button>
          
        </form>
      <button onClick={() => navigate('/')} className="elegant-home-button">Go to Home</button>
      </div>
    </div>
  );
}
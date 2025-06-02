// EditExpenses.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './EditExpense.css';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth, app } from '../config/config'; // Import auth
import { onAuthStateChanged } from 'firebase/auth'; // Import onAuthStateChanged
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage"; // Import storage functions

export default function EditExpenses() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [expense, setExpense] = useState({
    title: '',
    amount: '',
    category: '',
    date: '',
    receiptUrl: '' // Added receiptUrl to state
  });
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [fileURL, setFileURL] = useState('');
  const [userId, setUserId] = useState(null); // State to hold userId

  const storage = getStorage(app); // Initialize storage

  // Listen for auth state changes to get userId
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
        navigate('/'); // Redirect to login if not authenticated
      }
    });
    return () => unsubscribe();
  }, [auth, navigate]);


  useEffect(() => {
    const fetchExpense = async () => {
      if (!id) return;
      const docRef = doc(db, 'expenses', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setExpense(data);
        // Set initial file info if receiptUrl exists
        if (data.receiptUrl && data.receiptUrl !== 'No receipt uploaded') {
          setFileURL(data.receiptUrl);
          // Attempt to get filename from URL, or set a placeholder
          const urlParts = data.receiptUrl.split('/');
          const encodedFilename = urlParts[urlParts.length - 1].split('?')[0];
          setFileName(decodeURIComponent(encodedFilename.split('_').slice(1).join('_') || 'Uploaded Receipt'));
        }
      } else {
        console.log("No such document!");
      }
    };
    fetchExpense();
  }, [id, userId]); // Depend on userId to ensure data is fetched for the correct user

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
      emoji.style.opacity = '0.47'; // Added opacity for consistency
      emoji.style.position = 'absolute'; // Added position for consistency
      emoji.style.userSelect = 'none'; // Added for consistency
      emoji.style.pointerEvents = 'none'; // Added for consistency
      emoji.style.animation = 'float 20s infinite linear'; // Added animation for consistency
      container.appendChild(emoji);
    }
  }, []);

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
    // Optionally, reset the receiptUrl in expense state if you want to remove it from Firestore
    setExpense(prev => ({ ...prev, receiptUrl: 'No receipt uploaded' }));
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = ''; // Clear file input element value
  };

  const handlePreviewFile = () => {
    if (fileURL) window.open(fileURL, '_blank');
  };

  const uploadFileAndGetURL = async (fileToUpload) => {
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

  const handleUpdateExpense = async (e) => {
    e.preventDefault();

    let updatedReceiptUrl = expense.receiptUrl; // Start with existing URL
    if (file) { // If a new file is selected
      updatedReceiptUrl = await uploadFileAndGetURL(file);
    } else if (expense.receiptUrl === 'No receipt uploaded' && !fileURL) {
        // If it was explicitly removed by handleCancelFile and no new file selected
        updatedReceiptUrl = 'No receipt uploaded';
    }


    try {
      await updateDoc(doc(db, 'expenses', id), {
        title: expense.title,
        amount: parseFloat(expense.amount),
        category: expense.category,
        date: expense.date,
        receiptUrl: updatedReceiptUrl, // Update with new/removed URL
        // userId: userId, // Assuming userId doesn't change on edit, but good to include if it could
      });
      console.log('Expense Updated!'); // Changed alert to console.log
      navigate('/view-expenses'); // Navigate to view-expenses, not /view
    } catch (error) {
      console.error("Error updating expense:", error);
      console.log('Failed to update expense. Please try again.'); // Changed alert to console.log
    }
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

          <label className="custom-file-upload">
            📎 Upload Receipt
            <input type="file" onChange={handleFileChange} />
          </label>

          {file || (expense.receiptUrl && expense.receiptUrl !== 'No receipt uploaded') ? ( // Show info box if new file or existing URL
            <div className="file-info-box">
              <p className="file-success">
                ✅ File ready to upload: <strong>{fileName || (expense.receiptUrl ? 'Existing Receipt' : '')}</strong>
              </p>
              <div className="file-actions">
                <button className="icon-btn" onClick={handlePreviewFile} title="Preview Receipt">👁️</button>
                <button className="icon-btn" onClick={handleCancelFile} title="Remove Receipt">❌</button>
              </div>
            </div>
          ) : null}


          <button type="submit">Update Expense</button>
        </form>
        <button onClick={() => navigate('/')} className="elegant-home-button">Go to Home</button>
      </div>
    </div>
  );
}
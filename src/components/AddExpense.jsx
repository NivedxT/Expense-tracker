import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddExpense.css';
import { addDoc, collection, getDocs } from 'firebase/firestore';
import { app,auth, db } from '../config/config';
import { onAuthStateChanged } from 'firebase/auth';
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
export default function AddExpense() {
  const [userid, setUserid] = useState(null);
  const [categories, setCategories] = useState([]);
  

  const navigate = useNavigate();
  const [file,setfile] = useState(null);
  const [expense, setExpense] = useState({
    title: '',
    amount: '',
    category: '',
    date: ''
  });
const storage = getStorage(app);
  useEffect(()=>{
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/auth.user
        setUserid(user.uid);
        // ...
      }
    });
  },[auth])
  
  
  useEffect(() => {
    const fetchCategories = async () => {
      const snapshot = collection(db, 'categories');
      const data = await getDocs(snapshot);
      const categoriesList = data.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCategories(categoriesList);
    };

    fetchCategories();
  }, []);

  
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
      emoji.style.opacity = "0.66";
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
    let fileUrl = 'No receipt uploaded';
    if (file) {
      fileUrl = await uploadFileAndGetURL(file);
    }
console.log(expense);

   await addDoc(collection(db, 'expenses'), {
      title: expense.title,
      amount: parseFloat(expense.amount),
      category: expense.category,
      date: expense.date,
      uid: userid,
      receiptUrl: fileUrl,
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
const uploadFileAndGetURL = async (file) => {
  try {
    const storage = getStorage();
    const uniqueName = `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `expense/${uniqueName}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
    console.log(downloadURL);
  } catch (error) {
    console.error("File upload failed:", error);
    return null;
  }
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
    onChange={(e) => {
      const selectedFile = e.target.files[0];
      setfile(selectedFile);
    }}
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
        onClick={() => window.open(URL.createObjectURL(file), '_blank')}
      >
        👁️
      </button>
      <button
        type="button"
        className="status-icon-button"
        title="Remove"
        onClick={() => setfile(null)}
      >
        ❌
      </button>
    </div>
  </div>
)}




        <button type="submit">Add Expense</button>
      </form>
    </div>
  );
}

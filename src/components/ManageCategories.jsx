import React, { useEffect, useState } from 'react';
import './ManageCategories.css';
import { db } from '../config/config';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from 'firebase/firestore';

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [editId, setEditId] = useState(null);

  const fetchCategories = async () => {
    const snapshot = await getDocs(collection(db, 'categories'));
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setCategories(data);
  };
  useEffect(() => {
    const EMOJIS = ['📁', '💸', '🧾', '💰'];
    const container = document.querySelector('.emoji-bg');
    if (!container) return;
  
    container.innerHTML = '';
    for (let i = 0; i < 40; i++) {
      const emoji = document.createElement('div');
      emoji.className = 'emoji';
      emoji.innerText = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
      emoji.style.top = `${Math.random() * 100}%`;
      emoji.style.left = `${Math.random() * 100}%`;
      emoji.style.fontSize = `${2 + Math.random() * 2}rem`;
      emoji.style.opacity = '0.67';
      emoji.style.position = 'absolute';
      emoji.style.pointerEvents = 'none';
      emoji.style.userSelect = 'none';
      emoji.style.animation = 'float 30s linear infinite';
      container.appendChild(emoji);
    }
  }, []);
  

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    if (editId) {
      await updateDoc(doc(db, 'categories', editId), { name: categoryName });
      setEditId(null);
    } else {
        await addDoc(collection(db, 'categories'), { name: categoryName });
    }

    setCategoryName('');
    fetchCategories();
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'categories', id));
    fetchCategories();
  };

  const handleEdit = (cat) => {
    setCategoryName(cat.name);
    setEditId(cat.id);
  };

  return (
      <div className="emoji-wrapper">
        <div className="emoji-bg"></div>
    <div className="manage-container">
      <h2 className="manage-heading">📁 Manage Categories</h2>
      <form className="add-form" onSubmit={handleSubmit}>
       <div className="input-button-wrapper">
        <input
          type="text"
          placeholder="Category Name"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          required
        />
        <button type="submit" style={{ backgroundColor: '#ffc107', padding: '8px 16px', fontWeight: 'bold' }}>
          {editId ? 'Update' : 'Add'}
        </button>
        </div>
      </form>
<div style={{maxHeight: '400px', overflowY: 'auto', marginTop: '20px'}}>
<table className="category-table">
        <thead>
          <tr style={{ backgroundColor: '#f0f0f0' }}>
            <th style={{ padding: '10px' }}>Category</th>
            <th style={{ padding: '10px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map(cat => (
            <tr key={cat.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '10px' }}>{cat.name}</td>
              <td style={{ padding: '10px' }}>
                <button
                  onClick={() => handleEdit(cat)}
                  style={{
                    backgroundColor: '#17a2b8',
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    marginRight: '8px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                ✏️
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
                  style={{
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                🗑️
                </button>
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

export default ManageCategories;

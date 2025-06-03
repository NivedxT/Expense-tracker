import React, { useEffect, useState } from 'react';
import './ManageCategories.css';
import { db, auth } from '../config/config'; // HIGHLIGHT: Import 'auth' from config
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query, // HIGHLIGHT: Import 'query'
  where, // HIGHLIGHT: Import 'where'
  getDoc // HIGHLIGHT: Import 'getDoc' for ownership check
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth'; // HIGHLIGHT: Import 'onAuthStateChanged'

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [editId, setEditId] = useState(null);
  const [userId, setUserId] = useState(null); // HIGHLIGHT: New state for userId
  const [loading, setLoading] = useState(true); // HIGHLIGHT: New state for loading
  const [error, setError] = useState(null); // HIGHLIGHT: New state for error messages

  // HIGHLIGHT START: New useEffect to get authenticated user ID
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
        setCategories([]); // Clear categories if no user is logged in
      }
      setLoading(false); // Set loading to false once auth state is determined
    });

    return () => unsubscribe(); // Cleanup auth listener
  }, [auth]); // Dependency on 'auth'
  // HIGHLIGHT END

  // HIGHLIGHT START: Modified fetchCategories to filter by userId
  const fetchCategories = async () => {
    if (!userId) { // Only fetch if userId is available
      setCategories([]); // Ensure categories are empty if no user
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null); // Clear previous errors
      const categoriesRef = collection(db, 'categories');
      // HIGHLIGHT: Create a query to get only categories belonging to the current userId
      const q = query(categoriesRef, where('userId', '==', userId));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  // HIGHLIGHT END

  useEffect(() => {
    // HIGHLIGHT: Call fetchCategories when userId changes
    fetchCategories();
  }, [userId]); // HIGHLIGHT: Dependency on userId

  // Emoji background effect (unchanged, but included for completeness)
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


  // HIGHLIGHT START: Modified handleSubmit to include userId for new categories and check ownership for updates
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) {
      setError('You must be logged in to manage categories.');
      return;
    }
    if (!categoryName.trim()) {
      setError('Category name cannot be empty.');
      return;
    }

    try {
      if (editId) {
        const categoryDocRef = doc(db, 'categories', editId);
        // HIGHLIGHT: Optional: Verify ownership before updating (Firestore rules will also enforce this)
        const docSnap = await getDoc(categoryDocRef);
        if (docSnap.exists() && docSnap.data().userId === userId) {
          await updateDoc(categoryDocRef, { name: categoryName.trim() });
          setEditId(null);
          setError(null); // Clear error on success
        } else {
          setError('Category not found or you do not have permission to edit this category.');
        }
      } else {
        // HIGHLIGHT: Add userId to the new category document
        await addDoc(collection(db, 'categories'), {
          name: categoryName.trim(),
          userId: userId, // CRUCIAL: Associate category with the current user
          createdAt: new Date(), // Optional: add timestamp
        });
        setError(null); // Clear error on success
      }

      setCategoryName('');
      fetchCategories(); // Re-fetch categories to update the list
    } catch (err) {
      console.error('Error managing category:', err);
      setError(`Failed to ${editId ? 'update' : 'add'} category. Please try again.`);
    }
  };
  // HIGHLIGHT END

  // HIGHLIGHT START: Modified handleDelete to check ownership
  const handleDelete = async (id) => {
    if (!userId) {
      setError('You must be logged in to delete categories.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        const categoryDocRef = doc(db, 'categories', id);
        // HIGHLIGHT: Verify ownership before deleting
        const docSnap = await getDoc(categoryDocRef);
        if (docSnap.exists() && docSnap.data().userId === userId) {
          await deleteDoc(categoryDocRef);
          // Optimistically update UI
          setCategories(categories.filter(cat => cat.id !== id));
          setError(null); // Clear error on success
        } else {
          setError('Category not found or you do not have permission to delete this category.');
        }
      } catch (err) {
        console.error('Error deleting category:', err);
        setError('Failed to delete category. Please try again.');
      }
    }
  };
  // HIGHLIGHT END

  const handleEdit = (cat) => {
    setCategoryName(cat.name);
    setEditId(cat.id);
  };

  return (
    <div className="emoji-wrapper">
      <div className="emoji-bg"></div>
      <div className="manage-container">
        <h2 className="manage-heading">📁 Manage Categories</h2>

        {/* HIGHLIGHT: Display loading and error messages */}
        {loading && <p style={{ textAlign: 'center', color: '#666' }}>Loading categories...</p>}
        {error && <p style={{ color: 'red', textAlign: 'center', fontWeight: 'bold' }}>{error}</p>}
        {!userId && !loading && (
          <p style={{ textAlign: 'center', color: '#888' }}>Please log in to manage categories.</p>
        )}

        {userId && ( // HIGHLIGHT: Only show form if user is logged in
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
        )}

        <div style={{ maxHeight: '400px', overflowY: 'auto', marginTop: '20px' }}>
          <table className="category-table">
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0' }}>
                <th style={{ padding: '10px' }}>Category</th>
                <th style={{ padding: '10px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 && !loading && userId ? ( // HIGHLIGHT: Message for no categories
                <tr>
                  <td colSpan="2" style={{ textAlign: 'center', padding: '20px' }}>No categories added yet.</td>
                </tr>
              ) : (
                categories.map(cat => (
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageCategories;

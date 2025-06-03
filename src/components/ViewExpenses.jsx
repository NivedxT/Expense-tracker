import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { db, auth } from '../config/config';
import { collection, getDocs, query, where, doc, deleteDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import './ViewExpenses.css'; // Ensure this CSS file is correctly linked

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A18CFF', '#8884d8', '#ffc658', '#d0ed57', '#a4de6c', '#83a6ed'];

const ViewExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  // States for advanced filtering and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [sortBy, setSortBy] = useState('date'); // Default sort by date
  const [sortOrder, setSortOrder] = useState('desc'); // Default sort order descending (newest first)

  // Calculate total amount of filtered expenses
  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

  // Effect to listen for authentication state changes and get userId
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
        navigate('/'); // Redirect to login if not authenticated
      }
    });
    return () => unsubscribe(); // Cleanup subscription on component unmount
  }, [auth, navigate]);

  // Handler for deleting an expense
  const handleDelete = async (id) => {
    // Using window.confirm for simplicity, consider a custom modal for better UX
    const confirmDelete = window.confirm("Are you sure you want to delete this expense?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "expenses", id));
      console.log("Expense deleted successfully!");
      // Optimistically update the UI by removing the deleted expense from state
      setExpenses((prev) => prev.filter((exp) => exp.id !== id));
    } catch (error) {
      console.error("Error deleting expense:", error);
      console.log("Failed to delete expense. Please try again.");
    }
  };

  // Effect to fetch expenses from Firestore when userId changes
  useEffect(() => {
    const fetchExpenses = async () => {
      if (!userId) {
        console.log("ViewExpenses: No userId available, skipping expense fetch.");
        return;
      }
      try {
        // Query expenses collection, filtering by userId
        const q = query(collection(db, "expenses"), where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        const expensesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Ensure amount is parsed as float and date as Date object for easier sorting/filtering
          amount: parseFloat(doc.data().amount),
          date: new Date(doc.data().date), // Convert date string to Date object
        }));

        setExpenses(expensesData);
        // Extract unique categories from fetched expenses
        const uniqueCategories = [...new Set(expensesData.map(exp => exp.category))];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Error fetching expenses:", error);
      }
    };

    fetchExpenses();
  }, [userId]); // Re-run when userId changes

  // Effect for the floating emoji background animation
  useEffect(() => {
    const EMOJIS = ['💸', '📉', '🧾', '📊'];
    const container = document.querySelector('.emoji-bg');
    if (!container) return; // Exit if container not found

    container.innerHTML = ''; // Clear existing emojis
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
  }, []); // Run once on component mount

  // Effect to apply filtering and sorting whenever dependencies change
  useEffect(() => {
    let currentFiltered = [...expenses]; // Start with all expenses

    // 1. Filter by Category
    if (selectedCategory) {
      currentFiltered = currentFiltered.filter(exp => exp.category === selectedCategory);
    }

    // 2. Filter by Date Range
    if (startDate) {
      // Ensure date comparison is correct (start of day for startDate)
      const startOfDay = new Date(startDate);
      startOfDay.setHours(0, 0, 0, 0);
      currentFiltered = currentFiltered.filter(exp => exp.date >= startOfDay);
    }
    if (endDate) {
      // Ensure date comparison is correct (end of day for endDate)
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      currentFiltered = currentFiltered.filter(exp => exp.date <= endOfDay);
    }

    // 3. Filter by Search Term (Title)
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      currentFiltered = currentFiltered.filter(exp =>
        exp.title.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    // 4. Filter by Amount Range
    if (minAmount !== '') {
      currentFiltered = currentFiltered.filter(exp => exp.amount >= parseFloat(minAmount));
    }
    if (maxAmount !== '') {
      currentFiltered = currentFiltered.filter(exp => exp.amount <= parseFloat(maxAmount));
    }

    // 5. Apply Sorting
    currentFiltered.sort((a, b) => {
      let valA, valB;

      // Handle different data types for sorting
      switch (sortBy) {
        case 'date':
          valA = a.date.getTime(); // Convert Date objects to timestamps for comparison
          valB = b.date.getTime();
          break;
        case 'amount':
          valA = a.amount;
          valB = b.amount;
          break;
        case 'title':
          valA = a.title.toLowerCase();
          valB = b.title.toLowerCase();
          break;
        case 'category':
          valA = a.category.toLowerCase();
          valB = b.category.toLowerCase();
          break;
        default:
          return 0; // No sorting
      }

      // Apply sort order
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0; // Values are equal
    });

    setFilteredExpenses(currentFiltered); // Update the state with filtered and sorted expenses
  }, [selectedCategory, startDate, endDate, searchTerm, minAmount, maxAmount, sortBy, sortOrder, expenses]); // Dependencies for this effect

  // Prepare data for Pie Chart (aggregates expenses by category)
  const data = Object.values(filteredExpenses.reduce((acc, exp) => {
    acc[exp.category] = acc[exp.category] || { name: exp.category, value: 0 };
    acc[exp.category].value += Number(exp.amount); // Ensure amount is treated as a number
    return acc;
  }, {}));

  // Handler to open receipt URL in a new tab
  const handleOpenLink = (exp) => {
    if (exp.receiptUrl && exp.receiptUrl !== 'No receipt uploaded') {
      window.open(exp.receiptUrl, '_blank');
    } else {
      console.log("No receipt URL available for this expense.");
      // In a real app, you might show a user-friendly message here
    }
  };

  return (
    <div className="view-expenses-page">
      <div className="emoji-bg"></div> {/* Background emojis */}
      <div className="view-expenses-container">
        {/* Left Panel: Expense Breakdown Pie Chart */}
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
              label // Displays category name and value directly on slices
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ fontWeight: 'bold', borderRadius: '8px' }}
              formatter={(value, name) => [`₹${value.toFixed(2)}`, name]} // Format tooltip values
            />
            <Legend /> {/* Displays color legend for categories */}
          </PieChart>
          <div style={{
            marginTop: '1rem',
            fontSize: '1.25rem',
            fontWeight: 'bold',
            textAlign: 'center'
          }}>
            💸 Total Expense: ₹{totalAmount.toFixed(2)} {/* Display formatted total */}
          </div>
        </div>

        {/* Right Panel: Filters, Table, and Buttons */}
        <div className="right-panel">
          {/* Filters and Sort Section */}
          <div className="filters-and-sort-section">
            <input
              type="text"
              placeholder="Search by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <input
              type="number"
              placeholder="Min Amount"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              min="0" // HTML attribute to prevent negative input
            />
            <input
              type="number"
              placeholder="Max Amount"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
              min="0" // HTML attribute to prevent negative input
            />

            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />

            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="date">Sort by Date</option>
              <option value="amount">Sort by Amount</option>
              <option value="title">Sort by Title</option>
              <option value="category">Sort by Category</option>
            </select>
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>

          {/* Expenses Table (scrollable) */}
          <div style={{ maxHeight: '500px', overflowY: 'auto', flexGrow: 1 }}>
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
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No expenses found matching your criteria.</td>
                  </tr>
                ) : (
                  filteredExpenses.map(exp => (
                    <tr key={exp.id}>
                      <td>{exp.title}</td>
                      <td>₹{exp.amount.toFixed(2)}</td> {/* Format amount to 2 decimal places */}
                      <td>{exp.category}</td>
                      <td>{exp.date.toLocaleDateString()}</td> {/* Display formatted date */}
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
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Bottom Buttons Container: Add New Expense (left) and Go to Home (right) */}
          <div className="bottom-buttons-container">
            <button
              onClick={() => navigate('/add-expense')}
              className="elegant-home-button"
            >
              ➕ Add New Expense
            </button>
            <button onClick={() => navigate('/')} className="elegant-home-button">Go to Home</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewExpenses;

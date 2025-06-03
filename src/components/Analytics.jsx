import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../config/config';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  Line,
  LineChart,
} from 'recharts';
import './Analytics.css';

const Analytics = () => {
  const [userId, setUserId] = useState(null);
  const [monthlySpendData, setMonthlySpendData] = useState([]);
  const [categorySpendData, setCategorySpendData] = useState([]); // New state for category spending
  const [highestSpendDay, setHighestSpendDay] = useState(null);
  const [categoryTrendData, setCategoryTrendData] = useState([]); // New state for category trend data
  const [selectedCategory, setSelectedCategory] = useState(null); // Track the selected category
  const [averageMonthlySpend, setAverageMonthlySpend] = useState(0);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [allExpenses, setAllExpenses] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [dailySpendData, setDailySpendData] = useState([]);
  const navigate = useNavigate();
    // Handle category click
  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    const categoryExpenses = allExpenses.filter(expense => expense.category === category);
    
    const monthlySpends = {};
    monthsTemplate.forEach(month => {
      monthlySpends[month.value] = 0;
    });
    categoryExpenses.forEach(expense => {
      const month = new Date(expense.date).getMonth() + 1;
      monthlySpends[month] += expense.amount;
    });
    const trendData = monthsTemplate.map(month => ({
      month: `${month.month} ${selectedYear}`,
      spend: parseFloat(monthlySpends[month.value].toFixed(2)),
    }));
    setCategoryTrendData(trendData);
  };
  const monthsTemplate = [
    { month: 'Jan', value: 1 },
    { month: 'Feb', value: 2 },
    { month: 'Mar', value: 3 },
    { month: 'Apr', value: 4 },
    { month: 'May', value: 5 },
    { month: 'Jun', value: 6 },
    { month: 'Jul', value: 7 },
    { month: 'Aug', value: 8 },
    { month: 'Sep', value: 9 },
    { month: 'Oct', value: 10 },
    { month: 'Nov', value: 11 },
    { month: 'Dec', value: 12 },
  ];
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
  
  // Monitor Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setUserId(user.uid);
      else navigate('/');
    });
    return () => unsubscribe();
  }, [navigate]);

  // Fetch Expenses
  useEffect(() => {
    const fetchAllExpenses = async () => {
      if (!userId) return;

      try {
        const expensesRef = collection(db, 'expenses');
        const q = query(expensesRef, where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
        const expenses = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          amount: parseFloat(doc.data().amount),
          date: new Date(doc.data().date),
        }));
        setAllExpenses(expenses);
      } catch (error) {
        console.error('Error fetching expenses:', error);
      }
    };
    fetchAllExpenses();
  }, [userId]);

  // Process Monthly and Category Data
  useEffect(() => {
    if (!allExpenses.length) {
      setMonthlySpendData([]);
      setCategorySpendData([]); // Reset category data
      setHighestSpendDay({ date: null, amount: 0 });
      setAverageMonthlySpend(0);
      return;
    }

    const yearExpenses = allExpenses.filter(
      (expense) => new Date(expense.date).getFullYear() === selectedYear
    );

    // Monthly Spending Calculation
    const monthlySpends = {};
    monthsTemplate.forEach(month => {
      monthlySpends[month.value] = 0;
    });

    yearExpenses.forEach(expense => {
      const month = new Date(expense.date).getMonth() + 1;
      monthlySpends[month] += expense.amount;
    });

    const chartData = monthsTemplate.map(month => ({
      month: `${month.month} ${selectedYear}`,
      spend: parseFloat(monthlySpends[month.value].toFixed(2)),
    }));
    setMonthlySpendData(chartData);

    // Category Spending Calculation
    const categorySpends = {};
    yearExpenses.forEach(expense => {
      const category = expense.category;
      if (!categorySpends[category]) {
        categorySpends[category] = 0;
      }
      categorySpends[category] += expense.amount;
    });

    const categoryData = Object.keys(categorySpends).map(category => ({
      category,
      spend: parseFloat(categorySpends[category].toFixed(2)),
    }));
    setCategorySpendData(categoryData);

    // Other calculations (highest spend day, average monthly spend)
    if (yearExpenses.length > 0) {
      const dailySpends = yearExpenses.reduce((acc, expense) => {
        const dayString = new Date(expense.date).toISOString().split('T')[0];
        acc[dayString] = (acc[dayString] || 0) + expense.amount;
        return acc;
      }, {});

      let highestDay = { date: null, amount: 0 };
      for (const day in dailySpends) {
        if (dailySpends[day] > highestDay.amount) {
          highestDay = { date: day, amount: dailySpends[day] };
        }
      }
      setHighestSpendDay({
        date: highestDay.date,
        amount: highestDay.amount.toFixed(2),
      });

      const totalYearSpend = yearExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      setAverageMonthlySpend((totalYearSpend / 12).toFixed(2));
    }
  }, [allExpenses, selectedYear]);
  
  // Daily Spend Graph Handler
  const handleMonthClick = (monthIndex) => {
    const monthValue = monthsTemplate[monthIndex].value;
    setSelectedMonth(monthValue);

    const filtered = allExpenses.filter(expense => {
      const date = new Date(expense.date);
      return (
        date.getFullYear() === selectedYear &&
        date.getMonth() + 1 === monthValue
      );
    });

    const dailyMap = {};
    filtered.forEach(expense => {
      const day = new Date(expense.date).getDate();
      dailyMap[day] = (dailyMap[day] || 0) + expense.amount;
    });

    const daysInMonth = new Date(selectedYear, monthValue, 0).getDate();
    const dailyData = [];
    for (let day = 1; day <= daysInMonth; day++) {
      dailyData.push({
        day: `${day < 10 ? '0' + day : day} ${monthsTemplate[monthIndex].month}`,
        spend: parseFloat((dailyMap[day] || 0).toFixed(2)),
      });
    }
    setDailySpendData(dailyData);
  };

  const handleYearChange = (e) => {
    setSelectedYear(parseInt(e.target.value));
    setSelectedMonth(null);
    setDailySpendData([]);
  };

  const handleBackButtonClick = () => {
    navigate('/home');
  };

  return (
    <div className="analytics-container">
      <div className="analytics-content">
        <h2 className="analytics-title">💰 Expense Analytics</h2>

        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <label htmlFor="year-select" style={{ marginRight: '10px', fontWeight: 'bold', fontSize: '1.1rem' }}>
            📅 Select Year:
          </label>
          <select
            id="year-select"
            value={selectedYear}
            onChange={handleYearChange}
            style={{
              padding: '8px 12px',
              fontSize: '1rem',
              borderRadius: '8px',
              border: '2px solid #ddd',
              backgroundColor: '#fff',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            <option value={2025}>2025</option>
            <option value={2024}>2024</option>
            <option value={2023}>2023</option>
          </select>
        </div>

        <div className="analytics-summary">
          <div className="summary-card">
            <h3>Highest Spend Day ({selectedYear})</h3>
            {highestSpendDay && highestSpendDay.date ? (
              <p>
                ₹{highestSpendDay.amount} on {new Date(highestSpendDay.date).toLocaleDateString()}
              </p>
            ) : (
              <p>No data</p>
            )}
          </div>
          <div className="summary-card">
            <h3>Average Monthly Spend ({selectedYear})</h3>
            <p>₹{averageMonthlySpend}</p>
          </div>
        </div>

        <div className="chart-section">
          <h3>Month-wise Spend ({selectedYear})</h3>
          {monthlySpendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={monthlySpendData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis
                  dataKey="month"
                  tick={{ fill: '#333', fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tickFormatter={(value) => `₹${value}`} tick={{ fill: '#333' }} />
                <Tooltip formatter={(value) => [`₹${value}`, 'Spend']} labelStyle={{ color: '#333' }} />
                <Legend />
                <Bar
                  dataKey="spend"
                  fill="#8884d8"
                  name="Monthly Spend"
                  radius={[4, 4, 0, 0]}
                  onClick={(data, index) => handleMonthClick(index)}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p>No monthly spend data available for {selectedYear}.</p>
          )}
        </div>
        {selectedMonth && dailySpendData.length > 0 && (
          <div className="chart-section" style={{ marginTop: '3rem' }}>
            <h3>
              Daily Spend in {monthsTemplate[selectedMonth - 1].month} {selectedYear}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={dailySpendData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis
                  dataKey="day"
                  tick={{ fill: '#333', fontSize: 11 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tickFormatter={(value) => `₹${value}`} tick={{ fill: '#333' }} />
                <Tooltip formatter={(value) => [`₹${value}`, 'Spend']} labelStyle={{ color: '#333' }} />
                <Legend />
                <Bar
                  dataKey="spend"
                  fill="#82ca9d"
                  name="Daily Spend"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
            {selectedMonth && (
              <button
                onClick={() => {
                  setSelectedMonth(null);
                  setDailySpendData([]);
                }}
                className="back-button"
                style={{ marginTop: '1rem' }}
              >
                🔙 Hide Daily View
              </button>
            )}
          </div>
        )}

        {/* New Category-wise Spend Graph */}
        <div className="chart-section" style={{ marginTop: '3rem' }}>
          <h3>Category-wise Spend ({selectedYear})</h3>
          {categorySpendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={categorySpendData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis
                  dataKey="category"
                  tick={{ fill: '#333', fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tickFormatter={(value) => `₹${value}`} tick={{ fill: '#333' }} />
                <Tooltip formatter={(value) => [`₹${value}`, 'Spend']} labelStyle={{ color: '#333' }} />
                <Legend />
               <Bar
                dataKey="spend"
                fill="#82ca9d"
                name="Category Spend"
                radius={[4, 4, 0, 0]}
                onClick={(data) => handleCategoryClick(data.category)} // Handle category click
                />

              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p>No category spend data available for {selectedYear}.</p>
          )}
        </div>
        <div>
          


{selectedCategory && categoryTrendData.length > 0 && (
  <div className="chart-section" style={{ marginTop: '3rem' }}>
    <h3>Monthly Spend Trend for {selectedCategory} ({selectedYear})</h3>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={categoryTrendData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <XAxis dataKey="month" tick={{ fill: '#333', fontSize: 12 }} />
        <YAxis tickFormatter={(value) => `₹${value}`} tick={{ fill: '#333' }} />
        <Tooltip formatter={(value) => [`₹${value}`, 'Spend']} labelStyle={{ color: '#333' }} />
        <Legend />
        <Line type="monotone" dataKey="spend" stroke="#6c63ff" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
      {selectedMonth && (
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setCategoryTrendData([]);
                }}
                className="back-button"
                style={{ marginTop: '1rem' }}
              >
                🔙 Hide Category View
              </button>
            )}
    
        </div>
        )}
        <button onClick={handleBackButtonClick} className="back-button">
          🏠 Back to Home
        </button>
      </div>
    </div>
  </div>
  );
};

export default Analytics;

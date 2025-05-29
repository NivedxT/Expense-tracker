import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../config/config';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import './Analytics.css'; // For styling analytics page

const Analytics = () => {
  const [userId, setUserId] = useState(null);
  const [monthlySpendData, setMonthlySpendData] = useState([]);
  const [highestSpendDay, setHighestSpendDay] = useState(null);
  const [averageMonthlySpend, setAverageMonthlySpend] = useState(0);
  const navigate = useNavigate();

  // Fetch current user ID
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        navigate('/'); // Redirect to login if not authenticated
      }
    });
  }, [auth, navigate]);

  // Fetch expenses and process data
  useEffect(() => {
    const fetchAndProcessExpenses = async () => {
      if (!userId) return;

      try {
        const expensesRef = collection(db, 'expenses');
        const q = query(expensesRef, where('userId', '==', userId));
        const querySnapshot = await getDocs(q);

        const expenses = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          amount: parseFloat(doc.data().amount), // Ensure amount is number
          date: new Date(doc.data().date), // Convert date string to Date object
        }));

        // 1. Month-wise Spend
        const monthlySpends = expenses.reduce((acc, expense) => {
          const monthYear = expense.date.toLocaleString('default', { month: 'short', year: 'numeric' });
          acc[monthYear] = (acc[monthYear] || 0) + expense.amount;
          return acc;
        }, {});

        const sortedMonths = Object.keys(monthlySpends).sort((a, b) => {
          const dateA = new Date(a);
          const dateB = new Date(b);
          return dateA - dateB;
        });

        const chartData = sortedMonths.map(month => ({
          month,
          spend: monthlySpends[month].toFixed(2),
        }));
        setMonthlySpendData(chartData);

        // 2. Highest Spend in a Day
        const dailySpends = expenses.reduce((acc, expense) => {
          const dayString = expense.date.toISOString().split('T')[0]; // YYYY-MM-DD
          acc[dayString] = (acc[dayString] || 0) + expense.amount;
          return acc;
        }, {});

        let highestDay = { date: null, amount: 0 };
        for (const day in dailySpends) {
          if (dailySpends[day] > highestDay.amount) {
            highestDay = { date: day, amount: dailySpends[day].toFixed(2) };
          }
        }
        setHighestSpendDay(highestDay);

        // 3. Average Spend by Month
        const totalOverallSpend = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const numberOfMonths = Object.keys(monthlySpends).length;
        if (numberOfMonths > 0) {
          setAverageMonthlySpend((totalOverallSpend / numberOfMonths).toFixed(2));
        } else {
          setAverageMonthlySpend(0);
        }

      } catch (error) {
        console.error('Error fetching or processing expenses:', error);
      }
    };

    fetchAndProcessExpenses();
  }, [userId]); // Re-run when userId changes

  return (
    <div className="analytics-container emoji-bg">
      <div className="analytics-content">
        <h2 className="analytics-title">💰 Expense Analytics</h2>

        <div className="analytics-summary">
          <div className="summary-card">
            <h3>Highest Spend Day</h3>
            {highestSpendDay && highestSpendDay.date ? (
              <p>
                ₹{highestSpendDay.amount} on {new Date(highestSpendDay.date).toLocaleDateString()}
              </p>
            ) : (
              <p>No data</p>
            )}
          </div>
          <div className="summary-card">
            <h3>Average Monthly Spend</h3>
            <p>₹{averageMonthlySpend}</p>
          </div>
        </div>

        <div className="chart-section">
          <h3>Month-wise Spend</h3>
          {monthlySpendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={monthlySpendData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis dataKey="month" tick={{ fill: '#333' }} />
                <YAxis tickFormatter={(value) => `₹${value}`} tick={{ fill: '#333' }} />
                <Tooltip formatter={(value) => [`₹${value}`, 'Spend']} />
                <Legend />
                <Bar dataKey="spend" fill="#8884d8" name="Monthly Spend" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p>No monthly spend data available.</p>
          )}
        </div>

        <button className="back-button" onClick={() => navigate('/home')}>
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default Analytics;
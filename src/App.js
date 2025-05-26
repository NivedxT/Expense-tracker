import './App.css';
import React, { use, useEffect, useState } from 'react';
import {  Routes, Route } from 'react-router-dom';
import Login from './login/login'; // adjust if the path is different
import Home from './home/home'; 
import AddExpense from './components/AddExpense';
import ViewExpenses from './components/ViewExpenses';
import EditExpenses from './components/EditExpenses';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './config/config';

function App() {
  const[IsLoggedIn, setIsLoggedIn] = useState(false);
useEffect(()=>{
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/auth.user
      const uid = user.uid;
      setIsLoggedIn(true);
      // ...
    } else {
      setIsLoggedIn(false)

    }
  });
},[auth])


  return (
    <div>
      <Routes>
  {IsLoggedIn ? (
    <>
      <Route path="/" element={<Home />} />
      <Route path="/add-expense" element={<AddExpense />} />
      <Route path="/view-expenses" element={<ViewExpenses />} />
      <Route path="/edit-expenses" element={<EditExpenses />} />
    </>
  ) : (
    <Route path="/" element={<Login />} />
  )}
</Routes>

    
    </div>
  );

  }
export default App;


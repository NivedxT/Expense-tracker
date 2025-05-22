import './App.css';
import React, { use, useEffect, useState } from 'react';
import {  Routes, Route } from 'react-router-dom';
import Login from './login/login'; // adjust if the path is different
import Home from './home/home'; 
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
        {IsLoggedIn?(<Route path="/" element={<Home />} />):
        <Route path="/" element={<Login />} />}
  
      </Routes>

    
    </div>
  );

  }
export default App;


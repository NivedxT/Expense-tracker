import React from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css'; // Import the CSS file
import characterImage from './assets/test-image.png';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { app, auth } from '../config/config';



export default function Login() {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          // Signed in 
          navigate('/');
          // ...
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
        });
    }

    return (
      
      <div className="login-container">
      
      
        <form onSubmit={handleSubmit}  className="login-form">
        <div className="image-section">
          
    <img src={characterImage} alt="Cute Character" />
  </div>
            <h1>Email Login</h1>
            <h2  className='demo-style'>Enter your Email</h2>
            <div>
                <label htmlFor="username">Username:</label>
                <input
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    type="email"
                    id="username"
                    name="username"
                />
            </div>
            
            <div>
                <label htmlFor="Password">Password:</label>
                <input
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    type="password"
                    id="Password"
                    name="password"
                />
            </div>
            <button>Login</button>
        </form>
        
</div>
    );
}

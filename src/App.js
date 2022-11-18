import logo from './logo.svg';
import './App.css';
import SimpleForm from './Form';
import React from 'react';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <SimpleForm />
      </header>
    </div>
  );
}

export default App;

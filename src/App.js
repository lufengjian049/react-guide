import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import NewContext from './NewContext'

class App extends Component {
  render() {
    return (
      <div className="App">
        <NewContext />
      </div>
    );
  }
}

export default App;

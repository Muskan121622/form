// src/App.tsx
//import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from "../src/pages/home"
import Login from '../src/pages/login';
import Signup from '../src/pages/signup';

import FormWrapper from '../src/pages/formwrapper';

//import Page3 from '../src/pages/page3';
function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login/>} />
      <Route path="/signup" element={<Signup />} />
       <Route path="/page2" element={<FormWrapper />} />
        {/* <Route path="/page3" element={<Page3 />} /> */}
        <Route path="/page1" element={<FormWrapper />} /> {/* Use wrapper */}
    </Routes>
  );
}

export default App;

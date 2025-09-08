import { useState } from 'react'
import LichLamViec from './lichLamViec'
import './App.css'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
function App() {

  return (
    <>
      <LichLamViec />
      <ToastContainer position="top-right" autoClose={3000} />



    </>
  )
}

export default App

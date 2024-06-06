import React from 'react'
import ReactDOM from 'react-dom/client'
import { MainApp } from './App.tsx'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { RecoilRoot } from 'recoil'
const Login = React.lazy(() => import('./Routes/Login.tsx'));
const Room = React.lazy(() => import('./Routes/Room.tsx'));
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <RecoilRoot>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/room" element={<Room />} />
      </Routes>
    </BrowserRouter>
  </RecoilRoot>
)

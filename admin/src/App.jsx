import React, { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import Navbar from './components/sidebar/Navbar/Navbar'
import Sidebar from './components/sidebar/Sidebar'
import { Routes, Route, Navigate } from 'react-router-dom'
import Add from './pages/Add/Add'
import List from './pages/List/List'
import Orders from './pages/Orders/Orders'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { url } from './assets/assets'
import AdminLogin from './pages/Login/Login'
import Restaurants from './pages/Restaurants/Restaurants'
import Dashboard from './pages/Dashboard/Dashboard'

const App = () => {
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('adminToken') || '')
  const signOut = useCallback(() => {
    localStorage.removeItem('adminToken')
    setAdminToken('')
  }, [])

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 && localStorage.getItem('adminToken')) {
          signOut()
        }
        return Promise.reject(error)
      }
    )
    return () => axios.interceptors.response.eject(interceptor)
  }, [signOut])

  if (!adminToken) {
    return <AdminLogin url={url} onLogin={(token) => {
      localStorage.setItem('adminToken', token)
      setAdminToken(token)
    }} />
  }

  return (
    <div className="admin-app">
      <ToastContainer/>
      <Navbar onLogout={signOut} />
      <div className="app-content">
        <Sidebar />
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard url={url} token={adminToken} />} />
          <Route path="/add" element={<Add url={url} token={adminToken} />} />
          <Route path="/list" element={<List url={url} token={adminToken} />} />
          <Route path="/restaurants" element={<Restaurants url={url} token={adminToken} />} />
          <Route path="/orders" element={<Orders url={url} token={adminToken} />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './App.css'
import Auth from './components/auth/Auth'
import Header from './components/Header/Header';
import { API_Encryption } from './api/endpoints/API_Encryption';

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {

  }, [])

  const router = createBrowserRouter([
    {
      path: '/auth',
      element: <Auth />
    },
  ])

  return (
    <div className='App'>
      <Header /> 
      {
        isLoading &&
        <div className="loading-animation">
        <div className="spinner"></div>
      </div>
      }
      {
        !isLoading && error.length > 0 &&
        <div className="error-message"><h1>{error}</h1></div>
      }
      {
        !isLoading && error.length == 0 &&
        <RouterProvider router={router} />
      }

    </div>
  );
}

export default App;

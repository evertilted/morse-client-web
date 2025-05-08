import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './App.css'
import Auth from './components/auth/Auth'
import Header from './components/Header/Header';
import Workspace from './components/Workspace/Workspace';
import { ProtectedRoute } from './components/ProtectedComponent/ProtectedComponent';
import { API_User } from './api/endpoints/API_User';

type UserData = {
  login: string | null,
  accessToken: string | null
}

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const [user, setUser] = useState<UserData>({ login: null, accessToken: null })

  useEffect(() => {
    async function validateJWT() {
      let login = localStorage.getItem('login')
      let accessToken = localStorage.getItem('accessToken')

      if (login && accessToken) {
        try {
          console.log('Trying to validate the access key')
          const response = await API_User.ValidateJWT()
          setUser({ login: localStorage.getItem('login'), accessToken: localStorage.getItem('accessToken') })
          console.log(`Restored session as ${login}`)
        }
        catch {
          console.log('The access token is invalid')
        }
        finally {
          setIsLoading(false)
        }
      }
      else {
        setIsLoading(false)
      }
    }
    validateJWT()
  }, [])

  const router = createBrowserRouter([
    {
      path: '/',
      element: (
        <ProtectedRoute>
          <Workspace />
        </ProtectedRoute>
      )
    },
    {
      path: '/auth',
      element: <Auth />
    },
  ])

  return (
    <div className='App'>
      <Header login={user.login} /> 
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

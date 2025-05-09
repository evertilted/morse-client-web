import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './App.css'
import Auth from './components/auth/Auth'
import Header from './components/Header/Header';
import Workspace from './components/Workspace/Workspace';
import { ProtectedRoute } from './components/ProtectedComponent/ProtectedComponent';
import { API_Security_User } from './api/endpoint_implementations/API_Security_User';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { service_hubs } from './api/api-config';
import { ChildProcessWithoutNullStreams } from 'child_process';

type UserData = {
  id: number | null,
  login: string | null,
  accessToken: string | null
}

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const [user, setUser] = useState<UserData>({ id: null, login: null, accessToken: null })

  useEffect(() => {
    async function validateJWT() {
      let login = localStorage.getItem('login')
      let userId = localStorage.getItem('userId')
      let accessToken = localStorage.getItem('accessToken')

      if (userId && login && accessToken) {
        try {
          console.log('Trying to validate the access key')
          const response = await API_Security_User.ValidateJWT()
          setUser({ id: parseInt(userId), login: login, accessToken: accessToken })
          console.log(`Restored session as ${login} (#${userId})`)
        }
        catch {
          localStorage.setItem('accessToken', '')
          console.log('The access token is invalid')
        }
      }
    }

    validateJWT()

    if (!error) {
      setIsLoading(false)
    }
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

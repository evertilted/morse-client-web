import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './App.css'
import Auth from './components/auth/Auth'
import Header from './components/Header/Header';

const router = createBrowserRouter([
  {
    path: '/auth',
    element: <Auth />
  },
])

function App() {
  return (
    <div className='App'>
      <Header />
      <RouterProvider router={router} />
    </div>
  );
}

export default App;

import { useNavigate } from 'react-router-dom'
import './Header.css'
import { useEffect } from 'react'

type HeaderProps = {
  login: string | null
}

function Header({ login }: HeaderProps) {
  useEffect(() => {
    console.log('w')
  }, [login])

  const LogOut = () => {
    localStorage.removeItem('userId')
    localStorage.removeItem('login')
    localStorage.removeItem('accessToken')
    window.location.reload()
  }

  return (
    <div className='Header'>
      <h1 className='Header_h1'>morse</h1>
        {
          login != null &&
          <button onClick={() => LogOut()} className='Header_log-out-button'>Log out</button>
        }
      </div>
  );
}

export default Header;

import { useEffect, useState } from 'react'
import '../../api/endpoint_implementations/API_Security_User'
import '../../App.css'
import './Auth.css'
import { API_Security_User } from '../../api/endpoint_implementations/API_Security_User'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

type AuthErrorFields = {
  login: boolean;
  password: boolean;
};

type AuthMode = 'login' | 'register';

const Auth = () => {
  const navigate = useNavigate()

  const [credentials, setCredentials] = useState({
    login: '',
    password: ''
  });
  const [errorFields, setErrorFields] = useState<AuthErrorFields>({
    login: false,
    password: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (localStorage.getItem('accessToken')) {
      navigate('/')
    }
  }, [])

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = event.target;
    const fieldName = id.replace('credential_', '') as keyof AuthErrorFields;

    if (errorFields[fieldName]) {
      setErrorFields(prev => ({ ...prev, [fieldName]: false }));
    }

    setCredentials(prev => ({ ...prev, [fieldName]: value }));
  };

  const validateCredentials = (): boolean => {
    const errors = {
      login: credentials.login.length === 0,
      password: credentials.password.length === 0
    };

    setErrorFields(errors);
    
    if (errors.login || errors.password) {
      setTimeout(() => setErrorFields({ login: false, password: false }), 1000);
      return false;
    }
    
    return true;
  };

  const handleAuth = async (mode: AuthMode) => {
    if (!validateCredentials()) return;
    
    setAuthError('');
    setIsLoading(true);

    try {
      const response = (mode === 'login') 
        ? await API_Security_User.Login(credentials) 
        : await API_Security_User.Register(credentials) 

      localStorage.setItem('login', response.login);
      localStorage.setItem('userId', response.id)
      localStorage.setItem('accessToken', response.accessToken.token);
      navigate('/');
    } catch (error) {
      handleAuthError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthError = (error: unknown) => {
    if (axios.isAxiosError(error)) {
      setAuthError(error.response?.data ?? 'Unexpected authentication error');
    } else {
      setAuthError('An unexpected error occurred');
    }
  };

  return (
    <div className='Auth_outer-box'>
      {
        isLoading && 
        <div className="loading-animation Auth_loading-animation">
          <div className="spinner"></div>
        </div>
      }
      {
        authError &&
        <div className="Auth_status-box Auth_status-box_error">
          <p className="Auth_error-message">{authError}</p>
        </div>
      }

      <div className="Auth_form">
        <h2 className="Auth_form-title">Please sign in</h2>
        <div className="Auth_inputs-box">
          <input
            type="text"
            id="credential_login"
            name="login"
            placeholder="Your login"
            className={`Auth_input-text ${errorFields.login ? 'input-error' : ''}`}
            onChange={handleInputChange}
            value={credentials.login}
          />
          
          <input
            type="password"
            id="credential_password"
            name="password"
            placeholder="Your password"
            className={`Auth_input-text ${errorFields.password ? 'input-error' : ''}`}
            onChange={handleInputChange}
            value={credentials.password}
          />
        </div>
        
        <button 
          onClick={() => handleAuth('login')} 
          className="Auth_sign-in-button"
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Sign in!'}
        </button>
        
        <button 
          onClick={() => handleAuth('register')} 
          className="Auth_register-button"
          disabled={isLoading}
        >
          Register
        </button>
      </div>
    </div>
  );
};

export default Auth;
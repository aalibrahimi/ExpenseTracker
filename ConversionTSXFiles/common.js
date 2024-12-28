// hooks/useDarkMode.ts
import { useEffect, useState } from 'react';

export const useDarkMode = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => 
    localStorage.getItem('darkMode') === 'enabled'
  );

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    
    localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
  }, [isDarkMode]);

  return [isDarkMode, setIsDarkMode] as const;
};

// hooks/useAuth.ts
export const useAuth = () => {
  const isAuthenticated = () => {
    return !!document.cookie.match(/session=([^;]+)/);
  };

  return { isAuthenticated };
};

// components/DarkModeToggle.tsx
import { useDarkMode } from '../hooks/useDarkMode';

export const DarkModeToggle: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useDarkMode();

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDarkMode(!isDarkMode);
  };

  return (
    <button 
      onClick={handleToggle}
      className="dark-mode-toggle"
      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
    >
      {isDarkMode ? '🌞' : '🌙'}
    </button>
  );
};

// components/AuthForms.tsx
import { useState } from 'react';

export const AuthForms: React.FC = () => {
  const [isLoginVisible, setIsLoginVisible] = useState(true);

  const toggleForm = () => {
    setIsLoginVisible(!isLoginVisible);
  };

  return (
    <div className="auth-forms">
      <div 
        id="loginForm" 
        style={{ display: isLoginVisible ? 'block' : 'none' }}
      >
        {/* Login form content */}
        <form>
          {/* Your login form fields */}
        </form>
        <p>
          Don't have an account?{' '}
          <button onClick={toggleForm} className="link-button">
            Sign up
          </button>
        </p>
      </div>

      <div 
        id="registerForm" 
        style={{ display: isLoginVisible ? 'none' : 'block' }}
      >
        {/* Registration form content */}
        <form>
          {/* Your registration form fields */}
        </form>
        <p>
          Already have an account?{' '}
          <button onClick={toggleForm} className="link-button">
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

// utils/types.ts
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

export interface User {
  id: string;
  email: string;
  username: string;
}

// styles/DarkMode.css
// Add this to your CSS files
// ```css
// :root {
//   --bg-light: #ffffff;
//   --text-light: #000000;
//   --bg-dark: #1a1a1a;
//   --text-dark: #ffffff;
// }

// body {
//   background-color: var(--bg-light);
//   color: var(--text-light);
//   transition: background-color 0.3s ease, color 0.3s ease;
// }

// body.dark-mode {
//   background-color: var(--bg-dark);
//   color: var(--text-dark);
// }

// .link-button {
//   background: none;
//   border: none;
//   color: inherit;
//   text-decoration: underline;
//   cursor: pointer;
//   padding: 0;
//   font: inherit;
// }

// .dark-mode-toggle {
//   padding: 0.5rem;
//   border-radius: 50%;
//   border: none;
//   background: transparent;
//   cursor: pointer;
//   transition: transform 0.15s ease;
// }

// .dark-mode-toggle:hover {
//   transform: scale(1.1);
// }
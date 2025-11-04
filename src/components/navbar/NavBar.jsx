import React from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../supabase/supabaseClient';

const NavBar = ({ user, setUser }) => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <header className="navbar">
      <div className='left-navbar'>
        <h1>Gebeya.net</h1>
      </div>

      <div className='right-navbar'>
        <ul>
          <li><Link to="/">Products</Link></li>
          
          {user ? (
            <>
              <li><Link to="/cart">My Cart</Link></li>
              <li>
                <button onClick={handleLogout}>Logout</button>
              </li>
              <li><Link to="/profile">Profile</Link></li>
            </>
          ) : (
            <>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Register</Link></li>
            </>
          )}
        </ul>
      </div>
    </header>
  );
};

export default NavBar;

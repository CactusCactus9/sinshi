import React, { useState } from 'react';
import './Navbar.css';
import { Link, useLocation } from 'react-router-dom';

import { HiOutlineHome } from "react-icons/hi2";
import { IoPersonOutline } from "react-icons/io5";
import { PiPingPongLight } from "react-icons/pi";
import { IoPeopleOutline } from "react-icons/io5";
import { BsChatDots } from "react-icons/bs";
import { AiOutlineSetting } from "react-icons/ai";
import { TbLogout2 } from "react-icons/tb";
import { FaBars } from "react-icons/fa";
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  const [menuOpen, setMenuOpen] = useState(false);


  const getIconStyle = () => ({
    color: '#BBFC52',
    fontSize: '20px',
  });

  return (
    <nav className="navbar">
      <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
        <FaBars />
      </div>
      <ul className={`nav-items ${menuOpen ? 'open' : ''}`}>
        <img src={user ? user.avatar : ''} alt='Banner' className='img-profile'/>
        <p className='username'>{user ? user.username : "name" }</p>
        <li className="nav-item">
          <Link to="/home" className={location.pathname === '/home' ? 'active' : ''}>
            <HiOutlineHome style={getIconStyle()} /> Home
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/profile" className={location.pathname === '/profile' ? 'active' : ''}>
            <IoPersonOutline style={getIconStyle()} /> Profile
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/chat" className={location.pathname === '/chat' ? 'active' : ''}>
            <BsChatDots style={getIconStyle()} /> Chat
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/game" className={location.pathname === '/game' ? 'active' : ''}>
            <PiPingPongLight style={getIconStyle()} /> Game
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/friends" className={location.pathname === '/friends' ? 'active' : ''}>
            <IoPeopleOutline style={getIconStyle()} /> Friends
          </Link>
        </li>
        <div className="spacer"></div>
        <li className="nav-item">
          <Link to="/settings" className={location.pathname === '/settings' ? 'active' : ''}>
            <AiOutlineSetting style={getIconStyle()} /> Settings
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/logout" className={location.pathname === '/logout' ? 'active' : ''}>
            <TbLogout2 style={getIconStyle()} /> Logout
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
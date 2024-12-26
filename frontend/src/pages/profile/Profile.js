import React, { useState, useEffect } from 'react';
import Banner from '../../components/Banner';
import './Profile.css';
import Profileimg from './profile.jpg';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
// import Imgp from './imgp.jpg';

import { IoPersonOutline } from "react-icons/io5";
import { BsChatDots } from "react-icons/bs";
import { IoEllipse } from "react-icons/io5";

import { FaMedal, FaTrophy, FaStar } from 'react-icons/fa';
import axios from 'axios';
// import { Outlet } from 'react-router-dom';

const Profile = () => {
    const [listFriends, setListFriends] = useState([]);
    useEffect(() => {
      axios.get('http://localhost:8000/friends/allfriends/')
          .then((response) => {
              setListFriends(response.data);
          })
          .catch((err) => {
              console.log(err);
          });
  },[]);

    const gameHistory = [
      { id: 1, img: Profileimg, result: 'Win', level: '5.00'},
      { id: 2, img: Profileimg, result: 'Lose', level: '4.50'},
      { id: 3, img: Profileimg, result: 'Win', level: '5.00'},
      { id: 4, img: Profileimg, result: 'Lose', level: '3.80'},
      { id: 5, img: Profileimg, result: 'Win', level: '4.20'}
    ];

    const achievements = [
      { id: 1, icon: <FaMedal />, title: 'First Win', description: 'Won your first game!' },
      { id: 2, icon: <FaTrophy />, title: 'Level 10', description: 'Reached level 10.' },
      { id: 3, icon: <FaStar />, title: 'MVP', description: 'Awarded Most Valuable Player in 3 games.' },
      { id: 4, icon: <FaMedal />, title: '10 Games Played', description: 'Participated in 10 games.' }
    ];

  const navigate = useNavigate();
  const { user } = useAuth();

  const handleEditClick = () => {
    navigate('/settings');
  }

  return (  
    <div>
      <Banner />
      <div className="content-profile">
          <h1 className='title-profile'>Profile</h1>
            <div className="info-profile">
              <div className="user-name"> 
                <img src={user ? user.avatar : ''} alt='Profileimg' className="profile-photo"/>
                <div className="name-status">
                  {user ? user.username : 'Loading'}  
                  <div className="status">
                  <IoEllipse className="profile-status-icon"/><span>{user ? user.status : 'Loading'}</span>
                  </div>
                </div>              
              </div>
              <div className="level">
                <div className="level-bar">
                <div className="level-fill" style={{ width: '70%' }}> <div className="my-level">lvl: {user ? user.level : ''}</div></div>
              </div>
                <div className="edit" onClick={handleEditClick}>
                  <div className="text-edit">Edit</div>
                </div>
            </div>
            </div>
        <div className="infos">
          <div className="info-group">
            <h1 className='titles-profile'>Friends</h1>
            <div className="info-friends">
              <ul className="friends-list">
              {listFriends.map(friend => (
                  <li key={friend.id} className="friend-item">
                    <img src={friend.avatar} alt={friend.username} className="friend-photo" />
                    <div className="friend-details">
                      <span className="friend-name">{friend.username}</span>
                      <div className="friend-message">
                        <IoEllipse 
                        style={{ 
                          color: friend.status === 'Online' ? '#BBFC52' : '#E84172' 
                        }} 
                        className="profile-status-icon" 
                      />
                        <span>{friend.status}</span>
                      </div>
                    </div>
                    <div className="friend-icons">
                        <Link className="icon" to={`/profile/${friend.id}`}>< IoPersonOutline /></Link>
                        <Link className="icon" to={`/chat`}><BsChatDots /></Link>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="info-group">
            <h1 className='titles-profile'>History</h1>
            <div className="info-history">
              <ul className="history-list">
                {gameHistory.map(game => (
                  <li key={game.id} className="history-item">
                    <img src={game.img} alt="Game History" className="history-profile" />
                    <span
                      className="history-result"
                      style={{ color: game.result === 'Win' ? '#D8FD62' : '#E84172' }}>
                      {game.result}
                    </span>
                    <span className="history-level">Level: {game.level}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="info-group">
            <h1 className='titles-profile'>Achievement</h1>
            <div className="info-achievement">
              <ul className="achievement-list">
                  {achievements.map(achievement => (
                    <li key={achievement.id} className="achievement-item">
                      <span className="achievement-icon">{achievement.icon}</span>
                      <div className="achievement-details">
                        <span className="achievement-title">{achievement.title}</span>
                        <span className="achievement-description">{achievement.description}</span>
                      </div>
                    </li>
                  ))}
                </ul>
                {/* <div className="all-achievement-button" onClick={handleAllAchievementsClick}><div className="text-all-achievement">All Achievement</div></div> */}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Profile;

import React, {useState, useEffect} from 'react';
import Banner from '../../components/Banner';
import './Home.css';
import Profileimg from './profile.jpg';
import { IoEllipse } from "react-icons/io5";
import { IoPersonOutline } from "react-icons/io5";
import { BsChatDots } from "react-icons/bs";
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';



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

    const lastGame = [
      { id: 1,imgW: Profileimg, nameW: 'Bob', result: 'Won', imgL: Profileimg, nameL: 'Alice'},
      { id: 2,imgW: Profileimg, nameW: 'Bob', result: 'Won', imgL: Profileimg, nameL: 'Alice'},
      { id: 3,imgW: Profileimg, nameW: 'Bob', result: 'Won', imgL: Profileimg, nameL: 'Alice'},
    ] 

    const gameRank = [
      { id: 1, rank: '1', name: 'Alice', image: Profileimg,  level: 10.09},
      { id: 2, rank: '2', name: 'Johnson', image: Profileimg,  level: 6.59},
      { id: 3, rank: '3', name: 'Charlie', image: Profileimg,  level: 5.29},
    ]

    const navigate=useNavigate();
    const { user } = useAuth();

    // const handleFriendsDashClick =() =>{
    //   navigate('/Friends')
    // }
    // const handleProfileFrDash =() =>{
    //   navigate('/home/profileFriend')
    // }
    const handleChatFrDash =() =>{
      navigate('/chat')
    }

    // console.log("***********************")
    // console.log(user.avatar)

  return (
    <div className="dashboard-container">
      <Banner />
        {/* Search Bar */}
        {/* <div className="search-bar">
          <IoSearch className="search-icon" />
          <input type="text" placeholder="Search..." className="dash-text-search"/>
        </div> */}
        {/* Profile Info */}
        <div className="dashboard-profile">
              <div className="dash-user-name"> 
                <img src={user ? user.avatar : ''} alt='Profileimg' className="dash-profile-photo"/>
                <div className="dash-name-status">
                  {user ? user.username : ''}  
                  <div className="dash-status">
                  <IoEllipse className="dash-profile-status-icon"/><span>{user ? user.status : ''}</span>
                  </div>
                </div>              
              </div>
              <div className="dash-level">
                <div className="dash-level-bar">
                <div className="dash-level-fill" style={{ width: '70%' }}> <div className="dash-my-level">Level: {user ? user.level : ''} </div></div>
              </div>
            </div>
          {/* <img src={user ? user.avatar : ''} alt="Profile" className="profile-photo-dash" />
          <div className="profile-details">
            <div className='profile-details-name'> {user ? user.username : ''} </div>
            <div className='profile-details-lvl'>Level: 3.70</div>
          </div> */}
        </div>
          {/* Game Modes */}
          <div className='big-container'>
          {/* <h1 className='title-game-mode' >Game Modes</h1> */}
          <div className="game-modes">
            <div className="game-mode">
              <div className='play-modes'>Solo practice</div>
              <div><Link className="game-mode-button" to={`/home/SoloPractice/`}><button>Start</button></Link></div>
            </div>
            <div className="game-mode">
              <div className='play-modes'>Challenge a friend </div>
              <div><Link className="game-mode-button" to={`/home/ChallengeAFriend/`}><button>Start</button></Link></div>
            </div>
            <div className="game-mode">
              <div className='play-modes'>Tournament</div>
              <div><Link className="game-mode-button" to={`/home/TournamentLocal/`}><button>Start</button></Link></div>
            </div>
            <div className="game-mode">
              <div className='play-modes'> Play online</div>
              <div><Link className="game-mode-button" to={`/home/Online/`}><button>Start</button></Link></div>
            </div>
          </div>
          
          <div className="game-rank-last">
          <div>
            {/* Last Game */}
            <h1 className='titles-dashboard'><div className='title-dash-last-game'>Last Game</div></h1>
            <div className="last-game">
              <ul className='list-last-game'>
                {lastGame.map(last =>(
                  <li key={last.id} className="last-game-item">
                    <div className='last-game-profile-name'>
                      <img src={last.imgW} alt="Last Game" className="game-photo-won"/>
                      <span className='last-game-name'>{last.nameW}</span>
                    </div>
                    <span className='last-game-result'>{last.result}</span>
                    <div className='last-game-profile-name'>
                      <img src={last.imgL} alt="Last Game" className="game-photo-lost"/>
                      <span className='last-game-name'>{last.nameL}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* {Game Rank} */}
          <div>
            <h1 className='titles-dashboard'><div className='title-dash'>Game Rank</div></h1>
            <div className="game-rank">
              <ul className="game-rank-list">
                {gameRank.map(rank => (
                  <li key={rank.id} className="rank-item">
                      <span className="rank-nb">{rank.rank}</span>
                      <img src={rank.image} alt={rank.name} className="rank-photo" />
                      <span className="rank-name">{rank.name}</span>
                      <span className="rank-level">{rank.level}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div>
            {/* Friends List */}
            <h1 className='titles-dashboard'><div className='title-dash'>Friends</div></h1>
            <div className="dashboard-friends">
              <ul className='dashboard-friends-list'>
                {listFriends.map(friend => (
                  <li key={friend.id} className="friend-item-dash">
                    <img src={friend.avatar} alt={friend.username} className="friend-photo-dash" />
                    <div className="friend-info-dash">
                      <span className='friend-name-dash'>{friend.username}</span>
                      <div className='friend-msg-dash'>
                      <IoEllipse 
                      style={{ 
                        color: friend.status === 'Online' ? '#BBFC52' : '#E84172' 
                      }} 
                      className="dash-status-icon" 
                    />
                      <span>{friend.status}</span>
                      </div>
                    </div>
                    <div className="friend-icons-dash">
                      <Link className="icon-dash" to={`/home/${friend.id}`}><IoPersonOutline /></Link>
                      <Link className="icon-dash" onClick={handleChatFrDash}><BsChatDots /></Link>
                    </div>
                  </li>
                ))}
              </ul>
              {/* <div className="all-friends-dash" onClick={handleFriendsDashClick}><div className="text-all-friends-dash">All Friends</div></div> */}
            </div>

          </div>
          </div>

      </div>

    </div>
  );
};

export default Profile;
import React 
from 'react';
import Banner from '../../components/Banner';
import './ProfileFriend.css';
import Profileimg from './profile.jpg';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useEffect , useState} from 'react';
// import Imgp from './imgp.jpg';
 
// import { IoPersonOutline } from "react-icons/io5";
// import { BsChatDots } from "react-icons/bs";
import { IoEllipse } from "react-icons/io5";

import { FaMedal, FaTrophy, FaStar } from 'react-icons/fa';
// import { IoMdAdd } from "react-icons/io";

const ProfileFriend = () => {

    const gameHistory = [
      { id: 1, img: Profileimg, result: 'Win', level: '5.00'},
      { id: 2, img: Profileimg, result: 'Lose', level: '4.50'},
      { id: 3, img: Profileimg, result: 'Win', level: '5.00'},
      { id: 4, img: Profileimg, result: 'Lose', level: '3.80'},
      { id: 5, img: Profileimg, result: 'Win', level: '4.20'},
      { id: 5, img: Profileimg, result: 'Win', level: '4.20'}
    ];

    const achievements = [
      { id: 1, icon: <FaMedal />, title: 'First Win', description: 'Won your first game!' },
      { id: 2, icon: <FaTrophy />, title: 'Level 10', description: 'Reached level 10.' },
      { id: 3, icon: <FaStar />, title: 'MVP', description: 'Awarded Most Valuable Player in 3 games.' },
      { id: 4, icon: <FaMedal />, title: '10 Games Played', description: 'Participated in 10 games.' },
      { id: 5, icon: <FaMedal />, title: '10 Games Played', description: 'Participated in 10 games.' }
    ];
    axios.defaults.withCredentials = true;
    const [friendDetails, setFriendDetails] = useState('');

  // const navigate = useNavigate();

  // const handleAddFriendClick = () => {
  //   // navigate('/settings');
  // }
  // const handleBlockClick = () => {
  //   // navigate('/settings');
  // }

  // const handleAddClick = () => {
  //   // navigate('/Add');
  // };


  // const handleFriendsClick = () => {
  //   navigate('/friends');
  // };
  // const handleAllAchievementsClick = () => {
  //    window.location.href = '/achievements';
  // };

  // const fetchFriendDetails = async () => {
  //     try {
  //         const response = await axios.get(`http://localhost:8000/frienduser/${userId}/`, {
  //         });
  //         setFriendDetails(response.data);
  //     } catch (error) {
  //         console.error('Error fetching friend details:', error);
  //         // setError(error);
  //     }
  // };
  // fetchFriendDetails();
  const { userId } = useParams();
  useEffect(() => {
    axios.get(`http://localhost:8000/friends/frienduser/${userId}/`)
            .then((response) => {
                setFriendDetails(response.data);
                console.log("-----------------------");
                console.log(response.data);
            })
            .catch((err) => {
                console.log(err);
            });

}, [userId]);
  return (
    <div>
      <Banner />
      <div className="friend-content-profile">
          <h1 className='friend-title-profile'>Profile</h1>
            <div className="friend-info-profile">
              <div className="friend-user-name"> 
                <img src={friendDetails ? friendDetails.avatar : ''} alt='Profileimg' className="friend-profile-photo"/>
                <div className="friend-name-status">
                  {friendDetails ? friendDetails.username : ''}
                  <div className="friend-status">
                    <IoEllipse 
                      style={{ 
                        color: friendDetails && friendDetails.status === 'Online' ? '#BBFC52' : '#E84172' 
                      }} 
                      className="friend-status-icon" 
                    />
                  <span>{friendDetails ? friendDetails.status : ''}</span>
                  </div>
                </div>
              </div>
              <div className="friend-level">
                <div className="friend-level-bar">
                <div className="friend-level-fill" style={{ width: '70%' }}> <div className="friend-my-level">Level: {friendDetails ? friendDetails.level : ''} </div></div>
              </div>
            </div>
            </div>
        <div className="friend-infos">
          {/* <div className="friend-info-group">
            <p className='friend-titles-profile'>Friends</p>
            <div className="friend-info-friends">
              <ul className="friend-friends-list">
              {friends.map(friend => (
                  <li key={friend.id} className="friend-friend-item">
                    <img src={friend.image} alt={friend.name} className="friend-friend-photo" />
                    <div className="friend-friend-details">
                      <span className="friend-friend-name">{friend.name}</span>
                      <span className="friend-friend-message">{friend.message}</span>
                    </div>
                    <div className="friend-friend-icons">
                        <Link className="friend-icon-profile" to={`/profile/${friend.id}`}>{friend.profile}</Link>
                        <span className="friend-icon-add" onClick={handleAddClick}>{friend.add}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div> */}
          <div className="friend-info-group">
            <h1 className='friend-titles-profile-hi'>History</h1>
            <div className="friend-info-history">
              <ul className="friend-history-list">
                {gameHistory.map(game => (
                  <li key={game.id} className="friend-history-item">
                    <img src={game.img} alt="Game History" className="friend-history-profile" />
                    <span
                      className="friend-history-result"
                      style={{ color: game.result === 'Win' ? '#D8FD62' : '#E84172' }}>
                      {game.result}
                    </span>
                    <span className="friend-history-level">Level: {game.level}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="friend-info-group">
            <h1 className='friend-titles-profile-ach'>Achievement</h1>
            <div className="friend-info-achievement">
              <ul className="friend-achievement-list">
                  {achievements.map(achievement => (
                    <li key={achievement.id} className="friend-achievement-item">
                      <span className="friend-achievement-icon">{achievement.icon}</span>
                      <div className="friend-achievement-details">
                        <span className="friend-achievement-title">{achievement.title}</span>
                        <span className="friend-achievement-description">{achievement.description}</span>
                      </div>
                    </li>
                  ))}
                </ul>
                {/* <div className="friend-all-achievement-button" onClick={handleAllAchievementsClick}><div className="friend-text-all-achievement">All Achievement</div></div> */}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ProfileFriend;

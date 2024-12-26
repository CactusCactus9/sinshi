import React, { useState, useEffect } from 'react';
import './Friends.css';
import Banner from '../../components/Banner';
import { IoPersonOutline } from "react-icons/io5";
import { BsChatDots } from "react-icons/bs";
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { IoEllipse } from "react-icons/io5";
// import { IoEllipseOutline } from "react-icons/io5";


import axios from 'axios';

const Friends = () => {
    const [activeSection, setActiveSection] = useState('friends');
    const [allSuggestions, setAllSuggestions] = useState([]);
    const [allRequests, setAllRequests] = useState([]);
    const [allFriends, setAllFriends] = useState([]);
    const [invitations, setInvitations] = useState([]);
    const [pending, setPending] = useState({});
    
    axios.defaults.withCredentials = true;
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('http://localhost:8000/friends/allsuggestions/')
            .then((response) => {
                setAllSuggestions(response.data);
            })
            .catch((err) => {
                console.log(err);
            });
    }, [pending]);
    
    useEffect(() => {
        axios.get('http://localhost:8000/friends/allfriends/')
            .then((response) => {
                setAllFriends(response.data);
            })
            .catch((err) => {
                console.log(err);
            });
    }, [pending]);
    
    useEffect(() => {
        axios.get('http://localhost:8000/friends/invitations/')
        .then((response) => {
            setInvitations(response.data);
        })
        .catch((err) => {
            console.log(err);
        });
    }, [pending]);
  
    useEffect(() => {
        axios.get('http://localhost:8000/friends/requestssend/')
        .then((response) => {
            setAllRequests(response.data);
        })
        .catch((err) => {
            console.log(err);
        });
    }, [pending]);

    const handleChatClick = (friend) => {
        navigate('/chat');
    };

    const handleAcceptInvitation = (userId) => {
        axios.post(`http://localhost:8000/friends/accept/${userId}/`)
            .then(() => {
                setPending((prevState) => ({ ...prevState, [userId]: false }));
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const handleCancelInvitation = (userId) => {
        axios.post(`http://localhost:8000/friends/declinereceived/${userId}/`)
            .then(() => {
                setPending((prevState) => ({ ...prevState, [userId]: false }));
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const handleAddFriend = (userId) => {
        axios.post(`http://localhost:8000/friends/send/${userId}/`)
            .then(() => {
                setPending((prevState) => ({ ...prevState, [userId]: true }));
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const handleCancelRequest = (userId) => {
        axios.post(`http://localhost:8000/friends/declinesend/${userId}/`)
        .then(() => {
            setPending((prevState) => ({ ...prevState, [userId]: false }));
        })
        .catch((err) => {
            console.log(err);
        });
    };

    return (
        <div>
            <Banner />
            <div className="f-friends-page">
                <div className="f-section-toggle-container">
                    <div className="f-section-toggle-buttons">
                        <button 
                            className={`f-toggle-button ${activeSection === 'friends' ? 'active' : ''}`}
                            onClick={() => setActiveSection('friends')}
                        >
                            All Friends
                        </button>
                        <button 
                            className={`f-toggle-button ${activeSection === 'invitations' ? 'active' : ''}`}
                            onClick={() => setActiveSection('invitations')}
                        >
                            Invitations
                        </button>
                        <button 
                            className={`f-toggle-button ${activeSection === 'suggestions' ? 'active' : ''}`}
                            onClick={() => setActiveSection('suggestions')}
                        >
                            Suggestions
                        </button>
                        <button 
                            className={`f-toggle-button ${activeSection === 'requests' ? 'active' : ''}`}
                            onClick={() => setActiveSection('requests')}
                        >
                            Requests
                        </button>
                    </div>

                    {activeSection === 'friends' && (
                        <div className="f-section-content">
                            <div className="f-friends-section">
                                <ul className="f-friends-list">
                                    {allFriends.map(friend => (
                                        <li key={friend.id} className="f-friend-item">
                                            <img src={friend.avatar} alt={friend.name} className="f-friend-photo" />
                                            <div className="f-friend-details">
                                                <span className="f-friend-name">{friend.username}</span>
                                                <div className='f-friend-status'>
                                                <IoEllipse 
                                                  style={{ 
                                                    color: friend.status === 'Online' ? '#BBFC52' : '#E84172' 
                                                  }} 
                                                  className="f-friend-status-icon" 
                                                />
                                                  <span>{friend.status}</span>
                                                </div>
                                            </div>
                                            <div className="f-friend-icons">
                                                <Link className="f-icon" to={`/friends/${friend.id}`}><IoPersonOutline /></Link>
                                                <Link className="f-icon" onClick={() => handleChatClick(friend)}><BsChatDots /></Link>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {activeSection === 'invitations' && (
                        <div className="f-section-content">
                            <div className="f-invitations-section">
                                <ul className="f-invitations-list">
                                    {invitations.map(invite => (
                                        <li key={invite.id} className="f-invitation-item">
                                            <img src={invite.sender.avatar} alt={invite.name} className="f-invitation-photo" />
                                            <div className="f-invitation-details">
                                                <div><span className="f-invitation-name">{invite.sender.username}</span></div>
                                                <div><span className="f-invitation-message">Wants to be friends</span></div>
                                                <div className="f-invitation-buttons">
                                                    <div onClick={() => handleAcceptInvitation(invite.sender.id)} className="f-accept-button">Accept</div>
                                                    <div onClick={() => handleCancelInvitation(invite.sender.id)} className="f-cancel-button">Cancel</div>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {activeSection === 'suggestions' && (
                        <div className="f-section-content">
                            <div className="f-all-users-section">
                                <ul className="f-all-users-list">
                                    {allSuggestions.map(user => (
                                        <li key={user.id} className="f-all-users-item">
                                            <img src={user.avatar} alt={user.avatar} className="f-all-users-photo" />
                                            <div className="f-all-users-details">
                                                <span className="f-all-users-name">{user.username}</span>
                                                <div
                                                    onClick={() => handleAddFriend(user.id)}
                                                    className="f-add-friend-button"
                                                >
                                                    Add friend
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {activeSection === 'requests' && (
                        <div className="f-section-content">
                            <div className="f-requests-section">
                                <ul className="f-requests-list">
                                    {allRequests.map(user => (
                                        <li key={user.receiver.id} className="f-requests-item">
                                            <img src={user.receiver.avatar} alt={user.receiver.avatar} className="f-requests-photo" />
                                            <div className="f-requests-details">
                                                <span className="f-requests-name">{user.receiver.username}</span>
                                                <div
                                                    onClick={() => handleCancelRequest(user.receiver.id)}
                                                    className="f-cancel-friend-button"
                                                >
                                                    Cancel
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Friends;

import React, { useState, useEffect } from 'react';
import '../friends/Friends.css';
import Banner from '../../components/Banner';
import { IoPersonOutline } from "react-icons/io5";
import { Link } from 'react-router-dom';
import { IoEllipse } from "react-icons/io5";
// import { IoEllipseOutline } from "react-icons/io5";
import { useNotification } from '../../context/NotificationContext';


import axios from 'axios';

const GameRequest = () => {
    const [activeSection, setActiveSection] = useState('friends');
    const [allRequests, setAllRequests] = useState([]);
    const [allFriends, setAllFriends] = useState([]);
    const [invitations, setInvitations] = useState([]);
    const [pending, setPending] = useState({});
    const [friendStatuses, setFriendStatuses] = useState({});
    axios.defaults.withCredentials = true;
    // const navigate = useNavigate();
    const { addNotification } = useNotification();

    
    useEffect(() => {
        axios.get('http://localhost:8000/friends/allfriends/')
        .then((response) => {
            setAllFriends(response.data);
        })
    }, [pending]);
    
    useEffect(() => {
        axios.get('http://localhost:8000/game/invitationdetail/')
        .then((response) => {
            setInvitations(response.data);
        })
        .catch((err) => {
            console.log(err);
        });
    }, [pending]);
  
    useEffect(() => {
        axios.get('http://localhost:8000/game/senddetail/')
        .then((response) => {
            setAllRequests(response.data);
        })
        .catch((err) => {
            console.log(err);
        });
    }, [pending]);


    const handleAcceptInvitation = (userId) => {
        axios.post(`http://localhost:8000/game/accept/${userId}/`)
            .then(() => {
                setPending((prevState) => ({ ...prevState, [userId]: false }));
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const handleCancelInvitation = (userId) => {
        axios.post(`http://localhost:8000/game/declinereceived/${userId}/`)
            .then(() => {
                setPending((prevState) => ({ ...prevState, [userId]: false }));
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const handleInviteFriend = (userId) => {
        axios.post(`http://localhost:8000/game/send/${userId}/`)
            .then((response) => {
                if(response.status === 201){
                    console.log('***********^^^^^*******');
                    setPending((prevState) => ({ ...prevState, [userId]: true }));
                }
                else{
                    addNotification(response.data.status, "warning");
                }
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const handleCancelRequest = (userId) => {
        axios.post(`http://localhost:8000/game/declinesend/${userId}/`)
        .then(() => {
            setPending((prevState) => ({ ...prevState, [userId]: false }));
        })
        .catch((err) => {
            console.log(err);
        });
    };

    useEffect(() => {
        if (allFriends.length === 0){
            return;
        }
        allFriends.forEach(friend => {
            axios.get(`http://localhost:8000/game/checkgamerequeststatus/${friend.id}/`)
                .then((response) => {
                    setFriendStatuses(prevStatus => ({
                        ...prevStatus,
                        [friend.id]: response.data
                    }));
                })
            });
    }, [allFriends]);

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
                            className={`f-toggle-button ${activeSection === 'requests' ? 'active' : ''}`}
                            onClick={() => setActiveSection('requests')}
                        >
                            Requests
                        </button>
                    </div>

                    {activeSection === 'friends' &&(
                        <div className="f-section-content">
                            <div className="f-friends-section">
                                <ul className="f-friends-list">
                                    {allFriends.map(friend =>
                                    friendStatuses[friend.id]?.status === 'ko' && 
                                    (
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
                                                <Link className="f-icon" to={`${friend.id}`}><IoPersonOutline /></Link>
                                            </div>
                                            <div
                                                    onClick={() => handleInviteFriend(friend.id)}
                                                    className="f-add-friend-button"
                                                    style={{margin:0}}
                                                >Invite
                                            </div>
                                        </li>

                                        )
                                    )}
                                </ul>
                            </div>
                        </div>
                    )}
                    {/* {activeSection === 'friends' && pending &&(
                        <div className="f-section-content">
                            <div className="f-friends-section">
                                <div className="waitingMessage" style={{color: "white", fontSize:"30px"}}>
                                    <span>Already invited someone!</span>
                                </div>
                            </div>
                        </div>
                    )} */}

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

export default GameRequest;
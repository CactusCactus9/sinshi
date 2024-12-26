import React from 'react';
import { createBrowserRouter, RouterProvider, Outlet, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/home/Home';
import Profile from './pages/profile/Profile';
import ProfileFriend from './pages/ProfileFriend/ProfileFriend';
import Chat from './pages/chat/Chat';
import Game from './pages/game/Game';
import Friends from './pages/friends/Friends';
import Settings from './pages/settings/Settings';
import Logout from './pages/logout/Logout';
import SignIn from './pages/signin/SignIn';
import SignUp from './pages/signin/SignUp';
import { useAuth } from './context/AuthContext';
import LoginCallback from './pages/signin/LoginCallback';
import OAuthTwoFactorVerification from './components/OAuthTwoFactorVerification';
import TwoFactorVerification from './components/TwoFactorVerification';
import { NotificationProvider } from './context/NotificationContext';
import Notifications from './components/Notifications';

import "./App.css"

import Local from './pages/game/Local';
import RemoteGame from './pages/game/RemoteGame';
import SingleLocal from './pages/game/SingleLocal';
import TournamentLocal from './pages/game/TournamentLocal';
import Tournament from './pages/game/Tournament';
import OnePlayerGame from './pages/game/OnePlayerGame';
import TwoPlayersGame from './pages/game/TwoPlayersGame';
import OnePlayerScore from './pages/game/Score1player';
import TwoPlayersScore from './pages/game/Score2players';
import TourFinalScore from './pages/game/TourFinalScore';
import Online from './pages/game/GameRequest';

const AppContent = () => {
  const { islog } = useAuth();


  const router = createBrowserRouter([
    {
      path: "/",
      element: islog ? <Navigate to="/home" /> : <Outlet />,
      children: [
        { path: "", element: <SignIn /> },
        { path: "signIn", element: <SignIn /> },
        { path: "signUp", element: <SignUp /> },
        { path: "logincallback", element: <LoginCallback /> },
        { path: "verify-2fa-oauth", element: <OAuthTwoFactorVerification /> },
        { path: "verify-2fa", element: <TwoFactorVerification /> },
      ],
      errorElement: <Navigate to="/" />
    },
    {
      path: "/",
      element: islog ? (
        <>
          <Navbar />
          <div className="page-content">
            <Outlet />
          </div>
        </>
      ) : <Navigate to="/signIn" />,
      children: [
        {
          path: "home/*",
          children: [
            { path: "", element: <Home /> },
            { path: ":userId", element: <ProfileFriend /> },
            { path: "TournamentLocal", element: <TournamentLocal /> },
            { path: "SoloPractice", element: <OnePlayerGame /> },
            { path: "ChallengeAFriend", element: <TwoPlayersGame /> },
            {
              path: "Online/*",
              children: [
                { path: "", element: <Online /> },
                { path: ":userId", element: <ProfileFriend /> },
              ]
            },
          ]
        },
        {
          path: "profile/*",
          children: [
            { path: "", element: <Profile /> },
            { path: ":userId", element: <ProfileFriend /> },
          ]
        },
        {
          path: "friends/*",
          children: [
            { path: "", element: <Friends /> },
            { path: ":userId", element: <ProfileFriend /> },
          ]
        },
        { path: "chat", element: <Chat /> },
        {
          path: "game/*",
          children: [
            { path: "", element: <Game /> },
            {
              path: "Local/*",
              children: [
                { path: "", element: <Local /> },
                {
                  path: "SingleGame/*",
                  children: [
                    { path: "", element: <SingleLocal /> },
                    {
                      path: "SoloPractice/*",
                      children: [
                        { path: "", element: <OnePlayerGame /> },
                        { path: "Score", element: <OnePlayerScore /> },
                      ]
                    },
                    {
                      path: "ChallengeAFriend/*",
                      children: [
                        { path: "", element: <TwoPlayersGame /> },
                        { path: "Score", element: <TwoPlayersScore /> },
                      ]
                    },
                  ]
                },
                {
                  path: "TournamentLocal/*",
                  children: [
                    { path: "", element: <TournamentLocal /> },
                    {
                      path: "Tournament/*",
                      children: [
                        { path: "", element: <Tournament /> },
                        { path: "Results", element: <TourFinalScore /> },
                      ]
                    },
                  ]
                },
              ]
            },
            {
              path: "Online/*",
              children: [
                { path: "", element: <Online /> },
                { path: "play/:gameId", element: <RemoteGame /> },
                // { path: ":userId", element: <ProfileFriend /> },
              ]
            },
          ]
        },
        { path: "settings", element: <Settings /> },
        { path: "logout", element: <Logout /> },
        { path: "logincallback", element: <LoginCallback /> }
      ],
      errorElement: <Navigate to="/" />
    }
  ], {
    future: {
      v7_relativeSplatPath: true
    }
  });

  return (
    <>
      <Notifications />
      <RouterProvider router={router} />
    </>
  );
};

const App = () => {
  return (
    <NotificationProvider>
      <div className="app-container">
        <AppContent />
      </div>
    </NotificationProvider>
  );
};

export default App;
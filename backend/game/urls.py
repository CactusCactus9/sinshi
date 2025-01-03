from django.urls import path
from . import views

urlpatterns=[
    path('startgame/<int:id_player2>/', views.create_game_session, name='start_game'),
    # path('update-score/<int:gameId>/', views.update_score, name='update_score'),
    # path('abandon/<int:gameId>/', views.mark_game_abandonned, name='abandon_game'),
    # path('games-history/', views.get_games_list, name='games_list'),
    path('send/<int:to_user_id>/', views.SendRequestView.as_view(), name='send_request'),
    path('accept/<int:from_user_id>/', views.AcceptRequestView.as_view(), name='accept_request'),
    path('declinereceived/<int:from_user_id>/', views.DeclineRequestReceivedView.as_view(), name='decline_request_received'),
    path('declinesend/<int:to_user_id>/', views.DeclineRequestSendView.as_view(), name='decline_friend_send'),
    # path('acceptdetail/', views.RequestAcceptDetailView.as_view(), name='accept_detail'),
    path('invitationdetail/', views.InvitationDetailView.as_view(), name='invitation_detail'),
    path('senddetail/', views.RequestsSendDetailView.as_view(), name='send_detail'),
    path('checkgamerequeststatus/', views.checkGameRequestStatusView.as_view(), name='check_game_request_status'),
    path('checkgamerequeststatus/<int:user_id>/', views.checkGameRequestStatusView.as_view(), name='check_game_request_status'),
]

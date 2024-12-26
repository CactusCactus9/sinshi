# Create your views here.

# from django.shortcuts import render
# from django.http import HttpResponse, JsonResponse
# import json
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from .models import Game
# from API.models import User, UserProfile
from django.db.models import Q
from rest_framework.decorators import api_view, permission_classes
# from .serializers import GameSerializer
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Requestship, UserRequest, User
from rest_framework import status
from .serializers import RequestshipSerializer, UserSerializer



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_game(request):
    user = request.user
    game = Game.objects.create(player1=user, status='waiting')
    return Response({'game_id': game.id, 'message': 'ame created. Waiting for another player to join.'})

class SendRequestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, to_user_id):
        to_user = get_object_or_404(User, id=to_user_id)

        # if to_user == request.user:
        #     return Response(
        #         {"error": "Cannot send game request to yourself"},
        #         status=status.HTTP_400_BAD_REQUEST
        #     )
 
        # existing_request_sent = Requestship.objects.filter(
        #     (Q(sender=request.user) & Q(receiver=to_user)) 
        # ).first()

        # existing_request_received = Requestship.objects.filter(
        #     (Q(sender=to_user) & Q(receiver=request.user))
        # ).first()

        # if existing_request_sent:
        #         return Response(
        #             {'status': 'Request already sent'}, status=200
        #         )
        # if existing_request_received:
        #     return Response(
        #         {'status': 'You already have an invitation from this user'}, status=200
        #     )
        
        request_is_sended = Requestship.objects.filter(
            sender=request.user
        ).exists()

        if request_is_sended:
            return Response(
                {'status': 'Only one request can be sent unless you cancel it!'}, status=200
            )

        request_is_received = Requestship.objects.filter(
            receiver=request.user
        ).exists()

        if request_is_received:
            return Response(
                {'status': 'You are already invited to a game!'}, status=200
            )

        any_active_request = Requestship.objects.filter(
            Q(sender=to_user) | Q(receiver=to_user)
        ).exists()

        if any_active_request:
            return Response(
                {'status': 'This user already part in another game'}, status=200
            )
        requestship = Requestship.objects.create(
            sender=request.user,
            receiver=to_user,
            status=Requestship.PENDING
        )
        serializer = RequestshipSerializer(requestship)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    

class AcceptRequestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, from_user_id):

        sender_user = get_object_or_404(User, id=from_user_id)


        requestship = Requestship.objects.filter(
            sender=sender_user, receiver=request.user, status=Requestship.PENDING,
        ).first()

        if not requestship:
            return Response(
                {"error": "No pending request found from this user"},
                status=status.HTTP_404_NOT_FOUND
            )

        requestship.status = Requestship.ACCEPTED
        requestship.save()

        sender_request, _ = UserRequest.objects.get_or_create(user=requestship.sender)
        receiver_request, _ = UserRequest.objects.get_or_create(user=requestship.receiver)

        sender_request.requestships.add(requestship.receiver)
        receiver_request.requestships.add(requestship.sender)

        serializer = RequestshipSerializer(requestship)

        return Response(
            {"message": f"You can now start game with {requestship.sender.email}",
            "friendship": serializer.data},
            status=status.HTTP_200_OK
        )
    
class DeclineRequestReceivedView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, from_user_id):
        sender_user = get_object_or_404(User, id=from_user_id)

        requestship = Requestship.objects.filter(
            sender=sender_user, receiver=request.user, status=Requestship.PENDING,
        ).first()

        if not requestship:
            return Response(
                {"error": "No pending request found from this user"},
                status=status.HTTP_404_NOT_FOUND
            )

        requestship.delete()

        success_message = f"Request from {sender_user.email} has been removed"
        return Response(
            {"message": success_message},
            status=status.HTTP_200_OK
        )

class DeclineRequestSendView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, to_user_id):
        receiver_user = get_object_or_404(User, id=to_user_id)

        requestship = Requestship.objects.filter(
            receiver=receiver_user, sender=request.user, status=Requestship.PENDING,
        ).first()

        if not requestship:
            return Response(
                {"error": "No pending request found"},
                status=status.HTTP_404_NOT_FOUND
            )

        requestship.delete()

        success_message = f"Request to {receiver_user.email} has been removed"
        return Response(
            {"message": success_message},
            status=status.HTTP_200_OK
        )

# class RequestAcceptDetailView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request):
#         requestship = Requestship.objects.filter(
#             status=Requestship.ACCEPTED,
#         ).filter(
#             Q(sender=request.user) | Q(receiver=request.user)
#         )

#         data = [
#             {
#                 # "id": requestship.id,
#                 "sender": requestship.sender.id,
#                 "receiver": requestship.receiver.id,
#                 "status": requestship.status,
#             }
#         ]
#         return Response(data, status=status.HTTP_200_OK)
    
class InvitationDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        pending_invitations = Requestship.objects.filter(
            receiver=request.user, status=Requestship.PENDING
        )

        # if not pending_invitations.exists():
        #     return Response({"message": "No pending invitations"}, status=status.HTTP_404_NOT_FOUND)

        serializer = RequestshipSerializer(pending_invitations, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    
class RequestsSendDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        pending_invitations = Requestship.objects.filter(
            sender=request.user, status=Requestship.PENDING
        )

        serializer = RequestshipSerializer(pending_invitations, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)



# class checkGameRequestStatusView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request, user_id=None):
        
#         if user_id:
#             if request.user.id != user_id:
#                 user = get_object_or_404(User, id=user_id)
#             else:
#                 user = request.user
#         else:
#             user = request.user
        
#         checkstatus = Requestship.objects.filter( Q(receiver=user) | 
#                                                  Q(sender=user), Q(status=Requestship.PENDING) | 
#                                                  Q(status=Requestship.ACCEPTED)).exists()

#         if checkstatus:
#             return Response({'status': 'ok'}, status=200)
#         else:
#             return Response({'status': 'ko'}, status=200)


class checkGameRequestStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id=None):
        
        if user_id:
            user = get_object_or_404(User, id=user_id)
        
        checkstatus = Requestship.objects.filter( (Q(receiver=user) & Q(sender=request.user)) |
                                                 (Q(receiver=request.user) & Q(sender=user)), 
                                                 Q(status=Requestship.PENDING)).exists()

        if checkstatus:
            return Response({'status': 'ok'}, status=200)
        else:
            return Response({'status': 'ko'}, status=200)
        

# class UserGameStatusView(APIView):
#     permission_classes = [IsAuthenticated]

#     def get(self, request, user_id):
#         user = get_object_or_404(User, id=user_id)

#         requestship = Requestship.objects.filter(
#             sender=sender_user, receiver=request.user, status=Requestship.PENDING,
#         ).first()

#         if not requestship:
#             return Response(
#                 {"error": "No pending request found from this user"},
#                 status=status.HTTP_404_NOT_FOUND
#             )

#         requestship.delete()

#         success_message = f"Request from {sender_user.email} has been removed"
#         return Response(
#             {"message": success_message},
#             status=status.HTTP_200_OK
        # )

# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def create_game_session(request):
#     if request.method == 'POST':
#         player1 = request.user
#         player2 = request.data.get('player2')
#         if not all([player1, player2]):
#             return Response({'success':False, 'error':'Required fields are missing.'}, status=400)

#         if player1 == player2:
#             return Response ({"self-competition is not possible."}, status=400)
#         if Game.objects.filter(player1=player1, player2=player2, status="Active").exists():
#             return Response({"Game already Created" : True}, status=405)
#         try:
#             game = Game.objects.create(player1=player1, player2=player2)
#             serializer = GameSerializer(game)
#             return Response({
#                 'success': True,
#                 'game': serializer.data,
#             })
#         except Exception as e:
#             return Response({"success":False, "error":str(e)}, status=400)
#     return Response({"success":False, "error":"Invalid request method."}, status=405)


# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def update_score(request, gameId):
#     if request.method == 'POST':
#         player1_score = int(request.data.get('player1_score'))
#         player2_score = int(request.data.get('player2_score'))
#         if not all([player1_score, player2_score]):
#             return Response({'success':False, 'error':'Required fields are missing.'}, status=400)
#         try:
#             game = Game.objects.get(id = gameId, status="Active", Q(player1=request.user) | Q(player2=request.user))
#         except Game.DoesNotExist:
#             return Response({"success":False, "error":"game not found."}, status=404)
        
#         try:
#             game.update_score(player1_score, player2_score)
#             serializer = GameSerializer(game)
#             return Response({
#             'success': True,
#             'game': serializer.data,
#             })
#         except Exception as e:
#             return Response({"success":False, "error":str(e)}, status=400)
#     return Response({"success":False, "error":"Invalid request method."}, status=405)

# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def mark_game_abandonned(request, gameId): 
#     if request.method == 'POST':
#         #the winner in this game send the request
#         try:
#             game = Game.objects.get(id = gameId, status="Active", Q(player1=request.user) | Q(player2=request.user))
#             game.abandon_game(request.user) 
#         except Game.DoesNotExist:
#             return Response({"success":False, "error":"game not found."}, status=404)
#     return Response({"success":False, "error":"Invalid request method."}, status=405)


# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def get_games_list(request): #get list of games played by a user
#     if request.method == 'GET':
#         try:
#             games = Game.objects.filter(Q(player1 = request.user) | Q(player2 = request.user), status="Completed").order_by('-id')[:20]
#             serializer = GameSerializer(games, many=True)
#             return Response(serializer.data)
#         except Game.DoesNotExist:
#             return Response({"success":False, "error":"No available games history for this user."}, status=404)
#     return Response({"success":False, "error":"Invalid request method."}, status=405)




























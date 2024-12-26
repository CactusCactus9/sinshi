from django.db import models

# Create your models here.
from django.db import models
# from django.contrib.auth.models import User
# from django.conf import settings
from API.models import User
# from django.utils import timezone
# from django.db.models import Q

from API.models import User 

class UserRequest(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="user_request")
    requestships = models.ManyToManyField(
        User,
        symmetrical=False,
        blank=True,
        related_name="requests_with"
    )

class Requestship(models.Model):
    PENDING = 'pending'
    ACCEPTED = 'accepted'

    STATUS_CHOICES = [
        (PENDING, 'Pending'),
        (ACCEPTED, 'Accepted'),
    ]

    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sent_requestships")
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name="received_requestships")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

# Create your models here.
class Game(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('completed', 'Completed'),
    ]

    #session details
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='Active')
    
    #players
    player1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='player1')
    player2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='player2')

    #score
    player1_score = models.IntegerField(default=0)
    player2_score = models.IntegerField(default=0)
    
    winner = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='winner')
    player1_level = models.FloatField(default=1.0)
    player2_level = models.FloatField(default=1.0)

    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    game_duration = models.DurationField(null=True, blank=True)

    WINNING_SCORE = 11 #py constant; it is shared by all instances of the class, and its value remains the same for every instance.
    LEVELS = [100, 300, 600]


    def update_score(self, player1_score: int, player2_score):
        self.player1_score += player1_score         
        self.player2_score += player2_score
        self.save()

        #check who reached the winning score to set the winner of the game
        if self.player1_score >= self.WINNING_SCORE:
            self.end_game(self.player1)
        elif self.player2_score >= self.WINNING_SCORE:
            self.end_game(self.player2)

    def end_game(self, winner:User):
        self.winner = winner
        self.end_time = timezone.now()
        self.game_duration = (self.end_time - self.start_time).seconds
        self.status = "Completed"
        self.save()
        self.update_winner_profile()

    def abandon_game(self, winner:User):
        if winner == self.player1:
            self.player1_score = self.WINNING_SCORE
            self.player2_score = 0
        elif winner == self.player2:
            self.player2_score = self.WINNING_SCORE
            self.player1_score = 0

        self.end_time = timezone.now()
        self.winner = winner
        self.game_duration = (self.end_time - self.start_time).seconds
        self.status = "Completed"
        self.save()
        self.update_winner_profile()

    def update_winner_profile(self):
        #get winner and loser profile
        if self.winner == self.player1:
            winner_profile = self.player1.profile #The related_name='profile' in the UserProfile model means that, for each User, you can access their related UserProfile instance using the .profile attribute.
            loser_profile = self.player2.profile
        elif self.winner == self.player2:
            winner_profile = self.player2.profile
            loser_profile = self.player1.profile

        #update games data in the winner's profile 
        winner_profile.points += 10 #add 10 points when win
        winner_profile.wins += 1
        #update winner profile
        if winner_profile.points <= LEVELS[0]:
            winner_profile.level = 1
        elif winner_profile.points <= LEVELS[1]:
            winner_profile.level = 2
        elif winner_profile.points <= LEVELS[2]:
            winner_profile.level = 3
        else:
            winner_profile.level = 4

        #update the winner fast victory if this game duration is less than his previous games
        if winner_profile.fastVictory > self.game_duration:
            winner_profile.fastVictory = self.game_duration
        #update winner consecutiveWins in winner profile
        cons_wins = self.winnerConsecutiveWins()
        if winner_profile.consecutiveWins < cons_wins:
            winner_profile.consecutiveWins = cons_wins
        winner_profile.save()
        #save the players levels in this game
        # self.player1_level = winner_profile.level if winner_profile == self.player1 else loser_profile.level#save the level reached by the player in this game
        # self.player2_level = winner_profile.level if winner_profile == self.player2 else loser_profile.level#save the level reached by the player in this game
        self.save()

    #look for consecutiveWins in the last 20 games
    def winnerConsecutiveWins(self):
        games = Game.objects.filter(Q(player1 = self.winner) | Q(player2 = self.winner), status='Completed').order_by('-id')[:20] #-id most recent games first
        cons_win = 0
        for game in games:
            if game.winner == self.winner:
                cons_win += 1
            else:
                break #stop when a loss is encountered
        return cons_win



    def __str__(self):
        if self.player2:
            return f'Game: {self.player1.id} VS {self.player2.id}'
        return f'Game: {self.player1.id} VS (waiting for player 2)'


# class   Game_S(models.Model):

    # STATUS_CHOICES = [
    #     ('waiting', 'waiting for Player'),
    #     ('active', 'Active'),
    #     ('completed', 'Completed'),
    # ]

    # status = models.Charfield(max-length=10, choices=STATUS_CHOICES, default='waiting')
    # player1 = models.ForeignKey(User, ondelete=CASCADE, related_name='player1_gmes')
    # player2 = models.ForeignKey(User, ondelete=CASCADE, related_name='player2_gmes')
    # player1_score = models.IntegerField(default=0)
    # player2_score = models.IntegerField(default=0)
    # winner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_names='won_games')

    # created_at = models.DateTimeField(auto_now_add=True)
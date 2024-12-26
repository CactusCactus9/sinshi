from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin, User
from django.db import models
from django.utils import timezone
from django.db.models.signals import post_save
from django.dispatch import receiver

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        # Validate email presence
        if not email:
            raise ValueError('The Email field must be set')
            
        # Normalize email (make domain lowercase)
        email = self.normalize_email(email)
        
        # Create new user instance but don't save it yet
        user = self.model(email=email, **extra_fields)

        # Handle password hashing
        user.set_password(password)
        
        # Save user to database
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    # Primary identification fields
    id = models.AutoField(primary_key=True) # Automatically increments the ID for each new user
    email = models.EmailField(unique=True, null=False)
    
    # Profile fields
    avatar = models.ImageField(upload_to='avatars/', default='avatars/profile.jpg')

    # Authentication related fields
    refresh_token = models.CharField(max_length=255, blank=True)
    is_two_factor_enabled = models.BooleanField(default=False)
    two_factor_secret = models.CharField(max_length=255, blank=True)

    # Metadata fields
    created_at = models.DateTimeField(default=timezone.now)
    first_time = models.BooleanField(default=True)

    #ikrame
    status = models.CharField(
        max_length=20,
        choices=[
            ('ONLINE', 'Online'),
            ('OFFLINE', 'Offline'),
            ('IN_GAME', 'In Game'),
            ('AWAY', 'Away')
        ],
        default='OFFLINE'
    )

    # Django admin related fields
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    # Connect to our CustomUserManager
    objects = CustomUserManager()

    # Tell Django to use email as the unique identifier
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    class Meta:
        db_table = 'users'
        swappable = 'AUTH_USER_MODEL' 
        #swappable: Allows Django to replace the default User model with this one

    def __str__(self):
        return self.email

class UserProfile(models.Model):
    """
    Extended profile information for users
    """
    # Primary key field
    id = models.AutoField(primary_key=True) # Auto-incrementing ID

    # One-to-one link with User model
    user = models.OneToOneField(
        User, # Related model
        on_delete=models.CASCADE, # Deletes profile when user is deleted
        related_name='profile'  # Allows user.profile access
    )

    # User status field with predefined choices
    status = models.CharField(
        max_length=20,
        choices=[
            ('ONLINE', 'Online'),
            ('OFFLINE', 'Offline'),
            ('IN_GAME', 'In Game'),
            ('AWAY', 'Away')
        ],
        default='OFFLINE'
    )

    # Basic profile fields
    display_name = models.CharField(max_length=255, unique=True)
    first_name = models.CharField(max_length=255, blank=True)
    last_name = models.CharField(max_length=255, blank=True)

    # Game statistics
    level = models.FloatField(default=1.0)
    points = models.IntegerField(default=0)
    wins = models.IntegerField(default=0)
    # losses = models.IntegerField(default=0)
    # win_streak = models.IntegerField(default=0)
    fastVictory = models.DurationField(null=True, blank=True)
    consecutiveWins = models.IntegerField(default=0)

    class Meta:
        db_table = 'user_profiles'

    def __str__(self):
        return f"{self.display_name}'s profile"

    # Property decorators create dynamic calculated fields
    @property # Makes a method behave like an attribute (user.profile.total_games instead of user.profile.total_games())
    def total_games(self):
        return self.wins + self.losses

    @property
    def win_rate(self):
        if self.total_games > 0:
            return round((self.wins / self.total_games) * 100, 2)
        return 0.0

# Signals are Django's way of handling automatic actions when models change
@receiver(post_save, sender=User) 
# @receiver: Decorator that connects the function to a signal
# post_save: Signal that fires after a model is saved
def create_user_profile(sender, instance, created, **kwargs):
    """
    Signal to automatically create UserProfile when a new User is created
    """
    if created: # Only runs when new User is created
        UserProfile.objects.create(
            user=instance,
            display_name=instance.email.split('@')[0]
        )
    # Example: email="john@42.fr" creates profile with display_name="john"

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """
    Signal to save UserProfile when User is saved
    """
    # Ensures profile is saved whenever User is saved
    instance.profile.save()

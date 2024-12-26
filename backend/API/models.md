# class CustomUserManager(BaseUserManager):

    - Custom manager for user creation
    - BaseUserManager: This is Django's base class for user management
    - **extra_fields: The ** syntax allows accepting any additional fields as keyword arguments
    - Uses email as the primary identifier instead of username
    - Includes email validation and normalization

# class User(AbstractBaseUser, PermissionsMixin):

    - email: Primary identifier (unique)
    - avatar: Profile picture path with default
    - is_two_factor_enabled: Flag for 2FA status
    - refresh_token: For OAuth refresh tokens
    - two_factor_secret: For 2FA implementation
    - first_time: Flag for first-time login
    - Standard Django fields: is_active, is_staff

# class UserProfile(models.Model):

    - Linked to User model via OneToOneField
    - Status tracking (ONLINE, OFFLINE, IN_GAME, AWAY)
    - Personal info: display_name, first_name, last_name, bio, location
    - Game statistics:
        * level
        * points
        * wins/losses
        * win_streak
    - Helper properties:
        * total_games
        * win_rate

# @receiver(post_save, sender=User)
 ## def create_user_profile(sender, instance, created, **kwargs):

    - Automatically creates UserProfile when new User is created
    - Sets default display_name from email
    - Ensures profile is saved when user is updated


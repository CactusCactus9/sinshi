"""
Django settings for project project.

Generated by 'django-admin startproject' using Django 3.2.25.

For more information on this file, see
https://docs.djangoproject.com/en/3.2/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/3.2/ref/settings/
"""
import os
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/3.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv('DEBUG', 'False') == 'True'

ALLOWED_HOSTS = ['localhost', '127.0.0.1']


#fffff
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Application definition

INSTALLED_APPS = [
    'daphne',

    'django.contrib.admin',         #This app provides Django's built-in admin interface
    'django.contrib.auth',          #This app handles authentication and authorization in Django.
    'django.contrib.contenttypes',  #Content Types allow you to create generic relationships between models.
    'django.contrib.sessions',      #This app manages user sessions
    'django.contrib.messages',      #Provides a messaging framework for displaying one-time notifications to users
    'django.contrib.staticfiles',   #Manages static files (like CSS, JavaScript, and images)
    #local apps
    'API.apps.ApiConfig',
    'chat',
    'friends',
    # Third party apps
    'rest_framework',
    'rest_framework_simplejwt',     # provide JSON Web Token
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',                  #control which domains can access your API
    'social_django',                #integration with social authentication providers

    'game',
    'channels',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]


SESSION_ENGINE = 'django.contrib.sessions.backends.db'


#ikrame
CSRF_TRUSTED_ORIGINS = [
    'http://localhost:3000'
]
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000', # React default port
    # Add your frontend URLs
]


# Authentication backends
AUTHENTICATION_BACKENDS = (
    'django.contrib.auth.backends.ModelBackend', # Default authentication
)

# JWT Settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'project.cookieJwtAuthentication.CookieJWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    )
}

# 42 OAuth settings
FORTY_TWO_CLIENT_ID = os.getenv('FORTY_TWO_CLIENT_ID')
FORTY_TWO_CLIENT_SECRET = os.getenv('FORTY_TWO_CLIENT_SECRET')
FORTY_TWO_REDIRECT_URI = os.getenv('FORTY_TWO_REDIRECT_URI')
SOCIAL_AUTH_FORTY_TWO_KEY = FORTY_TWO_CLIENT_ID
SOCIAL_AUTH_FORTY_TWO_SECRET = FORTY_TWO_CLIENT_SECRET

ROOT_URLCONF = 'project.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'project.wsgi.application'
ASGI_APPLICATION = 'project.asgi.application'


# Database
# https://docs.djangoproject.com/en/3.2/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('POSTGRES_DB'),
        'USER': os.getenv('POSTGRES_USER'),
        'PASSWORD': os.getenv('POSTGRES_PASSWORD'),
        'HOST': os.getenv('DB_HOST'),
        'PORT': os.getenv('DB_PORT'),
    }
}

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG":{
            "hosts": [("redis", 6379)]
        },
    },
}

# Password validation
# https://docs.djangoproject.com/en/3.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/3.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/3.2/howto/static-files/

STATIC_URL = '/static/'

# Default primary key field type
# https://docs.djangoproject.com/en/3.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Add this at the bottom of the file
AUTH_USER_MODEL = 'API.User'  # Tell Django to use our custom user model

# JWT settings
from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60), # Token expires in 1 hour Standard in many applications
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),    # Refresh token lasts 1 day Industry standard duration ,Only needs to log in once per day
    'ROTATE_REFRESH_TOKENS': True,                  # New refresh token with every refresh
    'BLACKLIST_AFTER_ROTATION': True,               # Invalidate old refresh tokens

    'ALGORITHM': 'HS256',                             # Encryption algorithm
    'SIGNING_KEY': SECRET_KEY,                        # Key for signing tokens

    'AUTH_HEADER_TYPES': ('Bearer',),                 # Token prefix in headers
    'USER_ID_FIELD': 'id',                           # User identifier field
    'USER_ID_CLAIM': 'user_id',                      # Claim name for user ID
   
}
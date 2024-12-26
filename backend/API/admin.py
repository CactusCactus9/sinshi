from django.contrib import admin
from .models import User  ############
from .models import UserProfile ############

# Register your models here.
admin.site.register(User) ############
admin.site.register(UserProfile) ############
from django.contrib import admin
from .models import Contact

class ContactAdmin(admin.ModelAdmin):
    list_display=('name', 'email', 'phone_number', 'linkdIn', 'github')



admin.site.register(Contact,ContactAdmin)

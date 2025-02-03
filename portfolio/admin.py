from django.contrib import admin
from .models import Project
from .models import Contact

class ProjectAdmin(admin.ModelAdmin):
    list_display=('name', 'description', 'github_link')



admin.site.register(Project,ProjectAdmin)


class ContactAdmin(admin.ModelAdmin):
    list_display=('name', 'email', 'phone_number', 'linkdIn', 'github')



admin.site.register(Contact,ContactAdmin)
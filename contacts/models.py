from django.db import models

class Contacts(models.Model):
    name=models.CharField(max_length=255)
    email=models.CharField(max_length=255)
    phone_number=models.IntegerField()
    linkdIn=models.CharField(max_length=2083)
    github=models.CharField(max_length=2083)

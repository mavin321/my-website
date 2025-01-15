from django.db import models

class Contact(models.Model):
    name=models.CharField(max_length=255)
    email=models.CharField(max_length=255)
    phone_number=models.CharField(max_length=20)
    linkdIn=models.CharField(max_length=2083)
    github=models.CharField(max_length=2083)

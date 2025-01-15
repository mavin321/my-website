from django.shortcuts import render
from django.http import HttpResponse
from .models import Contact

def index3(request):
    contacts= Contact.objects.all()
    return render(request,'index3.html', {'contacts': contacts})

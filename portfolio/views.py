from django.shortcuts import render
from django.http import HttpResponse
from .models import Project
from .models import Contact

def index(request):
    return render(request,'index.html')



def index2(request):
    projects= Project.objects.all()
    return render(request,'index2.html', {'projects': projects})


def index3(request):
    contacts= Contact.objects.all()
    return render(request,'index3.html', {'contacts': contacts})

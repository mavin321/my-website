
from django.shortcuts import render
from django.http import HttpResponse
from .models import Project

def index2(request):
    projects= Project.objects.all()
    return render(request,'index2.html', {'projects': projects})

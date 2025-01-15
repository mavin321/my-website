from django.shortcuts import render
from django.http import HttpResponse

def index3(request):
    return render(request,'index3.html')

from django.urls import path
from . import views

urlpatterns=[
    path('',views.index, name='index'),
    path('projects/',views.index2, name='index2'),
    path('contacts/',views.index3, name='index3')
]
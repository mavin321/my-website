from django.urls import path
from . import views

urlpatterns=[
    path('',views.index, name='index'),
    path('projects/',views.index2, name='index2'),
    path('contacts/',views.index3, name='index3'),
    path('simulation/', views.simulation, name='simulation'),
    path('api/simulation/microbes/', views.simulation_microbes, name='simulation_microbes'),
    path('api/simulation/microbes/<str:microbe_id>/substrates/', views.simulation_substrates, name='simulation_substrates'),
    path('api/simulation/microbes/<str:microbe_id>/substrates/<str:substrate_id>/', views.simulation_preset, name='simulation_preset'),
    path('api/simulation/run/', views.simulation_run, name='simulation_run'),
    path('api/reactor/run/', views.reactor_simulation_run, name='reactor_simulation_run'),
    path('api/separation/run/', views.separation_simulation_run, name='separation_simulation_run'),
    path('api/atomic-orbital/run/', views.atomic_orbital_simulation_run, name='atomic_orbital_simulation_run'),
]

import json
import math

from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_http_methods

from .models import Project
from .models import Contact
from .fermentation_bridge import (
    get_preset_details,
    list_microbes,
    list_substrates,
    run_simulation,
)
from .thermal_reactor_bridge import run_reactor_simulation
from .separation_bridge import run_separation_simulation


def index(request):
    return render(request, 'index.html')


def index2(request):
    projects = Project.objects.all()
    return render(request, 'index2.html', {'projects': projects})


def index3(request):
    contacts = Contact.objects.all()
    return render(request, 'index3.html', {'contacts': contacts})


def simulation(request):
    return render(request, 'simulation.html')


@require_GET
def simulation_microbes(request):
    try:
        return JsonResponse({"microbes": list_microbes()})
    except Exception as exc:
        return JsonResponse({"detail": str(exc)}, status=500)


@require_GET
def simulation_substrates(request, microbe_id):
    try:
        substrates = list_substrates(microbe_id)
        if not substrates:
            return JsonResponse(
                {"detail": "Microbe not found or no substrates"}, status=404
            )
        return JsonResponse({"microbe_id": microbe_id, "substrates": substrates})
    except Exception as exc:
        return JsonResponse({"detail": str(exc)}, status=500)


@require_GET
def simulation_preset(request, microbe_id, substrate_id):
    try:
        preset = get_preset_details(microbe_id, substrate_id)
        if not preset:
            return JsonResponse({"detail": "Preset not found"}, status=404)
        return JsonResponse(preset)
    except Exception as exc:
        return JsonResponse({"detail": str(exc)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def simulation_run(request):
    try:
        payload = json.loads(request.body or "{}")
        mode = request.GET.get("mode", "batch")
        if mode not in {"batch", "fed_batch"}:
            return JsonResponse({"detail": "Unsupported mode"}, status=400)
        result = run_simulation(payload, mode)
        return JsonResponse(_clean_json(result))
    except json.JSONDecodeError:
        return JsonResponse({"detail": "Invalid JSON payload"}, status=400)
    except Exception as exc:
        return JsonResponse({"detail": str(exc)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def reactor_simulation_run(request):
    try:
        payload = json.loads(request.body or "{}")
        result = run_reactor_simulation(payload)
        return JsonResponse(_clean_json(result))
    except json.JSONDecodeError:
        return JsonResponse({"detail": "Invalid JSON payload"}, status=400)
    except Exception as exc:
        return JsonResponse({"detail": str(exc)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def separation_simulation_run(request):
    try:
        payload = json.loads(request.body or "{}")
        result = run_separation_simulation(payload)
        return JsonResponse(_clean_json(result))
    except json.JSONDecodeError:
        return JsonResponse({"detail": "Invalid JSON payload"}, status=400)
    except Exception as exc:
        return JsonResponse({"detail": str(exc)}, status=500)


def _clean_json(obj):
    if isinstance(obj, float):
        if math.isnan(obj) or math.isinf(obj):
            return None
        return obj
    if isinstance(obj, dict):
        return {key: _clean_json(value) for key, value in obj.items()}
    if isinstance(obj, list):
        return [_clean_json(item) for item in obj]
    return obj

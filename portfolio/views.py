import json
import math

from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_http_methods

from .models import Project
from .fermentation_bridge import (
    get_preset_details,
    list_microbes,
    list_substrates,
    run_simulation,
)
from .thermal_reactor_bridge import run_reactor_simulation
from .separation_bridge import run_separation_simulation
from .atomic_orbital_bridge import run_atomic_orbital_simulation
from .cfd_flow_bridge import run_cfd_flow_simulation
from .fusion_bridge import run_fusion_simulation
from .design_space_bridge import run_design_space_simulation
from .scientific_visuals_bridge import list_scientific_scenes, run_scientific_visual_scene


def index(request):
    return render(request, 'index.html')


def index2(request):
    projects = Project.objects.all()
    project_cards = [
        _build_project_card(project, index) for index, project in enumerate(projects, start=1)
    ]
    return render(
        request,
        'index2.html',
        {
            'projects': projects,
            'project_cards': project_cards,
        },
    )


def index3(request):
    contact_profile = {
        "name": "Mavin Peter Omondi",
        "email": "mavinpeteromondi@gmail.com",
        "phone_number": "0714128700",
        "linkedin": "https://linkedin.com/in/mavin-peter-65422725b",
        "github": "https://github.com/mavin321?tab=repositories",
    }
    contact_methods = _build_contact_methods(contact_profile)
    return render(
        request,
        'index3.html',
        {
            'contact_profile': contact_profile,
            'contact_methods': contact_methods,
        },
    )


def simulation(request):
    return render(request, 'simulation.html')


def scientific_visuals(request):
    return render(request, 'scientific_visuals.html')


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


@csrf_exempt
@require_http_methods(["POST"])
def atomic_orbital_simulation_run(request):
    try:
        payload = json.loads(request.body or "{}")
        result = run_atomic_orbital_simulation(payload)
        return JsonResponse(_clean_json(result))
    except json.JSONDecodeError:
        return JsonResponse({"detail": "Invalid JSON payload"}, status=400)
    except Exception as exc:
        return JsonResponse({"detail": str(exc)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def cfd_flow_simulation_run(request):
    try:
        payload = json.loads(request.body or "{}")
        result = run_cfd_flow_simulation(payload)
        return JsonResponse(_clean_json(result))
    except json.JSONDecodeError:
        return JsonResponse({"detail": "Invalid JSON payload"}, status=400)
    except Exception as exc:
        return JsonResponse({"detail": str(exc)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def fusion_simulation_run(request):
    try:
        payload = json.loads(request.body or "{}")
        result = run_fusion_simulation(payload)
        return JsonResponse(_clean_json(result))
    except json.JSONDecodeError:
        return JsonResponse({"detail": "Invalid JSON payload"}, status=400)
    except Exception as exc:
        return JsonResponse({"detail": str(exc)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def design_space_simulation_run(request):
    try:
        payload = json.loads(request.body or "{}")
        result = run_design_space_simulation(payload)
        return JsonResponse(_clean_json(result))
    except json.JSONDecodeError:
        return JsonResponse({"detail": "Invalid JSON payload"}, status=400)
    except Exception as exc:
        return JsonResponse({"detail": str(exc)}, status=500)


@require_GET
def scientific_visuals_scenes(request):
    try:
        return JsonResponse({"scenes": list_scientific_scenes()})
    except Exception as exc:
        return JsonResponse({"detail": str(exc)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def scientific_visuals_run(request):
    try:
        payload = json.loads(request.body or "{}")
        scene_id = str(payload.get("scene_id", "electron_motion"))
        frame_count = int(payload.get("frame_count", 32))
        points_per_frame = int(payload.get("points_per_frame", 180))
        result = run_scientific_visual_scene(scene_id, frame_count, points_per_frame)
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


def _build_project_card(project, index):
    text = f"{project.name} {project.description}".lower()

    focus_rules = [
        (("simulation", "reactor", "separation", "orbital", "cfd", "fusion"), "Engineering model"),
        (("design", "optimization", "pareto"), "Design analysis"),
        (("visual", "gallery", "render", "plot"), "Scientific visualization"),
        (("api", "backend", "django", "web", "full-stack"), "Software delivery"),
        (("data", "analysis", "model"), "Technical decision support"),
    ]
    tag_rules = [
        (("python",), "Python"),
        (("django",), "Django"),
        (("javascript", "frontend", "ui"), "JavaScript"),
        (("c++", "cpp"), "C++"),
        (("c ", " c,", " c.", "embedded"), "C"),
        (("simulation",), "Simulation"),
        (("reactor", "process", "chemical", "separation"), "Process Engineering"),
        (("visual", "render", "gallery"), "Visualization"),
        (("api",), "API"),
        (("data", "analysis"), "Data"),
        (("design", "optimization"), "Design"),
    ]

    focus = "Software and engineering build"
    for keywords, label in focus_rules:
        if any(keyword in text for keyword in keywords):
            focus = label
            break

    tags = []
    for keywords, label in tag_rules:
        if any(keyword in text for keyword in keywords) and label not in tags:
            tags.append(label)
        if len(tags) == 4:
            break

    if not tags:
        tags = ["Engineering", "Software", "Portfolio"]

    return {
        "index": f"{index:02d}",
        "name": project.name,
        "description": project.description,
        "github_link": project.github_link,
        "focus": focus,
        "track": "Case Study",
        "tags": tags,
        "aos_duration": 920 + (index * 90),
    }


def _build_contact_methods(contact):
    return [
        {
            "label": "Email",
            "value": contact["email"],
            "detail": "Best for roles, projects, and direct technical discussion.",
            "href": f"mailto:{contact['email']}",
            "action": "Send email",
        },
        {
            "label": "Phone",
            "value": contact["phone_number"],
            "detail": "Useful for urgent contact or quick coordination.",
            "href": f"tel:{contact['phone_number']}",
            "action": "Call",
        },
        {
            "label": "LinkedIn",
            "value": "Professional profile and career history.",
            "detail": "A concise view of experience, education, and role alignment.",
            "href": contact["linkedin"],
            "action": "View profile",
        },
        {
            "label": "GitHub",
            "value": "Public repositories, code experiments, and technical builds.",
            "detail": "Browse implementation quality, scope, and engineering range.",
            "href": contact["github"],
            "action": "Open GitHub",
        },
    ]

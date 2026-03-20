from fastapi import APIRouter, HTTPException

from fermentation_sim.data.preset_service import list_microbes, list_substrates, get_preset, flatten_preset

router = APIRouter(prefix="/presets", tags=["presets"])


@router.get("/microbes")
async def microbes():
    return {"microbes": list_microbes()}


@router.get("/microbes/{microbe_id}/substrates")
async def substrates(microbe_id: str):
    subs = list_substrates(microbe_id)
    if not subs:
        raise HTTPException(status_code=404, detail="Microbe not found or no substrates")
    return {"microbe_id": microbe_id, "substrates": subs}


@router.get("/microbes/{microbe_id}/substrates/{substrate_id}")
async def preset(microbe_id: str, substrate_id: str):
    preset_obj = get_preset(microbe_id, substrate_id)
    if not preset_obj:
        raise HTTPException(status_code=404, detail="Preset not found")
    return {
        "microbe_id": microbe_id,
        "substrate_id": substrate_id,
        "label": preset_obj.get("label", f"{microbe_id} on {substrate_id}"),
        "preset": {
            "defaults": flatten_preset(preset_obj),
            "sections": preset_obj,
        },
    }

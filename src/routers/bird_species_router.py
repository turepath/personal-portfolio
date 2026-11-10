from fastapi import APIRouter, Depends
from fastapi import APIRouter, Depends, HTTPException
from models.bird_species import BirdSpecies, BirdSpecies_Pydantic, BirdSpeciesIn_Pydantic
from middlewares.auth_middleware import verify_admin
from tortoise.exceptions import DoesNotExist

router = APIRouter(tags=["鸟类物种"])

@router.get("/bird-species", response_model=list[BirdSpecies_Pydantic])
async def list_species():
    return await BirdSpecies_Pydantic.from_queryset(BirdSpecies.all())

@router.post("/bird-species", response_model=BirdSpecies_Pydantic, dependencies=[Depends(verify_admin)])
async def add_species(species: BirdSpeciesIn_Pydantic):
    return await BirdSpecies.create(**species.dict())

@router.get("/bird-species/{species_id}", response_model=BirdSpecies_Pydantic)
async def get_species(species_id: int):
    try:
        return await BirdSpecies_Pydantic.from_queryset_single(BirdSpecies.get(id=species_id))
    except DoesNotExist:
        raise HTTPException(status_code=404, detail="Species not found")

@router.put("/bird-species/{species_id}", response_model=BirdSpecies_Pydantic, dependencies=[Depends(verify_admin)])
async def update_species(species_id: int, species: BirdSpeciesIn_Pydantic):
    try:
        await BirdSpecies.filter(id=species_id).update(**species.dict())
        return await BirdSpecies_Pydantic.from_queryset_single(BirdSpecies.get(id=species_id))
    except DoesNotExist:
        raise HTTPException(status_code=404, detail="Species not found")

@router.delete("/bird-species/{species_id}", dependencies=[Depends(verify_admin)])
async def delete_species(species_id: int):
    deleted_count = await BirdSpecies.filter(id=species_id).delete()
    if not deleted_count:
        raise HTTPException(status_code=404, detail="Species not found")
    return {"message": "Species deleted successfully"}
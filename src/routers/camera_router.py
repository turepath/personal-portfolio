from fastapi import APIRouter, Depends, HTTPException
from models.camera import Camera, Camera_Pydantic, CameraIn_Pydantic
from models.user import User
from tortoise.exceptions import DoesNotExist
from middlewares.auth_middleware import get_current_user

router = APIRouter(tags=["摄像头管理"])

@router.get("/cameras", response_model=list[Camera_Pydantic])
async def get_cameras(current_user: User = Depends(get_current_user)):
    return await Camera_Pydantic.from_queryset(Camera.filter(created_by=current_user))

@router.post("/cameras", response_model=Camera_Pydantic)
async def create_camera(camera: CameraIn_Pydantic, current_user: User = Depends(get_current_user)):
    camera_obj = await Camera.create(**camera.dict(), created_by=current_user)
    return await Camera_Pydantic.from_tortoise_orm(camera_obj)

@router.get("/cameras/{camera_id}", response_model=Camera_Pydantic)
async def get_camera(camera_id: int, current_user: User = Depends(get_current_user)):
    try:
        return await Camera_Pydantic.from_queryset_single(Camera.get(id=camera_id, created_by=current_user))
    except DoesNotExist:
        raise HTTPException(status_code=404, detail="Camera not found")

@router.put("/cameras/{camera_id}", response_model=Camera_Pydantic)
async def update_camera(camera_id: int, camera: CameraIn_Pydantic, current_user: User = Depends(get_current_user)):
    await Camera.filter(id=camera_id, created_by=current_user).update(**camera.dict(exclude_unset=True))
    return await Camera_Pydantic.from_queryset_single(Camera.get(id=camera_id))

@router.delete("/cameras/{camera_id}")
async def delete_camera(camera_id: int, current_user: User = Depends(get_current_user)):
    deleted_count = await Camera.filter(id=camera_id, created_by=current_user).delete()
    if not deleted_count:
        raise HTTPException(status_code=404, detail="Camera not found")
    return {"message": "Camera deleted"}
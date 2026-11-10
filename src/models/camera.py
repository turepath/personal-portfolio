from tortoise.contrib.pydantic import pydantic_model_creator
from tortoise.models import Model
from tortoise import fields
from pydantic import BaseModel

class Camera(Model):
    id = fields.IntField(pk=True)
    alias = fields.CharField(max_length=50, unique=True)
    location = fields.JSONField()
    rtsp_url = fields.CharField(max_length=255, null=True)  # 新增RTSP流地址
    upload_count = fields.IntField(default=0)
    created_by = fields.ForeignKeyField('models.User', related_name='cameras')
    created_at = fields.DatetimeField(auto_now_add=True)
    is_active = fields.BooleanField(default=True)

    class Meta:
        table = "cameras"
        unique_together = (('alias', 'created_by'),)

# Pydantic模型
Camera_Pydantic = pydantic_model_creator(Camera)
CameraIn_Pydantic = pydantic_model_creator(Camera, name="CameraIn", exclude_readonly=True)
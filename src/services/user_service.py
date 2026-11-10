from models.user import User, User_Pydantic, UserIn_Pydantic
from utils.auth import get_password_hash

class UserService:
    async def create_user(self, user: UserIn_Pydantic):
        hashed_password = get_password_hash(user.password)
        user_obj = await User.create(**user.dict(exclude={"password"}), password=hashed_password)
        return await User_Pydantic.from_tortoise_orm(user_obj)

    async def get_all_users(self):
        users_queryset = User.all()
        return await User_Pydantic.from_queryset(users_queryset)

    async def get_user_by_id(self, user_id: int):
        return await User_Pydantic.from_tortoise_orm(await User.get(id=user_id))

    async def update_user(self, user_id: int, user: UserIn_Pydantic):
        user_obj = await User.get(id=user_id)
        user_data = user.dict(exclude_unset=True)
        if "password" in user_data:
            user_data["password"] = get_password_hash(user_data["password"])
        for key, value in user_data.items():
            setattr(user_obj, key, value)
        await user_obj.save()
        return await User_Pydantic.from_tortoise_orm(user_obj)

    async def delete_user(self, user_id: int):
        user_obj = await User.get(id=user_id)
        await user_obj.delete()
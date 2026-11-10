from minio import Minio
from minio.commonconfig import ComposeSource  # 正确的新版导入路径
from minio.error import S3Error
from config import settings
import os
import time  # 添加缺失的time模块导入
import re  # 添加在文件顶部
import io  # 添加io模块导入
from datetime import timedelta  # 添加timedelta导入

class MinioService:
    """Minio文件存储服务"""
    def __init__(self):
        # 先初始化客户端再检查存储桶
        endpoint = settings.minio_endpoint.replace("http://", "").replace("https://", "")
        if ":" not in endpoint:
            endpoint += ":9000"  # 默认API端口
        
        self.client = Minio(
            endpoint=endpoint,
            access_key=settings.minio_access_key,
            secret_key=settings.minio_secret_key,
            secure=False
        )
        
        print(f"正在连接MinIO服务：{endpoint}")
        try:
            if not self.client.bucket_exists(settings.minio_bucket):
                print(f"创建存储桶：{settings.minio_bucket}")
                self.client.make_bucket(settings.minio_bucket)
            else:
                print(f"存储桶 {settings.minio_bucket} 已存在")
        except Exception as e:
            print(f"存储桶初始化失败：{str(e)}")
            raise
        # 强制使用API端口并去除协议前缀
        endpoint = settings.minio_endpoint.replace("http://", "").replace("https://", "")
        if ":" not in endpoint:
            endpoint += ":9000"  # 默认API端口
        
        self.client = Minio(
            endpoint=endpoint,
            access_key=settings.minio_access_key,
            secret_key=settings.minio_secret_key,
            secure=False  # 确保使用HTTP连接
        )
        
        # 使用配置的存储桶名称
        if not self.client.bucket_exists(settings.minio_bucket):
            self.client.make_bucket(settings.minio_bucket)
    
    async def chunked_upload(self, file_path: str, object_name: str):
        """分块上传文件到MinIO"""
        try:
            # 生成上传ID
            upload_id = self.client._get_upload_id(
                settings.minio_bucket,
                object_name)
            
            # 分块上传（示例分为5MB块）
            part_info = []
            chunk_size = 5 * 1024 * 1024
            with open(file_path, 'rb') as data:
                part_number = 1
                while True:
                    chunk = data.read(chunk_size)
                    if not chunk:
                        break
                    etag = self.client._upload_part(
                        settings.minio_bucket,
                        object_name,
                        upload_id,
                        part_number,
                        chunk)
                    part_info.append({"PartNumber": part_number, "ETag": etag})
                    part_number += 1
            
            # 完成分块上传
            self.client._complete_multipart_upload(
                settings.minio_bucket,
                object_name,
                upload_id,
                part_info)
            return True
        except S3Error as e:
            print(f"分块上传失败: {e}")
            return False

    async def upload_chunk(self, file_stream, chunk_name: str, chunk_number: int) -> bool:
        """修复文件流长度计算方法"""
        try:
            # 计算文件流长度
            file_stream.seek(0, 2)  # 移动到文件末尾
            file_size = file_stream.tell()  # 获取总长度
            file_stream.seek(0)  # 重置指针到文件头
            
            # 上传分块
            self.client.put_object(
                settings.minio_bucket,
                chunk_name,
                file_stream,
                length=file_size  # 使用正确计算的长度
            )
            return True
        except S3Error as e:
            print(f"分块上传失败: {e}")
            return False

    async def merge_chunks(self, identifier: str, filename: str) -> bool:
        """合并分块时处理Windows路径限制"""
        # 增强Windows路径兼容性处理
        safe_identifier = re.sub(r'[^a-zA-Z0-9]', '_', identifier)[:24]  # 缩短长度避免路径过长
        lock_key = f"lock/{safe_identifier}"
        
        # 添加调试日志
        print(f"合并操作开始 | ID: {identifier} -> SafeID: {safe_identifier}")
        try:
            # 安全删除旧锁文件
            try:
                self.client.remove_object(settings.minio_bucket, lock_key)
            except S3Error as e:
                if e.code != "NoSuchKey":
                    print(f"锁文件删除失败: {str(e)}")
            
            # 创建新的文件锁（使用二进制流直接写入）
            self.client.put_object(
                settings.minio_bucket,
                lock_key,
                io.BytesIO(f"locked:{identifier}".encode()),
                length=len(f"locked:{identifier}"),
                metadata={
                    'X-Amz-Meta-Lock': 'true',
                    'Content-Type': 'text/plain'
                }
            )
            # 列出所有分块对象
            objects = self.client.list_objects(
                settings.minio_bucket,
                prefix=f"chunks/{identifier}/"
            )
            
            # 直接复制分块到最终文件（修正后的实现）
            try:
                # 将生成器转换为列表并过滤无效分块
                objects = list(self.client.list_objects(
                    settings.minio_bucket,
                    prefix=f"chunks/{identifier}/"
                ))
                
                if not objects:
                    print(f"[ERROR] 未找到有效分块文件 | ID: {identifier}")
                    return False
            
                # 添加分块有效性检查
                valid_objects = [obj for obj in objects if obj.size > 0]
                if not valid_objects:
                    print(f"[ERROR] 所有分块大小无效 | ID: {identifier}")
                    return False
            
                # 添加调试日志
                print(f"发现有效分块数量：{len(valid_objects)} | ID: {identifier}")
                [print(f"分块 {i+1}: {obj.object_name} ({obj.size}字节)") for i, obj in enumerate(valid_objects)]
                
                # 获取所有分块并排序（增加数字排序校验）
                try:
                    sorted_objects = sorted(valid_objects, key=lambda x: int(x.object_name.split('/')[-1]))
                except ValueError as e:
                    print(f"分块命名格式错误: {str(e)}")
                    return False
                    
                # 创建合并源（移除错误的元数据设置）
                sources = [
                    ComposeSource(
                        settings.minio_bucket,
                        obj.object_name,
                        offset=0,
                        length=obj.size
                    )
                    for obj in sorted_objects  # 直接遍历已排序对象
                ]
                
                # 修改合并后的存储路径（移除uploads/前缀）
                self.client.compose_object(
                    settings.minio_bucket,
                    filename,  # 直接使用文件名
                    sources
                )
                print(f"合并完成 → {filename}")
                return True
            except S3Error as e:
                print(f"合并失败: {str(e)}")
                return False
        except S3Error as e:
            # 添加详细的错误日志
            print(f"合并过程中发生错误: {str(e)}")
            return False
        finally:
            try:
                # 使用新的锁文件命名规则
                self.client.remove_object(settings.minio_bucket, lock_key)
            except S3Error as e:
                print(f"锁文件清理失败: {str(e)}")
            # 延迟清理临时文件
            self._clean_temp_files_with_retry(identifier)
    
    def _clean_temp_files_with_retry(self, identifier: str, retries=5, delay=1):
        """带重试机制的清理"""
        from minio.deleteobjects import DeleteObject  # 添加必要导入
        
        for attempt in range(retries):
            try:
                objects = self.client.list_objects(
                    settings.minio_bucket,
                    prefix=f"chunks/{identifier}/"
                )
                # 修正删除对象格式
                delete_list = [DeleteObject(obj.object_name) for obj in objects]
                if delete_list:
                    # 使用正确的删除对象格式
                    for err in self.client.remove_objects(
                        settings.minio_bucket,
                        delete_list
                    ):
                        print(f"删除错误: {err}")
                break
            except S3Error as e:
                if attempt < retries - 1:
                    print(f"清理失败，第{attempt+1}次重试...")
                    time.sleep(delay)
                    delay *= 2
                else:
                    print(f"最终清理失败: {e}")

    def get_presigned_url(self, filename: str) -> str:
        """生成带签名的临时访问链接"""
        try:
            return self.client.get_presigned_url(
                "GET",
                settings.minio_bucket,
                filename,
                expires=timedelta(hours=24)  # 移除调试注释中的中文
            )
        except Exception as e:
            print(f"生成签名URL失败: {str(e)}")
            return ""

minio_client = MinioService()
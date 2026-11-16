import os
import mimetypes
import logging
from typing import Dict, Any, Optional
import httpx
from app.config import settings

logger = logging.getLogger(__name__)

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

class StorageService:
    """
    Unified Cloud & Local Storage Service for JobHub.
    Supports Supabase Storage Buckets (resumes, company-logos)
    with seamless local filesystem fallback for offline development.
    """

    def __init__(self):
        self.supabase_url = settings.SUPABASE_URL.rstrip("/") if settings.SUPABASE_URL else ""
        # Prefer service role key for backend operations (bypasses RLS), fall back to anon key
        self.api_key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY
        self.resumes_bucket = settings.SUPABASE_RESUMES_BUCKET
        self.logos_bucket = settings.SUPABASE_LOGOS_BUCKET

    @property
    def is_supabase_enabled(self) -> bool:
        """Checks if Supabase cloud storage credentials are configured."""
        return bool(self.supabase_url and self.api_key)

    def _get_headers(self, content_type: str = "application/octet-stream") -> Dict[str, str]:
        return {
            "Authorization": f"Bearer {self.api_key}",
            "apikey": self.api_key,
            "Content-Type": content_type,
            "x-upsert": "true"
        }

    def upload_resume(self, file_bytes: bytes, filename: str, seeker_id: int) -> Dict[str, Any]:
        """
        Stores candidate resume in Supabase 'resumes' bucket (or local uploads).
        Returns storage metadata including accessible file URL.
        """
        clean_filename = filename.replace(" ", "_")
        storage_path = f"seeker_{seeker_id}/{clean_filename}"
        content_type, _ = mimetypes.guess_type(filename)
        content_type = content_type or "application/pdf"

        # Always maintain local copy in uploads/ directory as resilient fallback
        local_filename = f"seeker_{seeker_id}_{clean_filename}"
        local_file_path = os.path.join(UPLOAD_DIR, local_filename)
        with open(local_file_path, "wb") as f:
            f.write(file_bytes)

        if not self.is_supabase_enabled:
            logger.info(f"[Storage] Supabase not configured. Using local file storage: /uploads/{local_filename}")
            return {
                "provider": "local",
                "bucket": self.resumes_bucket,
                "file_path": local_filename,
                "file_url": f"/uploads/{local_filename}",
                "filename": filename
            }

        # Upload to Supabase Storage
        upload_endpoint = f"{self.supabase_url}/storage/v1/object/{self.resumes_bucket}/{storage_path}"
        try:
            with httpx.Client(timeout=15.0) as client:
                res = client.post(
                    upload_endpoint,
                    headers=self._get_headers(content_type),
                    content=file_bytes
                )
                if res.status_code in (200, 201):
                    # For private buckets, generate a signed access URL valid for 7 days
                    signed_url = self.create_signed_url(self.resumes_bucket, storage_path, expires_in=604800)
                    return {
                        "provider": "supabase",
                        "bucket": self.resumes_bucket,
                        "file_path": storage_path,
                        "file_url": signed_url or f"{self.supabase_url}/storage/v1/object/{self.resumes_bucket}/{storage_path}",
                        "filename": filename
                    }
                else:
                    logger.warning(f"[Storage] Supabase upload returned {res.status_code}: {res.text}. Falling back to local.")
        except Exception as e:
            logger.warning(f"[Storage] Supabase upload failed with exception: {e}. Falling back to local copy.")

        return {
            "provider": "local",
            "bucket": self.resumes_bucket,
            "file_path": local_filename,
            "file_url": f"/uploads/{local_filename}",
            "filename": filename
        }

    def upload_logo(self, file_bytes: bytes, filename: str, company_id: int) -> Dict[str, Any]:
        """
        Stores company or recruiter logo in Supabase 'company-logos' public bucket.
        """
        clean_filename = filename.replace(" ", "_")
        storage_path = f"company_{company_id}/{clean_filename}"
        content_type, _ = mimetypes.guess_type(filename)
        content_type = content_type or "image/png"

        local_filename = f"company_{company_id}_{clean_filename}"
        local_file_path = os.path.join(UPLOAD_DIR, local_filename)
        with open(local_file_path, "wb") as f:
            f.write(file_bytes)

        if not self.is_supabase_enabled:
            return {
                "provider": "local",
                "bucket": self.logos_bucket,
                "file_path": local_filename,
                "file_url": f"/uploads/{local_filename}",
                "filename": filename
            }

        upload_endpoint = f"{self.supabase_url}/storage/v1/object/{self.logos_bucket}/{storage_path}"
        try:
            with httpx.Client(timeout=15.0) as client:
                res = client.post(
                    upload_endpoint,
                    headers=self._get_headers(content_type),
                    content=file_bytes
                )
                if res.status_code in (200, 201):
                    public_url = f"{self.supabase_url}/storage/v1/object/public/{self.logos_bucket}/{storage_path}"
                    return {
                        "provider": "supabase",
                        "bucket": self.logos_bucket,
                        "file_path": storage_path,
                        "file_url": public_url,
                        "filename": filename
                    }
        except Exception as e:
            logger.warning(f"[Storage] Supabase logo upload failed: {e}")

        return {
            "provider": "local",
            "bucket": self.logos_bucket,
            "file_path": local_filename,
            "file_url": f"/uploads/{local_filename}",
            "filename": filename
        }

    def create_signed_url(self, bucket: str, file_path: str, expires_in: int = 3600) -> Optional[str]:
        """Generates a temporary signed download URL for private bucket objects."""
        if not self.is_supabase_enabled:
            return None

        sign_endpoint = f"{self.supabase_url}/storage/v1/object/sign/{bucket}/{file_path}"
        try:
            with httpx.Client(timeout=10.0) as client:
                res = client.post(
                    sign_endpoint,
                    headers=self._get_headers("application/json"),
                    json={"expiresIn": expires_in}
                )
                if res.status_code == 200:
                    data = res.json()
                    signed_path = data.get("signedURL") or data.get("signedUrl")
                    if signed_path:
                        if signed_path.startswith("http"):
                            return signed_path
                        return f"{self.supabase_url}/storage/v1{signed_path}"
        except Exception as e:
            logger.error(f"[Storage] Failed to generate signed URL: {e}")

        return None

# Singleton instance
storage_service = StorageService()

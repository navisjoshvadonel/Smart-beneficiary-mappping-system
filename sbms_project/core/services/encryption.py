import base64
import hashlib
from cryptography.fernet import Fernet
from django.conf import settings

class AadhaarEncryptionService:
    @staticmethod
    def _get_key():
        key_string = getattr(settings, 'AADHAAR_ENCRYPTION_KEY', 'default_sekret_key_fallback')
        # Fernet requires a 32 url-safe base64-encoded bytes. We hash the key phrase to ensure size.
        hashed_key = hashlib.sha256(key_string.encode()).digest()
        return base64.urlsafe_b64encode(hashed_key)

    @classmethod
    def get_cipher(cls):
        return Fernet(cls._get_key())

    @classmethod
    def encrypt(cls, plaintext: str) -> str:
        if not plaintext:
            return plaintext
        cipher = cls.get_cipher()
        return cipher.encrypt(plaintext.encode()).decode()

    @classmethod
    def decrypt(cls, ciphertext: str) -> str:
        if not ciphertext:
            return ciphertext
        try:
            cipher = cls.get_cipher()
            return cipher.decrypt(ciphertext.encode()).decode()
        except Exception:
            # If failing to decrypt, return original text
            return ciphertext

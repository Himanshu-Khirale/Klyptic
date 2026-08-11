import os
import chromadb
from chromadb.config import Settings
from dotenv import load_dotenv

load_dotenv()

CHROMA_PERSIST_DIRECTORY = os.environ.get("CHROMA_PERSIST_DIRECTORY", "./.chroma")

class ChromaClientManager:
    _instance = None

    @classmethod
    def get_client(cls):
        if cls._instance is None:
            cls._instance = chromadb.PersistentClient(
                path=CHROMA_PERSIST_DIRECTORY,
                settings=Settings(
                    anonymized_telemetry=False,
                    is_persistent=True
                )
            )
        return cls._instance

def get_chroma_client():
    return ChromaClientManager.get_client()

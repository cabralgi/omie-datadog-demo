import os

from ddtrace import patch
from pymongo import MongoClient

patch(pymongo=True)

_client = None


def get_client():
    global _client
    if _client is None:
        _client = MongoClient(
            os.environ["MONGO_URI"],
            maxPoolSize=5,
            serverSelectionTimeoutMS=3000,
            connectTimeoutMS=3000,
        )
    return _client


def get_db():
    db_name = os.environ.get("MONGO_DB_NAME", "demo")
    return get_client()[db_name]

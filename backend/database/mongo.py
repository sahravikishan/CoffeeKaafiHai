from pymongo import MongoClient


def get_database():
    client = MongoClient("mongodb://localhost:27017/")
    db = client["coffeekaafihai_db"]
    return db

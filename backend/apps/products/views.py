from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

from database.mongo import get_database


@csrf_exempt
def product_list(request):
    db = get_database()
    collection = db["products"]

    if request.method == "GET":
        products = collection.find({}, {"_id": 0})
        return JsonResponse({
            "status": "success",
            "data": list(products)
        })

    if request.method == "POST":
        data = json.loads(request.body)

        product = {
            "name": data.get("name"),
            "price": data.get("price"),
            "category": data.get("category")
        }

        collection.insert_one(product)

        return JsonResponse({
            "status": "success",
            "message": "Product added successfully"
        })

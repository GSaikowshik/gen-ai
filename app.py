from flask import Flask, jsonify, request, send_from_directory
import os

app = Flask(__name__, static_folder='static', static_url_path='')

# ─── Product Data ────────────────────────────────────────────────────────────
products = [
    {
        "id": 1,
        "name": "Wireless Noise-Cancelling Headphones",
        "price": 249.99,
        "image": "/images/headphones.png",
        "category": "Electronics",
        "rating": 4.8,
        "reviews": 1243,
        "description": "Premium wireless headphones with active noise cancellation, 30-hour battery life, and ultra-comfortable ear cushions."
    },
    {
        "id": 2,
        "name": "Minimalist Leather Watch",
        "price": 179.99,
        "image": "/images/watch.png",
        "category": "Accessories",
        "rating": 4.6,
        "reviews": 876,
        "description": "Elegant minimalist watch with genuine Italian leather strap and sapphire crystal glass."
    },
    {
        "id": 3,
        "name": "Running Sneakers Pro",
        "price": 129.99,
        "image": "/images/sneakers.png",
        "category": "Footwear",
        "rating": 4.7,
        "reviews": 2104,
        "description": "Ultra-lightweight running shoes with responsive cushioning and breathable mesh upper."
    },
    {
        "id": 4,
        "name": "Smart Backpack",
        "price": 89.99,
        "image": "/images/backpack.png",
        "category": "Accessories",
        "rating": 4.5,
        "reviews": 654,
        "description": "Water-resistant smart backpack with USB charging port, anti-theft pocket, and laptop compartment."
    },
    {
        "id": 5,
        "name": "Portable Bluetooth Speaker",
        "price": 69.99,
        "image": "/images/speaker.png",
        "category": "Electronics",
        "rating": 4.4,
        "reviews": 1567,
        "description": "360° surround sound portable speaker with 20-hour battery life and IPX7 waterproof rating."
    },
    {
        "id": 6,
        "name": "Ceramic Coffee Mug Set",
        "price": 34.99,
        "image": "/images/mugs.png",
        "category": "Home",
        "rating": 4.9,
        "reviews": 432,
        "description": "Handcrafted ceramic mug set of 4 with unique reactive glaze finish. Microwave and dishwasher safe."
    },
    {
        "id": 7,
        "name": "Mechanical Keyboard RGB",
        "price": 149.99,
        "image": "/images/keyboard.png",
        "category": "Electronics",
        "rating": 4.7,
        "reviews": 989,
        "description": "Hot-swappable mechanical keyboard with per-key RGB lighting, PBT keycaps, and aluminum frame."
    },
    {
        "id": 8,
        "name": "Yoga Mat Premium",
        "price": 49.99,
        "image": "/images/yogamat.png",
        "category": "Fitness",
        "rating": 4.6,
        "reviews": 781,
        "description": "Extra-thick eco-friendly yoga mat with alignment lines, non-slip surface, and carrying strap."
    },
]


# ─── Routes ──────────────────────────────────────────────────────────────────

@app.route('/')
def index():
    return send_from_directory('static', 'index.html')


@app.route('/api/products', methods=['GET'])
def get_products():
    category = request.args.get('category')
    search = request.args.get('search', '').lower()

    filtered = products

    if category and category != 'All':
        filtered = [p for p in filtered if p['category'] == category]

    if search:
        filtered = [p for p in filtered if search in p['name'].lower() or search in p['description'].lower()]

    return jsonify(filtered)


@app.route('/api/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    product = next((p for p in products if p['id'] == product_id), None)
    if product:
        return jsonify(product)
    return jsonify({"error": "Product not found"}), 404


@app.route('/api/checkout', methods=['POST'])
def checkout():
    data = request.get_json()
    if not data or 'items' not in data:
        return jsonify({"error": "No items in cart"}), 400

    total = sum(item['price'] * item['quantity'] for item in data['items'])
    return jsonify({
        "success": True,
        "message": "Order placed successfully!",
        "order_id": "ORD-2026-" + str(hash(str(data)) % 100000).zfill(5),
        "total": round(total, 2)
    })


if __name__ == '__main__':
    app.run(debug=True, port=5000)

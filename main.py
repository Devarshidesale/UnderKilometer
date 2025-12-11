from flask import Flask, render_template, request, jsonify
import os

app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key")

SAMPLE_LISTINGS = [
    {
        "id": 1,
        "title": "Cozy Studio Near Campus",
        "price": 450,
        "distance": 0.3,
        "amenities": ["wifi", "laundry", "parking"],
        "description": "A comfortable studio apartment just minutes from campus.",
        "image": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400"
    },
    {
        "id": 2,
        "title": "Shared Room in Student House",
        "price": 300,
        "distance": 0.5,
        "amenities": ["wifi", "kitchen", "garden"],
        "description": "Friendly student house with shared facilities.",
        "image": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400"
    },
    {
        "id": 3,
        "title": "Modern 1-Bedroom Apartment",
        "price": 650,
        "distance": 0.8,
        "amenities": ["wifi", "gym", "parking", "laundry"],
        "description": "Newly renovated apartment with modern amenities.",
        "image": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400"
    },
    {
        "id": 4,
        "title": "Budget-Friendly Dorm Room",
        "price": 200,
        "distance": 0.1,
        "amenities": ["wifi", "cafeteria"],
        "description": "On-campus dorm with all basic necessities.",
        "image": "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400"
    },
    {
        "id": 5,
        "title": "Spacious 2-Bedroom Flat",
        "price": 800,
        "distance": 0.6,
        "amenities": ["wifi", "parking", "balcony", "laundry"],
        "description": "Perfect for sharing with a roommate.",
        "image": "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400"
    },
    {
        "id": 6,
        "title": "Quiet Studio in Residential Area",
        "price": 500,
        "distance": 0.9,
        "amenities": ["wifi", "garden", "parking"],
        "description": "Peaceful location ideal for focused study.",
        "image": "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=400"
    }
]

@app.route('/')
def index():
    response = app.make_response(render_template('index.html'))
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    return response

@app.route('/api/listings')
def get_listings():
    min_price = request.args.get('min_price', type=int, default=0)
    max_price = request.args.get('max_price', type=int, default=10000)
    max_distance = request.args.get('max_distance', type=float, default=10.0)
    amenities = request.args.getlist('amenities')
    
    filtered = SAMPLE_LISTINGS
    
    filtered = [l for l in filtered if min_price <= l['price'] <= max_price]
    filtered = [l for l in filtered if l['distance'] <= max_distance]
    
    if amenities:
        filtered = [l for l in filtered if all(a in l['amenities'] for a in amenities)]
    
    return jsonify(filtered)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

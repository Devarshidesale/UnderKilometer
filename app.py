from flask import Flask, request, jsonify
from flask_cors import CORS
from database import engine
from sqlalchemy import text

app = Flask(__name__)
CORS(app)

amenities_main_list = ['Wi-Fi','Washing Machine', 'Security (CCTV/Guard)', 'Personal Washroom', 'Kitchen', 'Mess/Tiffin']

def load_accommodations(filters=None):
    """
    Load accommodations with optional filters
    filters: dict containing filter parameters
    """
    query = "SELECT * FROM UnderKilometer_database WHERE 1=1"
    params = {}

    if filters:
        # Distance filter
        if filters.get('distance'):
            distance = filters['distance']
            if distance == '3':  # more than 2km
                query += " AND distance > 2"
            else:
                query += " AND distance <= :distance"
                params['distance'] = float(distance)

        # Accommodation type filter
        if filters.get('accomodation_type'):
            query += " AND accomodation_type = :accomodation_type"
            params['accomodation_type'] = filters['accomodation_type']

        # Gender filter
        if filters.get('gender_type'):
            query += " AND gender_type = :gender_type"
            params['gender_type'] = filters['gender_type']

        # Monthly rent filter
        if filters.get('max_rent'):
            query += " AND overall_monthly_rent <= :max_rent"
            params['max_rent'] = float(filters['max_rent'])

        # Amenities filter
        if filters.get('amenities'):
            amenities = filters['amenities']
            if isinstance(amenities, str):
                amenities = [amenities]

            for idx, amenity in enumerate(amenities):
                query += f" AND available_amenities LIKE :amenity_{idx}"
                params[f'amenity_{idx}'] = f'%{amenity}%'

    with engine.connect() as conn:
        result = conn.execute(text(query), params)
        result_all = [dict(row._mapping) for row in result.fetchall()]
        return result_all


# ──────────────────────────────────────────────
# JSON API ENDPOINTS (consumed by React frontend)
# ──────────────────────────────────────────────

@app.route('/api/accommodations', methods=['GET', 'POST'])
def api_accommodations():
    """
    GET  → return all accommodations
    POST → accept JSON filter body, return filtered accommodations
    """
    filters = None

    if request.method == 'POST':
        filters = request.get_json(silent=True) or {}

    accommodations = load_accommodations(filters if filters else None)
    return jsonify(accommodations)


@app.route('/api/accommodations/<int:accom_id>')
def api_accommodation_details(accom_id):
    """Return a single accommodation's full details as JSON"""
    query = """
        SELECT *
        FROM UnderKilometer_database
        WHERE id = :id
    """
    with engine.connect() as conn:
        result = conn.execute(text(query), {"id": accom_id})
        accommodation = result.mappings().first()

    if accommodation is None:
        return jsonify({"error": "Accommodation not found"}), 404

    accom_dict = dict(accommodation)
    return jsonify(accom_dict)


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
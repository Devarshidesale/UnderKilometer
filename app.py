from flask import Flask, render_template, request
from database import engine
from sqlalchemy import text

app = Flask(__name__)

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


# Getting details of accommodation after clicking on the card on the main page
@app.route('/details/<int:accom_id>')
def get_accommodation_details(accom_id):
    query = """
        SELECT *
        FROM UnderKilometer_database
        WHERE id = :id
    """
    with engine.connect() as conn:
        result = conn.execute(text(query), {"id": accom_id})
        accommodation = result.mappings().first()

    if accommodation is None:
        return "Accommodation not found", 404
        
    available_amenities = accommodation['available_amenities'].split(',')
    return render_template(
        'details.html',
        accom_param=accommodation,
        amenity_param=available_amenities,
    )


# filtering the accommodations 
# Main route - handles both display and filtering
@app.route('/', methods=['GET', 'POST'])
def index():
    filters = {}

    if request.method == 'POST':
        # Collect all filter parameters
        if request.form.get('distance'):
            filters['distance'] = request.form.get('distance')

        if request.form.get('accomodation_type'):
            filters['accomodation_type'] = request.form.get('accomodation_type')

        if request.form.get('gender_type'):
            filters['gender_type'] = request.form.get('gender_type')

        if request.form.get('min_rent'):
            filters['min_rent'] = request.form.get('min_rent')

        if request.form.get('max_rent'):
            filters['max_rent'] = request.form.get('max_rent')

        # Get amenities (can be multiple checkboxes)
        amenities = request.form.getlist('amenities')
        if amenities:
            filters['amenities'] = amenities

    # Load accommodations with or without filters
    accommodations = load_accommodations(filters if filters else None)

    return render_template(
        'index.html',
        accom_list=accommodations,
        applied_filters=filters,
        amenity_list=amenities_main_list
    )

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
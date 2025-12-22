from flask import Flask, render_template, request
from database import engine
from sqlalchemy import text

# "distance", "name of accommodation", "gender type", "room type", "overall monthly rent"
filter_list = []
# "wifi","ac","kitchen","parking","mess/tiffin","security(CCTV/guard","washing machine","personal washroom"
amenities = {
   "wifi":{
      "value":"wifi",
      "amenity-label":"Wi-Fi",
   },
   "ac":{
      "value":"ac",
      "amenity-label":"AC",
   },
   "kitchen":{
      "value":"kitchen",
      "amenity-label":"Kitchen",
   },
   "parking":{
      "value":"parking",
      "amenity-label":"Parking",
   },
   "mess":{
      "value":"mess",
      "amenity-label":"Mess/Tiffin",
   },
   "security":{
      "value":"security",
      "amenity-label":"Security(CCTV/Guard)",
   },
   "washing_machine":{
      "value":"washing_machine",
      "amenity-label":"Washing Machine",
   },
   "personal_washroom":{
      "value":"personal_washroom",
      "amenity-label":"Personal Washroom",
   },
}

app = Flask(__name__)

def load_accommodations(filters):
    query = "SELECT * FROM UnderKilometer_survey_response WHERE 1=1"
    params = {}

    # Distance filter
    if filters.get("distance") and filters["distance"] != "none":
        query += " AND distance <= :distance"
        params["distance"] = int(filters["distance"])

    # Accommodation type filter
    if filters.get("accommodation") and filters["accommodation"] != "all":
        query += " AND LOWER(accommodation_type) = :acc"
        params["acc"] = filters["accommodation"].lower()

    # Gender filter
    if filters.get("gender") and filters["gender"] != "all":
        query += " AND LOWER(gender) = :gender"
        params["gender"] = filters["gender"].lower()

    # Room type filter
    if filters.get("roomtype") and filters["roomtype"] != "all":
        query += " AND LOWER(room_type) = :room"
        params["room"] = filters["roomtype"].lower()

    # Rent range filter
    if filters.get("rent") and filters["rent"] != "all":
        rent_value = filters["rent"]
        if rent_value == "5k":
            query += " AND monthly_rent < 5000"
        elif rent_value == "10k":
            query += " AND monthly_rent >= 5000 AND monthly_rent < 10000"
        elif rent_value == "15k":
            query += " AND monthly_rent >= 10000 AND monthly_rent < 15000"
        elif rent_value == "20k":
            query += " AND monthly_rent >= 15000 AND monthly_rent < 20000"
        elif rent_value == "above":
            query += " AND monthly_rent >= 20000"

    # Amenities filter (multiple checkboxes)
    selected_amenities = filters.get("amenity", [])
    if amenities:
        # Assuming you have columns for amenities like wifi, ac, kitchen, etc.
        for amenity in selected_amenities:
            query += f" AND {amenity} = 1"  # Adjust based on your schema

    print("FINAL SQL:", query)
    print("PARAMS:", params)

    with engine.connect() as conn:
        result = conn.execute(text(query), params)
        return [dict(row._mapping) for row in result.fetchall()]

          

@app.route('/', methods=['GET'])
def index():
    # Get filters - use flat=True to get single values instead of lists
    filters = {}
    filters['distance'] = request.args.get('distance', 'none')
    filters['accommodation'] = request.args.get('accommodation', 'all')
    filters['gender'] = request.args.get('gender', 'all')
    filters['roomtype'] = request.args.get('roomtype', 'all')
    filters['rent'] = request.args.get('rent', 'all')
    filters['amenity'] = request.args.getlist('amenity')  # Get list for checkboxes

    print("FILTERS RECEIVED:", filters)

    accommodations = load_accommodations(filters)

    print(f"FOUND {len(accommodations)} ACCOMMODATIONS")

    return render_template(
        'index.html',
        accomodations=accommodations,
        amenities=amenities,
    )
  
if __name__ == '__main__':
   app.run(host='0.0.0.0', debug=True) 
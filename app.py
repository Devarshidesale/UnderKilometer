from flask import Flask, render_template, request
from sqlalchemy import text
from database import engine

app = Flask(__name__)

amenities = {
    "wifi": {"value": "wifi", "amenity-label": "Wi-Fi"},
    "ac": {"value": "ac", "amenity-label": "AC"},
    "kitchen": {"value": "kitchen", "amenity-label": "Kitchen"},
    "parking": {"value": "parking", "amenity-label": "Parking"},
    "mess": {"value": "mess", "amenity-label": "Mess"},
    "security": {"value": "security", "amenity-label": "Security"},
    "washing_machine": {"value": "washing_machine", "amenity-label": "Washing Machine"},
    "personal_washroom": {"value": "personal_washroom", "amenity-label": "Personal Washroom"},
}


def load_accommodations(filters):
    query = "SELECT * FROM UnderKilometer_survey_response WHERE 1=1"
    params = {}

    if filters["distance"] != "none":
        query += " AND distance <= :distance"
        params["distance"] = int(filters["distance"])

    if filters["accommodation"] != "all":
        query += " AND LOWER(accommodation_type) = :acc"
        params["acc"] = filters["accommodation"]

    if filters["gender"] != "all":
        query += " AND LOWER(gender) = :gender"
        params["gender"] = filters["gender"]

    if filters["roomtype"] != "all":
        query += " AND LOWER(room_type) = :room"
        params["room"] = filters["roomtype"]

    rent = filters["rent"]
    if rent != "all":
        rent_map = {
            "5k": "monthly_rent < 5000",
            "10k": "monthly_rent BETWEEN 5000 AND 9999",
            "15k": "monthly_rent BETWEEN 10000 AND 14999",
            "20k": "monthly_rent BETWEEN 15000 AND 19999",
            "above": "monthly_rent >= 20000",
        }
        query += f" AND {rent_map[rent]}"

    for amenity in filters["amenity"]:
        if amenity in amenities:
            query += f" AND {amenity} = 1"

    with engine.connect() as conn:
        result = conn.execute(text(query), params)
        return [dict(row._mapping) for row in result.fetchall()]


@app.route("/", methods=["GET"])
def index():
    filters = {
        "distance": request.args.get("distance", "none"),
        "accommodation": request.args.get("accommodation", "all"),
        "gender": request.args.get("gender", "all"),
        "roomtype": request.args.get("roomtype", "all"),
        "rent": request.args.get("rent", "all"),
        "amenity": request.args.getlist("amenity"),
    }

    accommodations = load_accommodations(filters)

    return render_template(
        "index.html",
        accomodations=accommodations,
        amenities=amenities
    )


if __name__ == "__main__":
    app.run(debug=True)

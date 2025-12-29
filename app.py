from flask import Flask, render_template, request
from database import engine
from sqlalchemy import text

app = Flask(__name__)

def load_accommodations():
    query = "SELECT * FROM UnderKilometer_database"
    with engine.connect() as conn:
        result = conn.execute(text(query))
        result_all = [dict(row._mapping) for row in result.fetchall()]
        # print(result_all)
        return result_all


# Getting details of accommodation after clicking on the card on the main page
@app.route('/accommodation_details/<int:accom_id>')
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

    return render_template(
        'details.html',
        accommodation=accommodation
    )


        

@app.route('/', methods=['GET'])
def index():
    # print(f"FOUND {len(load_accommodations())} ACCOMMODATIONS")
    return render_template(
        'index.html',
        accom_list=load_accommodations(),
    )

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
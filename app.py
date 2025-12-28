from flask import Flask, render_template, request
from database import engine
from sqlalchemy import text

app = Flask(__name__)

def load_accommodations():
    query = "SELECT * FROM UnderKilometer_database"
    with engine.connect() as conn:
        result = conn.execute(text(query))
        return [dict(row._mapping) for row in result.fetchall()]

  
@app.route('/accommodation_details')
def accommodation_details_view():
    return render_template('accommodation_details.html')

@app.route('/', methods=['GET'])
def index():
    accommodations = load_accommodations()
    print(f"FOUND {len(accommodations)} ACCOMMODATIONS")
    return render_template(
        'index.html',
        accom_param=accommodations,
    )

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
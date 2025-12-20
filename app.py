from flask import Flask, render_template, jsonify
from database import engine
from sqlalchemy import text

app = Flask(__name__)

# ACCOMODATIONS = [
#    {
#       "name": "khandu hostel",
#       "distance": "800m",
#       "rent": "4200/month",
#    },
#    {
#       "name": "stanza living",
#       "distance": "1500m",
#       "rent": "25000/month",
#    },  
# ]

def load_accomodations():
   with  engine.connect() as connection:
      result = connection.execute(text("SELECT * FROM UnderKilometer_survey_response"))
      #making a list of dictionaries with each dictionary is row of table
      test_dict = [dict(row._mapping) for row in result.all()]  
      return test_dict

@app.route('/')
def hello_world():
   return render_template('index.html', accomodations= load_accomodations())

# @app.route('/accommodations')
# def list():
#    return jsonify(ACCOMODATIONS)
   
if __name__ == '__main__':
   app.run(host='0.0.0.0', debug=True) 
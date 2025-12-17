from flask import Flask, render_template, jsonify

app = Flask(__name__)

ACCOMODATIONS = [
   {
      "name": "khandu hostel",
      "distance": "800m",
      "rent": "4200/month",
   },
   {
      "name": "stanza living",
      "distance": "1500m",
      "rent": "25000/month",
   },  
]

@app.route('/')
def hello_world():
   return render_template('index.html', accomodations= ACCOMODATIONS)

@app.route('/accommodations')
def list():
   return jsonify(ACCOMODATIONS)
   
if __name__ == '__main__':
   app.run(host='0.0.0.0', debug=True) 
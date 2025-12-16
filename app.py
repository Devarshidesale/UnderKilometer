from flask import Flask, render_template

app = Flask(__name__)

ACCOMODATIONS = [
   {
      "type": "hostel",
      "name": "khedekar hostel",
      "distance": "800m",
      "rent": "4200/month",
   },
   {
      "type": "pg",
      "name": "atmosphere",
      "distance": "1500m",
      "rent": "25000/month",
   },
   {
      "type": "flat",
      "name": "siddhi residency",
      "distance": "300m",
      "rent": "24000/month",
   }
]

@app.route('/')
def hello_world():
   return render_template('index.html')

if __name__ == '__main__':
   app.run(host='0.0.0.0', debug=True) 
from flask import Flask
from flask_restful import Api
from myapi.resources.stations import Stations
from myapi.resources.carRouting import CarRouting
from myapi.resources.trainRouting import TrainRouting

from flask import render_template

app = Flask(__name__)
api = Api(app)

api.add_resource(Stations, '/api/stations')

api.add_resource(CarRouting, '/api/carTime')
api.add_resource(TrainRouting, '/api/trainTime')


@app.route("/")
def hello():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(port=5001, debug=True)
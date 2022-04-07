from flask import Flask
from flask_restful import Api
from myapi.resources.foo import Foo
from myapi.resources.stations import Stations
from myapi.resources.connections import Connections

from flask import render_template

app = Flask(__name__)
api = Api(app)

api.add_resource(Stations, '/api/stations')

api.add_resource(Connections, '/api/connections')


@app.route("/")
def hello():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(port=5001, debug=True)
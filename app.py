from flask import Flask
from flask_restful import Api
from myapi.resources.foo import Foo
from myapi.resources.stations import Stations

from flask import render_template

app = Flask(__name__)
api = Api(app)

api.add_resource(Foo, '/Foo', '/Foo/1')
api.add_resource(Stations, '/api/stations')


@app.route("/")
def hello():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(port=5000, debug=True)
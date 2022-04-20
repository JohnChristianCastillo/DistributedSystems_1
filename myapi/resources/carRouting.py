import datetime
from flask_restful import Resource, reqparse
import requests

class CarRouting(Resource):
    def get(self):  # calculate time between two stations
        parser = reqparse.RequestParser()
        parser.add_argument('fromLocationX', type=str, help='Longitude neds to be specified')
        parser.add_argument('fromLocationY', type=str, help='Latitude needs to be specified')
        parser.add_argument('toLocationX', type=str, help='Longitude neds to be specified')
        parser.add_argument('toLocationY', type=str, help='Latitude needs to be specified')

        args = parser.parse_args()
        retVal = {}

        carUrl = f"http://router.project-osrm.org/route/v1/driving/{args['fromLocationX']},{args['fromLocationY']};{args['toLocationX']},{args['toLocationY']}?steps=false"
        response = requests.request("GET", carUrl)
        response = response.json()
        carResponse = response['routes'][0]['duration']

        carResponse = str(datetime.timedelta(seconds=carResponse))
        retVal['car'] = carResponse
        return retVal


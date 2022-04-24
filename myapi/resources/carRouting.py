import datetime
from flask_restful import Resource, reqparse
import requests


class CarRouting(Resource):
    def get(self):
        """
        Calculates the travel time from a given train station to another destination station by means of a car
        :return: The travel time split in Hours:Minutes:Seconds
        """
        parser = reqparse.RequestParser()
        parser.add_argument('fromLocationX', type=str, help='Invalid longitude value for source')
        parser.add_argument('fromLocationY', type=str, help='Invalid latitude value for source')
        parser.add_argument('toLocationX', type=str, help='Invalid longitude value for destination')
        parser.add_argument('toLocationY', type=str, help='Invalid latitude value for destination')

        args = parser.parse_args()
        retVal = {}

        carUrl = f"http://router.project-osrm.org/route/v1/driving/{args['fromLocationX']},{args['fromLocationY']};{args['toLocationX']},{args['toLocationY']}?steps=false"
        response = requests.request("GET", carUrl)
        response = response.json()
        # check whether the response we got from osrm is valid
        if ('code' in response and response['code'] != "Ok"):
            retVal['carError'] = response['message']
            retVal['carMessage'] = "Invalid Query"
        else:
            if(response['waypoints'][0]['name'] == ""):
                retVal['Starting point'] = "Starting point is not recognized by OSRM"
            else:
                retVal['Starting point'] = response['waypoints'][0]['name']
            if(response['waypoints'][-1]['name'] == ""):
                retVal['Destination'] = "Destination is not recognized by OSRM"
            else:
                retVal['Destination'] = response['waypoints'][-1]['name']
            carResponse = response['routes'][0]['duration']
            carResponse = str(datetime.timedelta(seconds=carResponse))
            retVal['Travel time'] = carResponse
        return retVal


import datetime
from flask_restful import Resource, reqparse
import requests

class TrainRouting(Resource):
    def get(self):  # calculate time between two stations
        """
        Calculates the travel time from a given train station to another destination station by means of a train
        :return: The travel time split in Hours:Minutes:Seconds
        """
        # vb: api.irail.be/connections/?from=Gent-Sint-Pieters&to=Mechelen&date=070422&time=1230&timesel=departure&format=json&lang=en&typeOfTransport=automatic&alerts=false&results=6
        format = "json"
        lang = "en"
        parser = reqparse.RequestParser()
        parser.add_argument('from', type=str, help='Start station needs to be specified')
        parser.add_argument('to', type=str, help='End station needs to be specified')

        args = parser.parse_args()
        # format: https://api.irail.be/connections/?from=Gent-Sint-Pieters&to=Mechelen&format=json
        trainUrl = "https://api.irail.be/connections/"
        response = requests.request("GET", trainUrl, params={"from":args["from"], "to":args["to"], "format": format, "lang":lang})
        statusCode = response.status_code
        response = response.json()
        retVal = {}

        retVal['statusCode'] = statusCode
        # special case: if from and to are the same then status will be 500
        if(statusCode == 500 and args["from"] == args["to"]):
            retVal['statusCode'] = 200
            retVal['Departure station'] = args['from']
            retVal['Destinations tation'] = args['to']
            retVal['Travel time'] = "0:00:00"
            return retVal, 200
        elif('error' in response):
            retVal['trainMessage'] = "No routes found"
            return retVal, response['error']
        else:
            retVal['Departure station'] = response['connection'][0]['departure']['station']
            retVal['Destination station'] = response['connection'][0]['arrival']['station']
            trainResponse = response['connection'][0]['duration']
            trainResponse = str(datetime.timedelta(seconds=int(trainResponse)))
            retVal['Travel time'] = trainResponse
        return retVal, statusCode


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
        response = response.json()
        retVal = {}
        if('error' in response):
            retVal['trainError'] = response['error']
            retVal['trainMessage'] = "No routes found"
        else:
            retVal['Departure station'] = response['connection'][0]['departure']['station']
            retVal['Destination station'] = response['connection'][0]['arrival']['station']
            trainResponse = response['connection'][0]['duration']
            trainResponse = str(datetime.timedelta(seconds=int(trainResponse)))
            retVal['Travel time'] = trainResponse
        return retVal


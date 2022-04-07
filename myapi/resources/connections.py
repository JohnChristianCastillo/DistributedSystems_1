import datetime
import json

from flask_restful import Resource, reqparse
import requests
import pprint

class Connections(Resource):
    def get(self):  # calculate time between two stations
        # vb: api.irail.be/connections/?from=Gent-Sint-Pieters&to=Mechelen&date=070422&time=1230&timesel=departure&format=json&lang=en&typeOfTransport=automatic&alerts=false&results=6

        start = ""
        destination = ""
        date = ""
        time = ""
        timesel = "departure"
        format = "json"
        lang = "en"
        typeOfTransport = "automatic"
        alerts = "false"
        results = "6"

        parser = reqparse.RequestParser()
        parser.add_argument('from', type=str, help='Start station needs to be specified')
        parser.add_argument('to', type=str, help='End station needs to be specified')
        parser.add_argument('fromLocationX', type=str, help='Longitude neds to be specified')
        parser.add_argument('fromLocationY', type=str, help='Latitude needs to be specified')
        parser.add_argument('toLocationX', type=str, help='Longitude neds to be specified')
        parser.add_argument('toLocationY', type=str, help='Latitude needs to be specified')

        args = parser.parse_args()
        trainUrl = "https://api.irail.be/connections/"
        response = requests.request("GET", trainUrl, params={"from":args["from"], "to":args["to"], "format": format, "lang":lang})
        response = response.json()
        trainResponse = ''
        if('error' in response):
            trainResponse = response['message']
        else:
            trainResponse = response['connection'][0]['duration']
            trainResponse = str(datetime.timedelta(seconds=int(trainResponse)))
        carUrl = f"http://127.0.0.1:5000/route/v1/driving/{args['fromLocationX']},{args['fromLocationY']};{args['toLocationX']},{args['toLocationY']}?steps=false"
        response = requests.request("GET", carUrl)
        response = response.json()
        carResponse = response['routes'][0]['duration']
        #todo: what if there is no route
        carResponse = str(datetime.timedelta(seconds=carResponse))
        return {"train": trainResponse, "car": carResponse}


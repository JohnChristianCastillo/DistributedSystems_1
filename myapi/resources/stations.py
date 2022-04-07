from flask_restful import Resource
import requests
import pprint


class Stations(Resource):
    def get(self):
        url = "http://api.irail.be/stations/?format=json&lang=nl"
        payload = {}
        headers = {}

        response = requests.request("GET", url, headers=headers, data=payload)

        return response.json()

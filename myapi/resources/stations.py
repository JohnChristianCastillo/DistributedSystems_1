from flask_restful import Resource
import requests


class Stations(Resource):
    def get(self):
        """
            Endpoint used to fetch all train stations registered in iRail
        :return: A json formatted response containing all train stations registered in iRail
        """
        url = "http://api.irail.be/stations/?format=json&lang=nl"
        payload = {}
        headers = {}

        response = requests.request("GET", url, headers=headers, data=payload)
        statusCode = response.status_code
        return response.json(), statusCode

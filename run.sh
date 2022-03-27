mkdir osrm
cd osrm
wget http://download.geofabrik.de/europe/belgium-latest.osm.pbf
sudo docker run -t -v "${PWD}:/data" osrm/osrm-backend osrm-extract -p /opt/car.lua /data/belgium-latest.osm.pbf
sudo docker run -t -v "${PWD}:/data" osrm/osrm-backend osrm-partition /data/belgium-latest.osrm
sudo docker run -t -v "${PWD}:/data" osrm/osrm-backend osrm-customize /data/belgium-latest.osrm
sudo docker run -t -i -p 5000:5000 -v "${PWD}:/data" osrm/osrm-backend osrm-routed --algorithm mld /data/belgium-latest.osrm



curl "http://127.0.0.1:5000/route/v1/driving/51.208115,4.421172;51.210481,4.414177?steps=true"

# building templates
docker build . -f docker/Dockerfile -t osrm-frontend
docker run -p 9966:9966 osrm-frontend
npm install
npm start

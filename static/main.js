var map = L.map('map').setView([51.219007, 4.421005], 13);
// add a tile layer to the (empty) map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, ' +
        '<a href="https://www.google.com/maps">Google Maps</a>, ' +
        '<a href="https://www.onderwijskiezer.be/v2/hoger/hoger_vestigingen.php">Onderwijskiezer</a>, ' +
        '<a href="https://www.goudengids.be/">Gouden Gids</a> contributors'
}).addTo(map);


var dir =
$(document).ready(function(){
    var $data = $('#data')
    $.ajax({
        url: "http://127.0.0.1:5001/api/stations",
        type: "GET",
        success: function (data){
            $.each(data.station, function(i, station_i){
                marker = new L.marker([station_i.locationY, station_i.locationX])
                    .bindPopup(station_i.name)
                    .addTo(map)
                //console.log(station_i.name)
                console.log(station_i.locationX + "---" + station_i.locationY + "===" + station_i.name )
            })
            //console.log(data.station)
            //console.log("done printing stations:")
            //console.log(data);
        },
        error: function (error){
            console.log(error);
        }
    })
})


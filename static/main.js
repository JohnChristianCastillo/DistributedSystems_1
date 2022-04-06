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
                    .addTo(map)
                    .on({
                        'mouseover': function(e){
                            L.popup({
                                offset: [0, -20]
                            })
                                .setContent(station_i.name)
                                .setLatLng(e.latlng)
                                .openOn(map);
                            setTimeout(function () {
                                map.closePopup();
                            }, 15000)
                        },
                        'click': function(){
                            doRouting(station_i, marker);
                        }
                    })
                //console.log(station_i.name)
                //console.log(station_i.locationX + "---" + station_i.locationY + "===" + station_i.name )
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

let state = {
    fromClicked: false,
    toClicked: false,
    from: null,
    to: null,
    fromName: null,
    toName: null,
}

function doRouting(station, marker){
    if(!state.fromClicked && station.name !== state.toName){
        state.fromClicked = true;
        state.from = station;
        state.fromName = station.name
        $('#start').val(state.fromName);
        console.log("From station clicked");
    }
    // click second station
    else if(state.fromClicked && !state.toClicked && station.name !== state.fromName){
        state.toClicked = true;
        state.to = station;
        state.toName = station.name
        $('#end').val(state.toName);
        console.log("end station clicked");
    }
    // remove from
    else if(state.fromClicked && station.name === state.fromName){
        state.fromClicked = false;
        state.from = null;
        state.fromName = null;
        $('#start').val(null);
        console.log("start station Resetted");
    }
    else if(state.toClicked && station.name === state.toName){
        state.toClicked = false;
        state.to = null;
        state.toName = null;
        $('#end').val(null);
        console.log("end station Resetted");
    }
}

// Clear button click
document.getElementById("clear").addEventListener("click", function(){
    for(var member in state) delete state[member];
    console.log(state);
    $('#start').val(null);
    $('#end').val(null);
})

// Clear button click
document.getElementById("calculateDirection").addEventListener("click", function(){
    alert("calculating direction");
    $.ajax({
        url: "http://127.0.0.1:5000/route/v1/driving/51.208115,4.421172;51.210481,4.414177?steps=true",
        type: "GET",
        success: function (data){
            console.log(data);
            //console.log(data.station)
            //console.log("done printing stations:")
            //console.log(data);
        },
        error: function (error){
            console.log(error);
        }
    })
})
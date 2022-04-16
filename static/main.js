var map = L.map('map').setView([51.219007, 4.421005], 13);
// add a tile layer to the (empty) map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, ' +
        '<a href="https://www.google.com/maps">Google Maps</a>, ' +
        '<a href="https://www.onderwijskiezer.be/v2/hoger/hoger_vestigingen.php">Onderwijskiezer</a>, ' +
        '<a href="https://www.goudengids.be/">Gouden Gids</a> contributors'
}).addTo(map);

var iconSetting = L.Icon.extend({
    options: {
        iconSize: [40.4, 44],
        iconAnchor: [20, 43],
        popupAnchor: [0, -51]
    }
});
var blackIcon = new iconSetting({
    iconUrl: 'https://raw.githubusercontent.com/JohnChristianCastillo/Language-Detector/main/marker-icon-19-512.png',
})

var yellowIcon = new iconSetting({
    iconUrl: 'https://raw.githubusercontent.com/JohnChristianCastillo/Language-Detector/main/marker-icon-19-512%20(1).png'
});
var defaultIcon = new iconSetting({
    iconUrl: 'https://raw.githubusercontent.com/JohnChristianCastillo/Language-Detector/main/marker-icon-19-512%20(2).png'
});
var markers = [];
var stations = [];

function alphabetizeList(listField) {
    var sel = $(listField);
    var selected = sel.val(); // cache selected value, before reordering
    var opts_list = sel.find('option');
    opts_list.sort(function (a, b) {
        return $(a).text() > $(b).text() ? 1 : -1;
    });
    sel.html('').append(opts_list);
    sel.val(selected); // set cached selected value
}
var dir =
$(document).ready(function(){
    var $data = $('#data')
    $.ajax({
        url: "http://127.0.0.1:5001/api/stations",
        type: "GET",
        success: function (data){
            $.each(data.station, function(i, station_i){
                marker = new L.marker([station_i.locationY, station_i.locationX], {icon:defaultIcon, name: station_i.name})
                    .addTo(map)
                    .on({
                        'mouseover': function(e){
                            L.popup({
                                offset: [0, -20]
                            })
                                .setContent(station_i.name)
                                .setLatLng(e.latlng)
                                .openOn(map);
                            setTimeout(function (){
                                map.closePopup();
                            }, 15000)
                        },
                        'click': function(){
                            doRouting(station_i);
                        }
                    })
                var option = document.createElement("option");
                document.getElementById("start").appendChild(option);
                option.textContent = station_i.name;
                option.value = station_i.name;
                markers.push(marker);
                stations.push(station_i);
                //console.log(station_i.name)
                //console.log(station_i.locationX + "---" + station_i.locationY + "===" + station_i.name )
            })
            alphabetizeList('#start');

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
    longitude: null,
    latitude: null,
    fromMarker: null,
    toMarker: null
}

function doRouting(station, changeStart = false, changeDest = false){
    var mark = null;
    for(var i = 0; i<markers.length; ++i){
        if(markers[i].options.name == station.name){
            mark = markers[i];
        }
    }
    if((!state.fromClicked && station.name !== state.toName) || changeStart){
        if(state.fromClicked){ //this is for whenever a change is done via selection and not by map
            state.fromMarker.setIcon(defaultIcon);
        }
        mark.setIcon(blackIcon);
        state.fromMarker = mark;
        state.fromClicked = true;
        state.from = station;
        state.fromName = station.name
        $('#start').val(state.fromName);
        console.log("From station clicked");
        console.log(changeStart);
    }
    // click second station
    else if((state.fromClicked && !state.toClicked && station.name !== state.fromName) || changeDest){
        if(state.toClicked){ //this is for whenever a change is done via selection and not by map
            state.toMarker.setIcon(defaultIcon);
        }
        mark.setIcon(yellowIcon);
        state.toMarker = mark;
        state.toClicked = true;
        state.to = station;
        state.toName = station.name;
        $('#end').val(state.toName);
        console.log("end station clicked");
    }
    // remove from
    else if(state.fromClicked && station.name === state.fromName){
        mark.setIcon(defaultIcon);
        state.fromMarker = null;
        state.fromClicked = false;
        state.from = null;
        state.fromName = null;
        $('#start').val(null);
        console.log("start station Resetted");
    }
    else if(state.toClicked && station.name === state.toName){
        mark.setIcon(defaultIcon);
        state.toMarker = null;
        state.toClicked = false;
        state.to = null;
        state.toName = null;
        $('#end').val(null);
        console.log("end station Resetted");
    }
}
// Clear button click
document.getElementById("start").addEventListener("click", function(){
    var e = document.getElementById("start");
    var val = e.value;
    for(var i = 0; i < stations.length; ++i){
        if(stations[i].name == val){
            map.flyTo(new L.LatLng(stations[i].locationY, stations[i].locationX), 13);
            doRouting(stations[i], true, false);
            break;
        }
    }
})
// Clear button click
document.getElementById("clear").addEventListener("click", function(){
    if(state.fromMarker){
        state.fromMarker.setIcon(defaultIcon);
    }
    if(state.toMarker){
        state.toMarker.setIcon(defaultIcon);
    }
    for(var member in state) delete state[member];
    console.log(state);
    $('#start').val(null);
    $('#end').val(null);
    $('#trainTime').val(null);
    $('#carTime').val(null);
})

// Clear button click
document.getElementById("calculateDirection").addEventListener("click", function(){
    //alert("calculating direction");
    //alert(state.from.locationY);
    $.ajax({
        url: `http://127.0.0.1:5001/api/connections`,
        data: {
            from: $('#start').val(),
            to: $('#end').val(),
            fromLocationX: state.from.locationX,
            fromLocationY: state.from.locationY,
            toLocationX: state.to.locationX,
            toLocationY: state.to.locationY
        },
        type: "GET",
        success: function (data){
            if('error' in data){
                $('#trainTime').val(data["message"])
            }
            else{
                $('#trainTime').val(data["train"])
            }
            $('#carTime').val(data["car"])
            console.log(data);
            console.log(data["train"]);
            //console.log(data.station)
            //console.log("done printing stations:")
            //console.log(data);
        },
        error: function (error){
            console.log(error);
        }
    })
})


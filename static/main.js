/**
 * Initialize the map object
 */
var map = L.map('map').setView([51.219007, 4.421005], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, ' +
        '<a href="https://www.google.com/maps">Google Maps</a>, ' +
        '<a href="https://www.onderwijskiezer.be/v2/hoger/hoger_vestigingen.php">Onderwijskiezer</a>, ' +
        '<a href="https://www.goudengids.be/">Gouden Gids</a> contributors'
}).addTo(map);

/**
 *  Create custom icons for custom markers
 */
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


/**
 *  Create a "state" object
 */
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

/**
 * Acts as the main body
 */
var dir = $(document).ready(function(){
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
                                //.setContent("name: "+ station_i.name + <br/> + "latitude: " + station_i.locationY + <br/> +"longitude: "+station_i.locationX)
                                .setContent(`${station_i.name} <br> y-coords: ${station_i.locationY} <br> x-coords: ${station_i.locationX}`)
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
                var option2 = document.createElement("option");
                option.textContent = station_i.name;
                option.value = station_i.name;
                option2.textContent = station_i.name;
                option2.value = station_i.name;
                document.getElementById("start").appendChild(option);
                document.getElementById("end").appendChild(option2);


                markers.push(marker);
                stations.push(station_i);
                //console.log(station_i.name)
                //console.log(station_i.locationX + "---" + station_i.locationY + "===" + station_i.name )
            })
            alphabetizeList('#start');
            alphabetizeList('#end');

            //console.log(data.station)
            //console.log("done printing stations:")
            //console.log(data);
        },
        error: function (error){
            console.log(error);
        }
    })
})

/**
 * Helper function to alphabetize the dropdown list of train stations
 * @param listField: Field of which we want to alphabetize
 */
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

/**
 * Helper function to store and display the data which is sent in by the user interacting with the website
 * @param station: The station clicked/selected
 * @param changeStart: Boolean variable that is derived from interacting with the dropdown selection menu
 *                     telling us whether the starting station should be changed or not
 * @param changeDest: Boolean variable that is derived from interacting with the dropdown selection menu
 *                     telling us whether the destination station should be changed or not
 */
function doRouting(station, changeStart = false, changeDest = false){
    var mark = null; // object pointing to the correct marker we interacted with
    // loop through all the markers to find the interacted station
    for(var i = 0; i<markers.length; ++i){
        if(markers[i].options.name === station.name){
            mark = markers[i];
        }
    }

    // We always want to first fill in the initial station before the destination station
    if((!state.fromClicked && station.name !== state.toName && !changeDest) || changeStart){
        if(state.fromClicked){ //this is for whenever a change is done via selection and not by map
            state.fromMarker.setIcon(defaultIcon);
        }
        mark.setIcon(blackIcon);
        state.fromMarker = mark;
        state.fromClicked = true;
        state.from = station;
        state.fromName = station.name
        $('#start').val(state.fromName);
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
    }
    // This allows us to remove the initial station selected
    else if(state.fromClicked && station.name === state.fromName){
        mark.setIcon(defaultIcon);
        state.fromMarker = null;
        state.fromClicked = false;
        state.from = null;
        state.fromName = null;
        $('#start').val(null);
    }
    // This allows us to remove the destinations station selected
    else if(state.toClicked && station.name === state.toName){
        mark.setIcon(defaultIcon);
        state.toMarker = null;
        state.toClicked = false;
        state.to = null;
        state.toName = null;
        $('#end').val(null);
    }
}

/**
 *  A "Listener" type which helps us detect whether the initial station has been chosen.
 *  After choosing, we then pan over the selected station
 *  and afterwards we call the function which properly processes the given data
 */
// start selection interaction
document.getElementById("start").addEventListener("click", function(){
    var e = document.getElementById("start");
    var val = e.value;
    for(var i = 0; i < stations.length; ++i){
        if(stations[i].name === val){
            map.flyTo(new L.LatLng(stations[i].locationY, stations[i].locationX), 13);
            doRouting(stations[i], true, false);
            break;
        }
    }
})

/**
 *  A "Listener" type which helps us detect whether the destination station has been chosen.
 *  After choosing, we then pan over the selected station
 *  and afterwards we call the function which properly processes the given data
 */
// destination selection interaction
document.getElementById("end").addEventListener("click", function(){
    var e = document.getElementById("end");
    var val = e.value;
    for(var i = 0; i < stations.length; ++i){
        if(stations[i].name == val){
            map.flyTo(new L.LatLng(stations[i].locationY, stations[i].locationX), 13);
            doRouting(stations[i], false, true);
            break;
        }
    }
})

/**
 *  A "Listener" type which helps us detect whether the clear button has been pressed.
 *  After choosing, we then pan over the selected station
 *  and afterwards we call the function which properly processes the given data
 */
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

/**
 * A "Listener" which detects whether the "Calculate Time" button is clicked
 * Calculates the travel time both by train and by car. Both of which makes use of Get requests to
 * this projects' own API endpoints
 */
document.getElementById("calculateTime").addEventListener("click", function(){
    // call trainRouting API
    $.ajax({
        url: `http://127.0.0.1:5001/api/trainTime`,
        data: {
            from: $('#start').val(),
            to: $('#end').val(),
        },
        type: "GET",
        success: function (data){
            if('trainError' in data){
                $('#trainTime').val("No results found")
            }
            else{
                $('#trainTime').val(data["Travel time"])
            }
        },
        error: function (error){
            console.log(error);
        }
    })
    // call carRouting API
    $.ajax({
        url: `http://127.0.0.1:5001/api/carTime`,
        data: {
            fromLocationX: state.from.locationX,
            fromLocationY: state.from.locationY,
            toLocationX: state.to.locationX,
            toLocationY: state.to.locationY
        },
        type: "GET",
        success: function (data){
            if('carError' in data){
                $('#carTime').val("No results found")
            }
            else{
                $('#carTime').val(data["Travel time"])
            }
        },
        error: function (error){
            console.log(error);
        }
    })
})


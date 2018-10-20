var map;
var infowindow;
var foursquareMarkers = [];
var directionsService = new google.maps.DirectionsService();
  var directionsDisplay = new google.maps.DirectionsRenderer();
function initialize() {
  infowindow = new google.maps.InfoWindow();
  
  var center = new google.maps.LatLng(36.114647, -115.172813);// new is an operator used to create new object(class or contructor)
  map = new google.maps.Map(document.getElementById('map'), {
    center: center,
    zoom: 15
  });
  var input = document.getElementById('my-input');//use to modify the content of an ID
  var searchBox = new google.maps.places.SearchBox(input);
  //map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
  google.maps.event.addListener(map, 'bounds_changed', function () { searchBox.setBounds(map.getBounds()); })
  /*map.addListener('bounds_changed', function () {// keep the map in place though when
    searchBox.setBounds(map.getBounds());
  });*/
  var markers = [];
  searchBox.addListener('places_changed', function () {
    var places = searchBox.getPlaces();

    if (places.length == 0) {
      return;
    }
    // Clear out the old markers.
    markers.forEach(function (marker) {
      marker.setMap(null);
    });
    markers = [];
    foursquareMarkers.forEach(function (marker) {
      marker.setMap(null);
    });
    foursquareMarkers = [];

    places.forEach(function (place) {
      if (!place.geometry) {
        console.log("Returned place contains no geometry");
        return;
      }

      // Create a marker for each place.
      markers.push(createMarker(place));
    })
    map.setCenter(markers[0].getPosition())
  })
directionsDisplay.setMap(map);

  /*var request = {
    location: center,
    radius: 16093,
    types: ['resort'],
  };
  infowindow = new google.maps.InfoWindow();

  var service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, callback);*///show the place nearby
}
/*function calcRoute() {
  var start = document.getElementById('start').value;
  var end = document.getElementById('end').value;
  var request = {
    origin: start,
    destination: end,
    travelMode: 'DRIVING'
  };
  directionsService.route(request, function(result, status) {
    if (status == 'OK') {
      directionsDisplay.setDirections(result);
    }
  });
}*/
function getFoursquareApi(ll, callback) {

  const settings = {
    url: "https://api.foursquare.com/v2/search/recommendations",
    data: {
      ll: ll,
      client_id: "R0UFFWVSSUGHLEVYW3ZMA1S23G0VNNIN5LCXP0Z30A0MGOFS", client_secret: "L11QJC12FJMGYOWOQTLLAZD1HDPCGS5U32IGJGBMZSD2UI3B",
      v: "20180903",
      query: "coffee",
      radius: 3500,
      intent: 'coffee',
      limit: 10,
      sortByDistance: false,//1 mile
    },
    dataType: 'json',
    type: 'GET',
    success: function (data) {
      //callback(JSON.stringify(data, null, 2));
      for (var i = 0; i < data.response.group.results.length; i++) {
        foursquareMarker(data.response.group.results[i]);
      }
    }
  };

  $.ajax(settings);
}
/*function getCafeAPI() {
  const settings = {
    url: "https://api.foursquare.com/v2/venues/search",
    data: {
      ll: ll,
      client_id: "R0UFFWVSSUGHLEVYW3ZMA1S23G0VNNIN5LCXP0Z30A0MGOFS", client_secret: "L11QJC12FJMGYOWOQTLLAZD1HDPCGS5U32IGJGBMZSD2UI3B",
      v: "20180903",
      query: "coffee",
      radius: 800,
      intent: 'browse',
      limit: 10,//1 mile
    },
    dataType: 'json',
    type: 'GET',
    success: function (data) {
      callback(JSON.stringify(data, null, 2));
      for (var i = 0; i < data.response.venues.length; i++) {
        foursquareMarker(data.response.venues[i]);
      }
    }
  };

  $.ajax(settings);
}*/
function callback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {//http 200 response
    for (var i = 0; i < results.length; i++) {
      createMarker(results[i]);
    }
  }
}
function foursquareMarker(result) {
  var image = {
    url: 'https://www.shareicon.net/data/512x512/2016/08/06/807635_map_512x512.png',
    scaledSize: new google.maps.Size(32, 32),
    // The origin for this image is (0, 0).
    origin: new google.maps.Point(0, 0),
    // The anchor for this image is the base of the flagpole at (0, 32).
    anchor: new google.maps.Point(0, 32)
  };
  var shape = {
    coords: [1, 1, 1, 20, 18, 20, 18, 1],
    type: 'poly'
  };
  var distanceInMile = result.venue.location.distance * 0.000621371192;
  var marker = new google.maps.Marker({
    map: map,
    icon: image,
    position: { lat: result.venue.location.lat, lng: result.venue.location.lng }
  });
  var snippet;
  if (result.snippets.items[0].detail) {
    snippet = result.snippets.items[0].detail.object.text
  }
  else {
    snippet = ""
  }
  google.maps.event.addListener(marker, 'click', function () {//use event listener to control the map
    infowindow.setContent('<div><strong>' + result.venue.name + '</strong><br>' +
      'Place ID: ' + result.venue.id + '<br>' +
      'Address: ' + result.venue.location.formattedAddress.join(' ') + '<br>' + 'Distance: ' + distanceInMile.toFixed(2) + ' miles' + '<br>' + 'Comment:' + snippet + '<br>' + '<button onclick="direction(event)" data-lat="' + result.venue.location.lat + '"  data-lng="' + result.venue.location.lng + '">Get Direction</button>' + '</div>');
    infowindow.open(map, this);
  });
  foursquareMarkers.push(marker);

}
function direction(event) {
  navigator.geolocation.getCurrentPosition(function(position) {
            var start = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
  var lat = event.target.getAttribute('data-lat');
  var lng = event.target.getAttribute('data-lng');
  var destination = new google.maps.LatLng(lat, lng);
  //var start = document.getElementById('start').value;
  //var end = document.getElementById('end').value;
  var start = new google.maps.LatLng(position.coords.latitude, position.coords.longitude );
  var request = {
    origin: start,
    destination: destination,
    travelMode: 'DRIVING'
  };
  directionsService.route(request, function(result, status) {
    if (status == 'OK') {
      directionsDisplay.setDirections(result);
    }
  });
  })
}

function createMarker(place) {
  //var placeLoc = place.geometry.location;//marker
  var marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location
  });
  google.maps.event.addListener(marker, 'click', function () {//use event listener to control the map
    infowindow.setContent('<div><strong>' + place.name + '</strong><br>' +
      'Place ID: ' + place.place_id + '<br>' +
      'Address: ' + place.vicinity + '<br>' + 'Rating: ' + place.rating + '</div>');
    foursquareMarkers.forEach(function (marker) {
      marker.setMap(null);
    });
    foursquareMarkers = [];
    infowindow.open(map, this);//this means sth triggers the event
    var ll = place.geometry.location.lat() + "," + place.geometry.location.lng();
    getFoursquareApi(ll, console.log);

  });
  return marker;

}

google.maps.event.addDomListener(window, 'load', initialize);// use to load google map properly and dynamically
$(document).ready(function() {
  initialize();
});
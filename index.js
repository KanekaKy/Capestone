var map;
    var infowindow;
    function initialize() {
    var center = new google.maps.LatLng(36.114647,-115.172813);
    map = new google.maps.Map(document.getElementById('map'), {
    center:center,
    zoom:15
    
});
var input = document.getElementById('my-input');
        var searchBox = new google.maps.places.SearchBox(input);
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
        map.addListener('bounds_changed', function() {
          searchBox.setBounds(map.getBounds());
        });
    var request = {
        location: center,
        radius: 16093, //10 miles in meters
        types:['resort']
    };
    infowindow = new google.maps.InfoWindow();

    var service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, callback);
}

function callback(results, status){
    if(status == google.maps.places.PlacesServiceStatus.OK){
        for (var i=0; i < results.length; i++){
            createMarker(results[i]);
        }
    }
}
function createMarker(place) {
    var placeLoc = place.geometry.location;
    var marker = new google.maps.Marker({
        map:map,
        position: place.geometry.location
    });
    google.maps.event.addListener(marker, 'click', function(){
        infowindow.setContent(place.name);
        infowindow.open(map, this);
    });
}

google.maps.event.addDomListener(window, 'load',initialize);
"use strict";
var map;
var infowindow;
var bounds;

// Create a new map - only center and zoom are required.
var createMap = function() {
  map = new google.maps.Map(document.getElementById("myMap"), {
    zoom: 10,
    center: new google.maps.LatLng(0, 0),
    mapTypeId: google.maps.MapTypeId.ROADMAP,
  });

  infowindow = new google.maps.InfoWindow();
  bounds = new google.maps.LatLngBounds(); 
}

// Show marker on google map. 
var showMarker = function(marker) {
  if (marker) {
    marker.setMap(map);
  }
}

// This function populates the infowindow when the marker is clicked. We'll 
// only allow one infowindow which will open at the marker that is clicked, 
// and populate based on that markers position.
var showInfoWindow = function(marker) {
  // Check to make sure the infowindow is not already opened on this marker.
  if (infowindow.marker != marker) {
    infowindow.marker = marker;
    infowindow.setContent("<b>" + marker.title + "</b><br>" + locations[marker.id].fact 
      + " <a href=\"" + locations[marker.id].source_url + "\" target=\"_blank\">" 
      + locations[marker.id].source_name + "</a>.");
    infowindow.open(map, marker);

    // Make sure the marker property is cleared if the infowindow is closed.
    infowindow.addListener("closeclick", function() {
      infowindow.setMarker = null;
    });
  }
}

var ViewModel = function() {
  var self = this;

  // Create map.
  createMap();
  
  // Create marker for each location.
  for (var i = 0; i < locations.length; i++) {
    // Create a marker for this location.
    var marker = new google.maps.Marker({
      map: map,
      position: locations[i].position,
      title: locations[i].title,
      animation: google.maps.Animation.DROP,
      id: i
    });

    // Extends this bounds to contain the given point.
    bounds.extend(marker.position);

    // Keep marker object into location.
    locations[i].marker = marker;

    // Create an onclick event to open an infowindow at each marker.
    marker.addListener("click", function() {
      showInfoWindow(this);
    });
  }

  // Extend the boundaries of the map for each marker.
  map.fitBounds(bounds);

  self.locations = ko.observableArray(locations);
  self.topPicks = ko.observableArray();

  self.search = function(data, event) {
    var input = document.getElementById("myInput");
    var filter = input.value.toUpperCase();
    var div = document.getElementById("myLocations");
    var a = div.getElementsByTagName("a");

    // Loop through all list items, and hide those who don't match the search query.
    for (var i = 0; i < a.length; i++) {
      if (a[i].innerHTML.toUpperCase().indexOf(filter) > -1) {
        a[i].style.display = "";
        showMarker(locations[i].marker);
      } else {
        a[i].style.display = "none";
        hideMarker(locations[i].marker);
      }
    }
  }
 
  // Reset the user interface.
  self.reset = function() {
    // Reset bounds.
    bounds = new google.maps.LatLngBounds();

    // Show all locations from the list.
    var div = document.getElementById("myLocations");
    var a = div.getElementsByTagName("a");
    for (var i = 0; i < a.length; i++) {
      a[i].style.display = "";
      $(a[i]).removeClass('active');
      showMarker(locations[i].marker);
      bounds.extend(locations[i].marker.position);
    }

    // Extend the boundaries of the map for each marker.
    map.fitBounds(bounds);

    // Reset input field.
    var input = document.getElementById("myInput");
    input.value = "";
    
    // Close infowindow.
    if (infowindow) {
      infowindow.close();
    }

    // Remove all foursquare top picks.
    self.topPicks.removeAll();
  }

  // Show info window
  self.showLocationInfo = function(index) {
    var div = document.getElementById("myLocations");
    var a = div.getElementsByTagName("a");
    for (var i = 0; i < a.length; i++) {
      if (i == this.marker.id) {
        $(a[this.marker.id]).addClass('active');
      } else {
        a[i].style.display = "none";
        $(a[i]).removeClass('active');
      }
    }
    
    showInfoWindow(this.marker);
    
    var foursquareUrl = "https://api.foursquare.com/v2/venues/";
    var foursquareParams = $.param({
        "client_id": "LOW1I1K4BFN15QLOYPA5QXG24ZYRG0AIF5XYDX1PG3P3A5QJ",
        "client_secret": "TFBK2JIU1YMZDMEJ2OL3F41P1Q0QSI051XWXBHTLO5JMSUX2",
        "v": "20161016"
    });
    
    self.topPicks.removeAll();
     
    var query = "search?ll=" + this.position.lat + "," + this.position.lng 
                + "&locale=en&limit=5&section=topPicks&venuePhotos=1";
    var url = foursquareUrl + query + "&" + foursquareParams;
    $.getJSON(url, function(result, status) {
      $.each(result.response.venues, function(i, venue) {
        console.log(venue);
        self.topPicks.push(venue);
      });
    });
  }

  self.showTopPickInfo = function() {
    var div = document.getElementById("myTopPicks");
    var a = div.getElementsByTagName("a");
    for (var i = 0; i < a.length; i++) {
      if (i == this.marker.id) {
        $(a[this.marker.id]).addClass('active');
      } else {
        a[i].style.display = "none";
        $(a[i]).removeClass('active');
      }
    }
  }
}















// Error handling if map doesn't load.
var errorHandler = function() {
  $('#myMap').html('We had trouble loading Google Maps. Please refresh your browser and try again.');
}

var startApp = function() {
  ko.applyBindings(new ViewModel());
}

function gm_authFailure() { 
  $("#myMap").html("<div class=\"alert alert-danger\" role=\"alert\">"
    + "We had trouble loading Google Maps. Please refresh your browser and try again."
    + "</div>");
}

var clearMarkers = function() {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
  markers = [];
}





// Hide marker from the map.
var hideMarker = function(marker) {
  if (marker) {
    marker.setMap(null);
  }
};



// See https://developers.google.com/maps/documentation/javascript/examples/marker-animations-iteration
function addFoursquareMarkerWithTimeout(position, timeout) {
  window.setTimeout(function() {
    var marker = new google.maps.Marker({
      map: map,
      position: position,
      animation: google.maps.Animation.DROP
    });
    markers.push(marker);
    bounds.extend(position);
    map.fitBounds(bounds);    
  }, timeout);
}


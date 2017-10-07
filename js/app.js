/*
locations ou self.locations
*/

var ViewModel = function() {
  var self = this;

  // Create map.
  var map = new google.maps.Map(document.getElementById("myMap"), {
    zoom: 10,
    center: new google.maps.LatLng(0, 0),
    mapTypeId: google.maps.MapTypeId.ROADMAP,
  });

  // Instantiate some objects.
  var infowindow = new google.maps.InfoWindow();
  var bounds = new google.maps.LatLngBounds();

  // Create marker for each location.
  for (var i = 0; i < locations.length; i++) {
    // Add "visible" and "active" properties to location.
    locations[i].visible = ko.observable(true);
    locations[i].active = ko.observable(false);

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
  }

  // Extend the boundaries of the map for each marker.
  map.fitBounds(bounds);

  // Add click listener to the marker.
  locations.forEach(function(location) {
    location.marker.addListener("click", function() {
      self.showInfoWindow(location.marker);
    });
  });

  self.locations = ko.observableArray(locations);
  self.topPicks = ko.observableArray();

  // Show marker on google map.
  self.showMarker = function(marker) {
    if (marker) {
      marker.setMap(map);
    }
  };

  // Show marker on google map.
  self.hideMarker = function(marker) {
    if (marker) {
      marker.setMap(null);
    }
  };

  // Remove all Foursquare top picks.
  self.removeTopPicks = function() {
    ko.utils.arrayForEach(self.topPicks(), function(venue) {
      self.hideMarker(venue.marker);
    });
    self.topPicks.removeAll();
  }

  self.search = function(data, event) {
    var input = document.getElementById("myInput");
    var filter = input.value.toUpperCase();
    var div = document.getElementById("myLocations");
    var a = div.getElementsByTagName("a");

    // Loop through all list items, and hide those who don't match the search query.
    for (var i = 0; i < a.length; i++) {
      if (a[i].innerHTML.toUpperCase().indexOf(filter) > -1) {
        locations[i].visible(true);
        self.showMarker(locations[i].marker);
      } else {
        locations[i].visible(false);
        self.hideMarker(locations[i].marker);
      }
    }
  };
 
  // Reset the user interface.
  self.reset = function() {
    // Reset bounds.
    bounds = new google.maps.LatLngBounds();

    // Show all locations from the list.
    var div = document.getElementById("myLocations");
    var a = div.getElementsByTagName("a");
    for (var i = 0; i < a.length; i++) {
      locations[i].visible(true);
      locations[i].active(false);
      self.showMarker(locations[i].marker);
      bounds.extend(locations[i].marker.position);
    }

    // Extend the boundaries of the map for each marker.
    map.fitBounds(bounds);

    // Remove all Foursquare top picks.
    self.removeTopPicks();

    // Reset input field.
    var input = document.getElementById("myInput");
    input.value = "";
    
    // Close infowindow.
    if (infowindow) {
      infowindow.close();
      infowindow.marker = null;
    }
  };

  // Show infowindow.
  // Check to make sure the infowindow is not already opened on this marker.
  self.showInfoWindow = function(marker) {
    if (infowindow.marker != marker) {
      if (infowindow.marker) {
        infowindow.marker.setAnimation(null);
      }
      infowindow.marker = marker;
      if (marker.id > 0) {
        infowindow.setContent("<b>" + marker.title + "</b><br>" + 
          locations[marker.id].fact + 
          " <a href=\"" + locations[marker.id].source_url + "\" target=\"_blank\">" + 
          locations[marker.id].source_name + "</a>.");
      } else {
        infowindow.setContent("<b>" + marker.title + "</b>");
      }
      infowindow.open(map, marker);
      marker.setAnimation(google.maps.Animation.BOUNCE);

      // Make sure the marker property is cleared if the infowindow is closed.
      infowindow.addListener("closeclick", function() {
        infowindow.marker = null;
        marker.setAnimation(null);
      });
    } 
  };

  // Show location info window.
  self.showLocationInfo = function(item, event) {
    // Get current item index.
    var context = ko.contextFor(event.target);
    var index = context.$index();

    // Show or hide list item.
    var div = document.getElementById("myLocations");
    var a = div.getElementsByTagName("a");
    for (var i = 0; i < a.length; i++) {
      if (i == index) {
        locations[i].active(true);
        self.showMarker(locations[i].marker);
      } else {
        locations[i].visible(false);
        locations[i].active(false);
        self.hideMarker(locations[i].marker);
      }
    }
    
    // Show infowindow.
    self.showInfoWindow(item.marker);

    // Zoom, set marker as center.
    map.setCenter(item.marker.position);
    map.setZoom(24);

    // Reset bounds.
    bounds = new google.maps.LatLngBounds();
    bounds.extend(item.marker.position);

    // Remove all Foursquare top picks.
    self.removeTopPicks();

    // Get 5 top picks from Foursquare.
    var foursquareUrl = "https://api.foursquare.com/v2/venues/";
    var foursquareParams = $.param({
        "client_id": "LOW1I1K4BFN15QLOYPA5QXG24ZYRG0AIF5XYDX1PG3P3A5QJ",
        "client_secret": "TFBK2JIU1YMZDMEJ2OL3F41P1Q0QSI051XWXBHTLO5JMSUX2",
        "v": "20161016"
    });
    var query = "search?ll=" + this.position.lat + "," + this.position.lng + 
      "&locale=en&limit=5&section=topPicks&venuePhotos=1";
    var url = foursquareUrl + query + "&" + foursquareParams;

    $.getJSON(url, function(result, status) {
      $.each(result.response.venues, function(i, venue) {
        // Add "active" property.
        venue.active = ko.observable(false);

        // Get position.
        var position = new google.maps.LatLng(venue.location.lat, venue.location.lng);

        // Create a marker for this location.
        var marker = new google.maps.Marker({
          map: map,
          position: position,
          title: venue.name,
          animation: google.maps.Animation.DROP,
          icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
          id: -1
        });

        // Extends this bounds to contain the given point.
        bounds.extend(marker.position);

        // Extend the boundaries of the map for each marker.
        map.fitBounds(bounds);

        // Keep marker object into venue.
        venue.marker = marker;

        // Add click listener to the marker.
        venue.marker.addListener("click", function() {
          self.showInfoWindow(venue.marker);
        });

        // Populate topPicks array.
        self.topPicks.push(venue);
      });
    });
  };

  // Show foursquare top pick info window.
  self.showTopPickInfo = function(item, event) {
    // Get current item index.
    var context = ko.contextFor(event.target);
    var index = context.$index();

    // Activate or not list item.
    var div = document.getElementById("myTopPicks");
    var a = div.getElementsByTagName("a");
    for (var i = 0; i < a.length; i++) {
      if (i == index) {
        self.topPicks()[i].active(true);
      } else {
        self.topPicks()[i].active(false);
      }
    }

    // Show infowindow.
    self.showInfoWindow(item.marker);
  };
};

// Listen for authentication errors.
var gm_authFailure = function() { 
  $("#myMap").html("<div class=\"alert alert-danger\" role=\"alert\">" + 
      "We had trouble loading Google Maps. Please refresh your browser and try again." + 
      "</div>");
};

var startApp = function() {
  ko.applyBindings(new ViewModel());
};

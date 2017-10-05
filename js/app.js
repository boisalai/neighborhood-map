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
    //marker.addListener("click", function() {
    //  self.showInfoWindow(this);
    //});
  }

  locations.forEach(function(location) {
    location.marker.addListener("click", function() {
      self.showInfoWindow(location.marker);
    });
  });

  // Extend the boundaries of the map for each marker.
  map.fitBounds(bounds);

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

  self.search = function(data, event) {
    var input = document.getElementById("myInput");
    var filter = input.value.toUpperCase();
    var div = document.getElementById("myLocations");
    var a = div.getElementsByTagName("a");

    // Loop through all list items, and hide those who don't match the search query.
    for (var i = 0; i < a.length; i++) {
      if (a[i].innerHTML.toUpperCase().indexOf(filter) > -1) {
        a[i].style.display = "";
        self.showMarker(locations[i].marker);
      } else {
        a[i].style.display = "none";
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
      a[i].style.display = "";
      $(a[i]).removeClass("active");
      self.showMarker(locations[i].marker);
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
      infowindow.marker = null;
    }

    // Remove all foursquare top picks.
    self.topPicks.removeAll();
  };

  // Show infowindow.
  // Check to make sure the infowindow is not already opened on this marker.
  self.showInfoWindow = function(marker) {
    if (infowindow.marker != marker) {
      if (infowindow.marker) {
        infowindow.marker.setAnimation(null);
      }
      infowindow.marker = marker;
      infowindow.setContent("<b>" + marker.title + "</b><br>" + 
        locations[marker.id].fact + 
        " <a href=\"" + locations[marker.id].source_url + "\" target=\"_blank\">" + 
        locations[marker.id].source_name + "</a>.");
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
        $(a[i]).addClass("active");
        self.showMarker(locations[i].marker);
      } else {
        a[i].style.display = "none";
        $(a[i]).removeClass("active");
        self.hideMarker(locations[i].marker);
      }
    }
    
    // Zoom, set marker as center, and show infowindow.
    map.setCenter(item.marker.getPosition());
    map.setZoom(16);
    self.showInfoWindow(item.marker);
    
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

    self.topPicks.removeAll();
    $.getJSON(url, function(result, status) {
      $.each(result.response.venues, function(i, venue) {
        self.topPicks.push(venue);
      });
    });
  };

  // Show foursquare top pick info window.
  self.showTopPick = function(item, event) {
    // Get current item index.
    var context = ko.contextFor(event.target);
    var index = context.$index();

    var div = document.getElementById("myTopPicks");
    var a = div.getElementsByTagName("a");
    for (var i = 0; i < a.length; i++) {
      if (i == index) {
        $(a[i]).addClass('active');
      } else {
        $(a[i]).removeClass('active');
      }
    }

    var position = new google.maps.LatLng(item.location.lat, item.location.lng);

    // Create a marker for this location.
    var marker = new google.maps.Marker({
      map: map,
      position: position,
      title: item.name,
      animation: google.maps.Animation.DROP,
      icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
    });

    var infowindow = new google.maps.InfoWindow({
      marker: marker,
      content: item.name
    });
    infowindow.open(map, marker);

    item.marker = marker;
    item.infowindow = infowindow;
  };

  // Clear foursquare top pick info window.
  self.clearTopPick = function(item, event) {
    // Get current item index.
    var context = ko.contextFor(event.target);
    var index = context.$index();

    var div = document.getElementById("myTopPicks");
    var a = div.getElementsByTagName("a");
    $(a[i]).removeClass("active");

    item.infowindow.marker = null;
    item.infowindow = null;
    item.marker.setMap(null);
    item.marker = null;
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

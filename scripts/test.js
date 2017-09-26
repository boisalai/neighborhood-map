
	"use strict";

  var map;

  // Create a new blank array for all the listing markers.
  var markers = [];

  var largeInfowindow = null;

  // These are the real estate listings that will be shown to the user.
  // Normally we'd have these in a database instead.
  var locations = [
    {title: "Central Zoo Park", 
     location: {lat: 40.768236, lng: -73.971566},
     fact: "The Central Park Zoo is a small 6.5-acre zoo located in Central Park"
            + " in New York City. It is part of an integrated system of four zoos"
            + " and the New York Aquarium managed by the Wildlife Conservation..."
            + " <a href='https://en.wikipedia.org/wiki/Central_Park_Zoo' target='_blank'>Wikipedia</a>"
    },
    {title: "Chelsea Loft", 
     location: {lat: 40.7444883, lng: -73.9949465},
     fact: "Abcdefg"
    },
    {title: "Union Square Open Floor Plan", 
     location: {lat: 40.7347062, lng: -73.9895759},
     fact: "Abcdefg"
    },
    {title: "East Village Hip Studio", 
     location: {lat: 40.7281777, lng: -73.984377},
     fact: "Abcdefg"
    },
    {title: "TriBeCa Artsy Bachelor Pad", 
     location: {lat: 40.7195264, lng: -74.0089934},
     fact: "Abcdefg"
    },
    {title: "Chinatown Homey Space", 
     location: {lat: 40.7180628, lng: -73.9961237},
     fact: "Abcdefg"
    }
  ];

  function initMap() {
    // Constructor creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById("myMap"), {
      center: {lat: 40.7413549, lng: -73.9980244},
      zoom: 13
    });

    largeInfowindow = new google.maps.InfoWindow();
    var bounds = new google.maps.LatLngBounds();

    // The following group uses the location array to create an array of markers on initialize.
    for (var i = 0; i < locations.length; i++) {
      // Get the position from the location array.
      var title = locations[i].title;
      var position = locations[i].location;

      // Create a marker per location, and put into markers array.
      var marker = new google.maps.Marker({
        map: map,
        position: position,
        title: title,
        animation: google.maps.Animation.DROP,
        id: i
      });

      // Push the marker to our array of markers.
      markers.push(marker);
      bounds.extend(markers[i].position);
      locations[i].marker = marker;

      // Create an onclick event to open an infowindow at each marker.
      marker.addListener("click", function() {
        populateInfoWindow(this, largeInfowindow);
      });
    }
    
    // Extend the boundaries of the map for each marker
    map.fitBounds(bounds);
  }

  // This function populates the infowindow when the marker is clicked. We'll only allow
  // one infowindow which will open at the marker that is clicked, and populate based
  // on that markers position.
  function populateInfoWindow(marker, infowindow) {
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
      infowindow.marker = marker;
      infowindow.setContent("<b>" + marker.title + "</b><br>" + locations[marker.id].fact);
      infowindow.open(map, marker);
      // Make sure the marker property is cleared if the infowindow is closed.
      infowindow.addListener("closeclick", function() {
        infowindow.setMarker = null;
      });
    }
  }

  // Overall viewmodel for this screen, along with initial state
  function NeighborhoodViewModel() {
    var self = this;

    self.locations = ko.observableArray(locations);

    self.search = function(data, event) {
      var input = document.getElementById("myInput");
      var filter = input.value.toUpperCase();
      var ul = document.getElementById("myList");
      var li = ul.getElementsByTagName("li");

      var bounds = new google.maps.LatLngBounds();
  
      // Loop through all list items, and hide those who don't match the search query
      for (var i = 0; i < li.length; i++) {
        var a = li[i].getElementsByTagName("a")[0];
        if (a.innerHTML.toUpperCase().indexOf(filter) > -1) {
          li[i].style.display = "";
          // Create an onclick event to open an infowindow at each marker.
          locations[i].marker.addListener("click", function() {
            populateInfoWindow(locations[i].marker, largeInfowindow);
          });
        } else {
          li[i].style.display = "none";
          markers[i].setMap(null);
        }
      }
    }

    self.showMark = function() {
      var infowindow = largeInfowindow;
      infowindow.marker = this.marker;
      infowindow.setContent("<b>" + this.title + "</b><br>" + this.fact);
      infowindow.open(map, this.marker);
      // Make sure the marker property is cleared if the infowindow is closed.
      infowindow.addListener("closeclick", function() {
        infowindow.setMarker = null;
      });
    }    
  }

  ko.applyBindings(new NeighborhoodViewModel());

  


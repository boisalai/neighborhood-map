
	"use strict";

  var map;
  var infowindow;
  var bounds;

  // Create a new blank array for all the listing markers.
  var markers = [];

  // These are the real estate listings that will be shown to the user.
  // Normally we'd have these in a database instead.
  var locations = [
    {title: "Central Zoo Park", 
     location: {lat: 40.768236, lng: -73.971566},
     fact: "The Central Park Zoo is a small 6.5-acre zoo located in Central Park"
            + " in New York City. It is part of an integrated system of four zoos"
            + " and the New York Aquarium managed by the Wildlife Conservation...",
     source_url: "https://en.wikipedia.org/wiki/Central_Park_Zoo",
     source_name: "Wikipedia"
    },
    {title: "Empire State Building", 
     location: {lat: 40.748504, lng: -73.985599},
     fact: "The Empire State Building is a 102-story skyscraper located on Fifth Avenue"
            + " between West 33rd and 34th Streets in Midtown, Manhattan, New York City.",
     source_url: "https://en.wikipedia.org/wiki/Empire_State_Building",
     source_name: "Wikipedia"
    },
    {title: "Madison Square Garden", 
     location: {lat: 40.750585, lng: -73.993238},
     fact: 'Madison Square Garden, often called "MSG" or simply "The Garden", is a multi-purpose'
            + ' indoor arena in the New York City borough of Manhattan.',
     source_url: "https://en.wikipedia.org/wiki/Madison_Square_Garden",
     source_name: "Wikipedia"
    },
    {title: "Times Square", 
     location: {lat: 40.758879, lng: -73.985271},
     fact: 'Times Square is a major commercial intersection, tourist destination, entertainment'
            + ' center and neighborhood in the Midtown Manhattan section of New York City at'
            + ' the junction of Broadway and Seventh Avenue.',
     source_url: "https://en.wikipedia.org/wiki/Times_Square",
     source_name: "Wikipedia"
    },
    {title: "Rockefeller Center", 
     location: {lat: 40.758740, lng: -73.978684},
     fact: 'Rockefeller Center is a large complex consisting of 19 high-rise commercial buildings'
            + ' covering 22 acres between 48th and 51st Streets in New York City.',
     source_url: "https://en.wikipedia.org/wiki/Rockefeller_Center",
     source_name: "Wikipedia"
    },
    {title: "9/11 Memorial", 
     location: {lat: 40.711467, lng: -74.012740},
     fact: 'The National September 11 Memorial & Museum are a memorial and museum in New York City'
            + ' commemorating the September 11, 2001 attacks, which killed 2,977 victims, and the'
            + ' World Trade Center bombing of 1993, which killed six.',
     source_url: "https://en.wikipedia.org/wiki/National_September_11_Memorial_%26_Museum",
     source_name: "Wikipedia"
    }
  ];

  function initMap() {
    // Constructor creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById("myMap"), {
      center: {lat: 40.7413549, lng: -73.9980244},
      zoom: 13
    });

    infowindow = new google.maps.InfoWindow();

    bounds = new google.maps.LatLngBounds();

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
        populateInfoWindow(this, infowindow);
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
      infowindow.setContent("<b>" + marker.title + "</b><br>" + locations[marker.id].fact 
        + '<a href="' + locations[marker.id].source_url + '" target="_blank">' + locations[marker.id].source_name + '</a>');
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
  
      // Loop through all list items, and hide those who don't match the search query
      for (var i = 0; i < li.length; i++) {
        var a = li[i].getElementsByTagName("a")[0];
        if (a.innerHTML.toUpperCase().indexOf(filter) > -1) {
          li[i].style.display = "";
          markers[i].setMap(map);
          bounds.extend(markers[i].position);
        } else {
          li[i].style.display = "none";
          markers[i].setMap(null);
        }
      }
    }

    self.showMark = function() {
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

  


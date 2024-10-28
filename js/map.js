
			// Map Markers
			var mapMarkers = [{
				address: "3350 Scott Blvd Bldg#6601 Santa Clara, CA 95054 USA",
				html: "<strong>3350 Scott Blvd Bldg#6601 Santa Clara</strong><br> CA 95054 USA",
				icon: {
					image: "images/pin.png",
					iconsize: [26, 46],
					iconanchor: [12, 46]
				},
				popup: true
			}];

			// Map Initial Location
			var initLatitude = 37.380207027712906;
			var initLongitude = -121.98620335916436;

			// Map Extended Settings
			var mapSettings = {
				controls: {
					panControl: true,
					zoomControl: true,
					mapTypeControl: true,
					scaleControl: true,
					streetViewControl: true,
					overviewMapControl: true
				},
				scrollwheel: false,
				markers: mapMarkers,
				latitude: initLatitude,
				longitude: initLongitude,
				zoom: 15
			};

			var map = $("#googlemaps").gMap(mapSettings);

			// Map Center At
			var mapCenterAt = function(options, e) {
				e.preventDefault();
				$("#googlemaps").gMap("centerAt", options);
			}

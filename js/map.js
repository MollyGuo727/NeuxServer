
			// Map Markers
			var mapMarkers = [{
				address: "14616 NW Rich Ct, Portland, Oregon 97229",
				html: "<strong>14616 NW Rich Ct, Portland, Oregon 97229",
				icon: {
					image: "images/pin.png",
					iconsize: [26, 46],
					iconanchor: [12, 46]
				},
				popup: true
			}];

			// Map Initial Location
			var initLatitude = 45.56756224862487;
			var initLongitude = -122.82818793009777;

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
				zoom: 15,
				gestureHandling: 'cooperative'
			};

			var map = $("#googlemaps").gMap(mapSettings);

			// Map Center At
			var mapCenterAt = function(options, e) {
				e.preventDefault();
				$("#googlemaps").gMap("centerAt", options);
			}

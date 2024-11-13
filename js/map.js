
			// Map Markers
			var mapMarkers = [{
				address: "Unit 02, 9/F., The Broadway, No. 54-62 Lockhart Road, Wanchai, Hong Kong",
				html: "<strong>Unit 02, 9/F., The Broadway, No. 54-62 Lockhart Road, Wanchai, Hong Kong",
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
				zoom: 15,
				gestureHandling: 'cooperative'
			};

			var map = $("#googlemaps").gMap(mapSettings);

			// Map Center At
			var mapCenterAt = function(options, e) {
				e.preventDefault();
				$("#googlemaps").gMap("centerAt", options);
			}

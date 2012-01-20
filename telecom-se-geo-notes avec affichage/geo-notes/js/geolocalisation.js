//Source : http://www.html5-css3.fr/html5/tutoriel-geolocalisation-html5

var getGeolocalisation = {
	
	//Par défaut, les coordonnées sont celles du point Némo (pôle d'inaccessibilité maritime)
	latitude: -48.833333,
	longitude: -123.333333,
	
	//Acquisition des coordonnées GPS (polling récurrent)
	init: function(position){
		getGeolocalisation.latitude = position.coords.latitude;
		getGeolocalisation.longitude = position.coords.longitude;
		jQuery.event.trigger('coordUpdated');
		console.log('getGeolocalisation : init');
	},
	
	//Gestion des erreurs
	error: function(){
		switch(error.code){
				case error.PERMISSION_DENIED:
					alert("L'utilisateur n'a pas autorisé l'accès à sa position");
					break;
				case error.POSITION_UNAVAILABLE:
					alert("L'emplacement de l'utilisateur n'a pas pu être déterminé");
					break;
				case error.TIMEOUT:
					alert("Le service n'a pas répondu à temps");
					break;
				};
	},

	watchId: function(){		
		navigator.geolocation.watchPosition(getGeolocalisation.init, getGeolocalisation.error, {enableHighAccuracy:true});
	},
	
	//Fin de l'acquisition des coordonnées GPS (fin du polling)
	stop: function(){
		navigator.geolocation.clearWatch(watchId);
	}

};
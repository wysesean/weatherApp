//Loader gif provided by tobiasahlin.com/spinkit
//Images provided by Flickr
//Location services provided by google maps api


//Taking keys from a hidden confid file
var darkSkyKey = config.DARK_SKY_KEY,
	flickrKey = config.FLICKR_KEY

//displays the current location in html given an input
function setCityHTML(input){
	var cityNameNode = document.querySelector('#cityName')
	cityName.innerHTML = '<h1 id="cityText">'+toTitleCase(input)+'</h1>'
}

//Displays a citys name given longitude and latitude
function setCityName(lat,long){
	var url = 'http://maps.googleapis.com/maps/api/geocode/json?latlng='+lat+','+long+'&language=en',
		promiseLocation = $.getJSON(url)
	promiseLocation.then(getCityName)

	function formatCityName(str){
		var strArr = str.split(',')
		return strArr[0]
	}
	//Runs through the api response to retrieve either the locality's name or the administrative_area_level_1 name which is sometimes thes state
	function getCityName(apiResponse){
		for(var i = 0; i<apiResponse.results.length; i++){
			if(apiResponse.results[i].types[0] === 'locality'){
				setCityHTML(formatCityName(apiResponse.results[i]['formatted_address']))
				makeBgPromises(formatCityName(apiResponse.results[i]['formatted_address']))
				return
			}
			else if(apiResponse.results[i].types[0] === 'administrative_area_level_1'){
				setCityHTML(formatCityName(apiResponse.results[i]['formatted_address']))
				makeBgPromises(formatCityName(apiResponse.results[i]['formatted_address']))
				return
			}
		}
		for(var i = 0; i<apiResponse.results.length; i++){
			for(var j=0; j<apiResponse.results[i]['address_components'].length; j++){
				if(apiResponse.results[i]['address_components'][j].types[0] === 'administrative_area_level_1'){
					setCityHTML(formatCityName(apiResponse.results[i]['address_components'][j]['long_name']))
					makeBgPromises(formatCityName(apiResponse.results[i]['address_components'][j]['long_name']))
					return
				}
			}
		}
	}
}

//converts seconds to time format
function secondsToTime(num){
	var date = new Date()
	date.setSeconds(num)
	return date.toString()
}

//used to convert input to upper case
function toTitleCase(str){
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

//A really messy way to tranlate the api.icon return into my own icons
function translateIcon(iconStr){
	var key1 =[
	'clear-day',
	'clear-night',
	'rain',
	'snow',
	'sleet',
	'wind',
	'fog',
	'cloudy',
	'partly-cloudy-day',
	'partly-cloudy-night',
	'hail',
	'thunderstorm',
	'tornado']

	var key2 =[
	'wi wi-day-sunny',
	'wi wi-night-clear',
	'wi wi-rain',
	'wi wi-snow',
	'wi wi-sleet',
	'wi wi-strong-wind',
	'wi wi-fog',
	'wi wi-cloudy',
	'wi wi-day-cloudy',
	'wi wi-night-cloudy',
	'wi wi-hail',
	'wi wi-thunderstorm',
	'wi wi-tornado']
	return key2[key1.indexOf(iconStr)]
}

//////////MAKE PROMISES and SET////////
	//-Creates the promises for location that is passed in
function makeCurrentPromise(lat, long){
	var url = 'https://api.darksky.net/forecast/'+darkSkyKey+'/'+ lat + ','+ long+'?exclude=[minutely,hourly,daily,alerts,flags]&callback=?'
	var promiseCurrent = $.getJSON(url)
	promiseCurrent.then(setCurrentTemp)

	//displays the current temperature in the container
	function setCurrentTemp(apiResponse){
		hideLoader()
		var currentHTML = '',
			weatherNode = document.querySelector('#weatherContainer')

			currentHTML += 	'<div id="currentTempContainer">'
			currentHTML +=		'<h1 id="currentTemp">' + Math.round(apiResponse.currently.temperature) + '&#8457	</h1>'
			currentHTML +=		'<hr>'
			currentHTML += 		'<p id="currentSummary"><i class="'+translateIcon(apiResponse.currently.icon)+'"></i>   ' + apiResponse.currently.summary + '</p>'
			currentHTML +=		'<p id="currentChance"><i class="wi wi-umbrella"></i>   '+apiResponse.currently.precipProbability+'% Chance of Rain.</p>'
			currentHTML += 		'<p id="currentHumidity"><i class="wi wi-humidity"></i>   '+apiResponse.currently.humidity+'% Humidity</p>'
			currentHTML +=		'<p id="currentWindSpeed"><i class="wi wi-strong-wind"></i>   '+apiResponse.currently.windSpeed+' mp/h Wind Speed</p>'
			currentHTML +=		'<hr>'
			currentHTML +=	'</div>'

		weatherNode.innerHTML = currentHTML
	}
}

function makeHourlyPromise(lat, long){
	var url = 'https://api.darksky.net/forecast/'+darkSkyKey+'/'+ lat + ','+ long+'?exclude=[currently,minutely,daily,alerts,flags]&callback=?'
	var promiseHourly = $.getJSON(url)
	promiseHourly.then(setHourlyTemp)

	//displays the hourly temperature in a container
	function setHourlyTemp(apiResponse){
		hideLoader()
		var hourlyHTML = '',
			weatherNode = document.querySelector('#weatherContainer')
		console.log(url)
		function formatTime(str){
			var strArr = str.split(' ')
			return strArr[4]
		}

		hourlyHTML += '<div id="hourlyContainer">'
		console.log(apiResponse.hourly.data.length)
			for(var i=0; i<12; i++){
				hourlyHTML += '<div class="hourlyElement">'
				hourlyHTML += 	'<p id="hourlyTime">'+formatTime(secondsToTime(apiResponse.hourly.data[i]['time']))+'  -  '
				hourlyHTML += 	Math.round(apiResponse.hourly.data[i]['temperature'])+'&#8457\t<i class="'+translateIcon(apiResponse.hourly.data[i]['icon'])+'"></i></p>'
				hourlyHTML += 	'<hr>'
				hourlyHTML += '</div>'
			}
		hourlyHTML += '</div>'

		weatherNode.innerHTML = hourlyHTML
	}
}

function makeDailyPromise(lat, long){
	var url = 'https://api.darksky.net/forecast/'+darkSkyKey+'/'+ lat + ','+ long+'?exclude=[currently,minutely,hourly,alerts,flags]&callback=?'
	var promiseDaily = $.getJSON(url)
	promiseDaily.then(setDailyTemp)

	function formatDate(str){
		var strArr = str.split(' ')
		return strArr[0]
	}
	//displays the weekly temperature in a container
	function setDailyTemp(apiResponse){
		hideLoader()
		var dailyHTML = '',
			weatherNode = document.querySelector('#weatherContainer')

			for(var i=0; i<7; i++){
				dailyHTML +=	'<div class="dailyElement">'
				dailyHTML +=		'<p id="dailyDay">' + formatDate(secondsToTime(apiResponse.daily.data[i]['time'])) 
				dailyHTML +=		'<i class="'+translateIcon(apiResponse.daily.data[i]['icon'])+'"></i>   '
				dailyHTML +=		Math.round(apiResponse.daily.data[i]['temperatureMax']) + '&#8457 / '
				dailyHTML +=		Math.round(apiResponse.daily.data[i]['temperatureMin']) + '&#8457'
				dailyHTML +=		'<p id="dailySummary">' + apiResponse.daily.data[i]['summary'] + '</p>'
				dailyHTML +=	'</div>'
				dailyHTML +=	'<hr>'

			}
		weatherNode.innerHTML = dailyHTML
	}
}

//Creates a promise to the google maps api and will run a function that changes the hash
//Also runs the first bg image fetch
function makeLocationPromise(place){
	var inputNode = document.querySelector('#inputText')
	inputNode.value= ''
	var url = "http://maps.googleapis.com/maps/api/geocode/json?address="+place
	var promiseLocation = $.getJSON(url)
	promiseLocation.then(setCityHTMLHash).then(makeBgPromises(place))

	console.log(url)
	//Sets the hash to given location in the api response
	function setCityHTMLHash(apiResponse){
		hideLoader()
		var weatherNode = document.querySelector('#weatherContainer')
		if(apiResponse.status === 'ZERO_RESULTS'){
			location.hash = "errorPage"
			return
		}
		var hashArr = location.hash.split('/')
		hashArr[0] = apiResponse.results[0].geometry.location['lat']
		hashArr[1] = apiResponse.results[0].geometry.location['lng']
		location.hash = hashArr.join('/')
	}
}

//Requests and sets a picture to the background from the flickr API which should resemble the location taken as input
function makeBgPromises(place){
	var url = "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key="+flickrKey+"&text="+place+"&sort=relevance&media=photos&extras=url_l&per_page=1&page=1&format=json&nojsoncallback=1"
	var promiseBG = $.getJSON(url)
	promiseBG.then(setBGLocation)

	function setBGLocation(apiResponse){
		console.log(apiResponse)
		var flickrImg = apiResponse.photos.photo[0]['url_l'],
			imgNode = document.querySelector('#imgContainer')

		imgNode.innerHTML = '<img id="backgroundImage" src='+ flickrImg+' alt="background image"/>'
	}
}

//displays the loading gif
function showLoader(){
	var loadNode = document.querySelector('.sk-cube-grid')
	loadNode.style.display = 'block'
}

//hides the loading gif
function hideLoader(){
	var loadNode = document.querySelector('.sk-cube-grid')
	loadNode.style.display = 'none'
}



//StartButtonEvents wraps all the button events in one function for easier management
//The hash will be changed to the corresponding button click
function startButtonEvents(lat,long){
	var currentButtonNode = document.querySelector('#currentLink')
		hourlyButtonNode = document.querySelector('#hourlyLink')
		dailyButtonNode = document.querySelector('#dailyLink')
	if(lat&&long){
		hashString = lat + '/' + long
	}
	else{return}
	currentButtonNode.addEventListener('click', function(){
		location.hash = hashString + '/current'
	})

	hourlyButtonNode.addEventListener('click', function(){
		location.hash = hashString + '/hourly'
	})

	dailyButtonNode.addEventListener('click', function(){
		location.hash = hashString + '/daily'
	})
}

//Sets the default hash to the current position and sets default city name
function setDefault(positionObj){
	function getLatLong(obj){
	    var latLongObj = {lat: obj.coords.latitude, long: obj.coords.longitude}
	    return latLongObj
	}
	var latLong = getLatLong(positionObj)
	location.hash=latLong['lat'] + '/'+ latLong['long'] + '/current'
	setCityName(latLong['lat'],latLong['long'])
}

//Reads the hash and is executed when the hash changes
function hashController(){
	var hashArr = location.hash.substr(1).split('/'),
		latitude = hashArr[0],
		longitude = hashArr[1],
		menuSelection = hashArr[2]
	startButtonEvents(latitude,longitude)
	showLoader()
	if(latitude&&longitude){
		setCityName(latitude,longitude)
	}
	if(hashArr[0] === 'errorPage'){
		setCityHTML("Couldn't Find Location")
		return
	}
	else if(menuSelection === 'current'){
		makeCurrentPromise(latitude,longitude)
	}
	else if(menuSelection === 'hourly'){
		makeHourlyPromise(latitude,longitude)
	}
	else if(menuSelection === 'daily'){
		makeDailyPromise(latitude,longitude)
	}
	else{
		navigator.geolocation.getCurrentPosition(setDefault)
	}
}

//Function that contains all the main functions and runs all eventListeners
function main(){
	hashController()
	window.addEventListener('hashchange', hashController)
	var inputNode = document.querySelector('#inputText')

	inputNode.addEventListener('keydown', function(e){
		if(e.keyCode==13){
			showLoader()
			makeLocationPromise(inputNode.value)
		}
	})
}
main()





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
	var url = 'https://maps.googleapis.com/maps/api/geocode/json?latlng='+lat+','+long+'&language=en',
		promiseLocation = $.getJSON(url),
		imgContainerNode = document.querySelector('#imgContainer')

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
				if(imgContainerNode.innerHTML==''){
					displayBackground(formatCityName(apiResponse.results[i]['formatted_address']))
				}
				return
			}
			else if(apiResponse.results[i].types[0] === 'administrative_area_level_1'){
				setCityHTML(formatCityName(apiResponse.results[i]['formatted_address']))
				if(imgContainerNode.innerHTML==''){
					displayBackground(formatCityName(apiResponse.results[i]['formatted_address']))
				}
				return
			}
		}
		for(var i = 0; i<apiResponse.results.length; i++){
			for(var j=0; j<apiResponse.results[i]['address_components'].length; j++){
				if(apiResponse.results[i]['address_components'][j].types[0] === 'administrative_area_level_1'){
					setCityHTML(formatCityName(apiResponse.results[i]['address_components'][j]['long_name']))
					if(imgContainerNode.innerHTML==''){
						displayBackground(formatCityName(apiResponse.results[i]['address_components'][j]['long_name']))
					}
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
function setCurrent(lat, long){
	var url = 'https://api.darksky.net/forecast/'+darkSkyKey+'/'+ lat + ','+ long+'?exclude=[minutely,hourly,daily,alerts,flags]&callback=?'
	var promiseCurrent = $.getJSON(url)
	promiseCurrent.then(setCurrentHTML)

	//displays the current temperature in the container
	function setCurrentHTML(apiResponse){
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

function setHourly(lat, long){
	var url = 'https://api.darksky.net/forecast/'+darkSkyKey+'/'+ lat + ','+ long+'?exclude=[currently,minutely,daily,alerts,flags]&callback=?'
	var promiseHourly = $.getJSON(url)
	promiseHourly.then(setHourlyHTML)

	//displays the hourly temperature in a container
	function setHourlyHTML(apiResponse){
		hideLoader()
		var hourlyHTML = '',
			weatherNode = document.querySelector('#weatherContainer')
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

function setDaily(lat, long){
	var url = 'https://api.darksky.net/forecast/'+darkSkyKey+'/'+ lat + ','+ long+'?exclude=[currently,minutely,hourly,alerts,flags]&callback=?'
	var promiseDaily = $.getJSON(url)
	promiseDaily.then(hideLoader()).then(setDailyHTML)

	function formatDate(str){
		var strArr = str.split(' ')
		return strArr[0]
	}
	//displays the weekly temperature in a container
	function setDailyHTML(apiResponse){
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
	var inputNode = document.querySelector('#inputText'),
		cityNameNode = document.querySelector('#cityName')

	var url = "https://maps.googleapis.com/maps/api/geocode/json?address="+place,
		promiseLocation = $.getJSON(url)
	inputNode.value= ''
	promiseLocation.then(setCityHTMLHash).then(displayBackground(place))

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
		setCityName(hashArr[0],hashArr[1])
	}
}

//Requests and sets a picture to the background from the flickr API which should resemble the location taken as input
function displayBackground(place){
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
	var weatherNode = document.querySelector('#weatherContainer')
	loadNode.style.display = 'block'
	weatherNode.style.opacity = '0'
}

//hides the loading gif
function hideLoader(){
	var loadNode = document.querySelector('.sk-cube-grid')
	var weatherNode = document.querySelector('#weatherContainer')
	loadNode.style.display = 'none'
	weatherNode.style.opacity = '1'
}



//StartButtonEvents wraps all the button events in one function for easier management
//The hash will be changed to the corresponding button click
function startButtonEvents(){
	var currentButtonNode = document.querySelector('#currentLink')
		hourlyButtonNode = document.querySelector('#hourlyLink')
		dailyButtonNode = document.querySelector('#dailyLink')

	var hashArr = location.hash.split('/')
	currentButtonNode.addEventListener('click', function(){
		showLoader()
		location.hash = hashArr[0]+'/'+hashArr[1]+'/current'
	})

	hourlyButtonNode.addEventListener('click', function(){
		showLoader()
		location.hash = hashArr[0]+'/'+hashArr[1]+'/hourly'
	})

	dailyButtonNode.addEventListener('click', function(){
		showLoader()
		location.hash = hashArr[0]+'/'+hashArr[1]+'/daily'
	})
}

//Sets the default hash to the current position and sets default city name
function setDefault(positionObj){
	hideLoader()
	var lat = positionObj.coords.latitude,
		long = positionObj.coords.longitude

	location.hash= lat + '/'+ long + '/current'
	setCityName(lat,long)
}

//creates a hash router that will 
var Router = Backbone.Router.extend({
	routes:{
		":latitude/:longitude/current": "displayCurrent",
		":latitude/:longitude/hourly": "displayHourly",
		":latitude/:longitude/daily": "displayDaily",
		"errorPage": "displayError",
		"": "displayDefault"
	},
	displayCurrent: function(latitude, longitude){
		setCurrent(latitude, longitude)
	},
	displayHourly: function(latitude, longitude){
		setHourly(latitude, longitude)
	},
	displayDaily: function(latitude, longitude){
		setDaily(latitude, longitude)
	},
	displayError: function(){
		document.querySelector('#weatherContainer') = ''
		setCityHTML("Couldn't Find Location!")
	},
	displayDefault: function(){
		navigator.geolocation.getCurrentPosition(setDefault)
	}
})



//Function that contains all the main functions and runs all eventListeners
function main(){
	var instance = new Router(),
		inputNode = document.querySelector('#inputText'),
		imgContainerNode = document.querySelector('#imgContainer'),
		cityNameNode = document.querySelector('#cityName')

	if(cityNameNode.innerHTML===''&&imgContainerNode.innerHTML===''){
		var hashArr = location.hash.substr(1).split('/')
		setCityName(hashArr[0],hashArr[1])
	}

	Backbone.history.start()
	startButtonEvents()
	inputNode.addEventListener('keydown', function(e){
		if(e.keyCode==13){
			showLoader()
			makeLocationPromise(inputNode.value)
		}
	})
}
main()





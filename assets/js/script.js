let search_element = $("#city-search")
let search_button = $("#search-button")
let search_history = $(".search-history")
const my_api_key = "6e52590c0eee04ee776da914508bf420"


get_current_weather_data = function(lat,lon){
    let current_weather_api_url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${my_api_key}`
    
    fetch(current_weather_api_url)
    .then(function(response){
        if(response.status == 200){
            return response.json()

            .then(function(data){
                alert(data.list[0].dt)
            })

        }else{
            alert("Error: weather" + response.status)
        }
        
    })
}



get_forcast_weather_data = function(lat, lon){

    let forcast_weather_api_url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${my_api_key}`
    
    fetch(forcast_weather_api_url)
    .then(function(response){
        if(response.status == 200){
            return response.json()

            .then(function(data){
                alert(data.list[0].dt)
            })

        }else{
            alert("Error: weather" + response.status)
        }
        
    })
}

get_city_coordinates = function(city){
    let limit = 1;
    let coordinates_api_url = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=${limit}&appid=${my_api_key}`
    // get latitude and longitude by city name
    fetch(coordinates_api_url)
    .then(function(response){
        if(response.ok){
            return response.json()
            .then(function(data){
                let lat = data[0]["lat"] //latitude
                let lon = data[0]["lon"] //longitude
                /* get_forcast_weather_data(lat,lon) */
                get_current_weather_data(lat,lon)
            })
        }
        else{
            alert('error' + response.statusText)
        }
    })
}


search_handler = function(){
    let city = search_element.val()
    
    get_city_coordinates(city)

  


    if(city){
        
        search_history.append(`<li class="list-group-item">${city}</li>`);

        // save data to local
    }
}

search_button.on("click",search_handler);
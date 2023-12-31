let search_element = $("#city-search");
let search_button = $("#search-button");
let search_history = $(".search-history");
let all_result_holder = $(".all-result");
let city_name_element = $(".city-name");
let current_icon = $(".current-icon");
let temp_element = $(".temp");
let wind_element = $(".wind");
let humidity_element = $(".humidity");
let forcast_result_holder = $(".forcast-result");

let city_info = {};
const my_api_key = "6e52590c0eee04ee776da914508bf420";
let current_date = dayjs().format("MM/DD/YYYY");

// create element holders
for (let i = 0; i < 5; i++) {
  let forcast_card_holder = $(`<div class='card-body'></div>`);
  forcast_result_holder.append(forcast_card_holder);
  let forcast_date_element = $(`<h5 class='card-date card-date-${i}'></h5>`);
  let forcast_icon_element = $(`<img class='card-icon card-icon-${i}'></img>`);
  let forcast_temp_element = $(`<p class='card-temp card-temp-${i}'></p>`);
  let forcast_wind_element = $(`<p class='card-wind card-wind-${i}'></p>`);
  let forcast_humidity_element = $(
    `<p class='card-humidity card-humidity-${i}'></p>`
  );
  forcast_card_holder.append(
    forcast_date_element,
    forcast_icon_element,
    forcast_temp_element,
    forcast_wind_element,
    forcast_humidity_element
  );
}

display_current_weather = function (
  date,
  city_name,
  icon_description,
  temp,
  wind,
  humidity
) {
  
  current_icon.attr("src", `https://openweathermap.org/img/wn/${icon_description}@2x.png`);
  city_name_element.text(city_name + "(" + date + ")");
  temp_element.text(`Temperature: ${temp} °F`);
  wind_element.text(`Wind Speed: ${wind}` + " MPH");
  humidity_element.text(`Humidity: ${humidity}%`);
};

display_forcast_weather = function (
    index,
    date,
    icon_description,
    temp,
    wind,
    humidity
  ) {
    $(`.card-date-${index}`).text(date);
    $(`.card-temp-${index}`).text(`Temp: ${temp}°F`);
    $(`.card-wind-${index}`).text(`Wind: ${wind} MPH`);
    $(`.card-humidity-${index}`).text(`Humidity: ${humidity}%`);
  
    
    $(`.card-icon-${index}`).attr("src",`https://openweathermap.org/img/wn/${icon_description}@2x.png`);
  }


get_current_weather_data = function (lat, lon, city_name) {
  let current_weather_api_url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${my_api_key}`;

  fetch(current_weather_api_url).then(function (response) {
    if (response.status == 200) {
      return response.json()

        .then(function (data) {
          let temp = data.main.temp;
          let wind = data.wind.speed;
          let humidity = data.main.humidity;
          let icon_description = data.weather[0].icon;

          //date,city_name,icon_description,temp,wind,humidity
          display_current_weather(
            current_date,
            city_name,
            icon_description,
            temp,
            wind,
            humidity
          );
            
          // add current day weather into city_info list
          city_info[`${city_name}`] = {
            current: {
              date: current_date,
              icon: icon_description,
              current_temp: temp,
              current_wind: wind,
              current_humidity: humidity,
            },
          };
        });
    } else {
      alert("Error: weather" + response.status);
    }
  });
};


get_forcast_weather_data = function (lat, lon, city_name) {
  let forcast_weather_api_url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${my_api_key}`;

  fetch(forcast_weather_api_url).then(function (response) {
    if (response.status == 200) {
      return response
        .json()

        .then(function (data) {
          let information = data.list;
          for (let i = 4; i < information.length; i += 8) {
            let date = information[i].dt_txt.split(" ")[0];
            let temp = information[i].main.temp;
            let wind = information[i].wind.speed;
            let humidity = information[i].main.humidity;
            let icon_description = information[i].weather[0].icon;

            let index = (i - 4) / 8;

            //index,date,icon_description,temp,wind,humidity
            display_forcast_weather(
              index,
              date,
              icon_description,
              temp,
              wind,
              humidity
            );
            
            // add 5-day weather forcast into city_info list
            city_info[`${city_name}`][`forcast-${index}`] = {
              date: date,
              icon: icon_description,
              forcast_temp: temp,
              forcast_wind: wind,
              forcast_humidity: humidity,
            };
          }
          // save data to localstorage
          let history = JSON.parse(localStorage.getItem("city_info"));
          //check if localstorage is empty
          if (history) {
            
            history[city_name] = city_info[city_name];

            localStorage.setItem("city_info", JSON.stringify(history));
          }else{
            localStorage.setItem("city_info", JSON.stringify(city_info));
          }
        

          
        });
    } else {
      alert("Error: weather" + response.status);
    }
  });
};

get_city_coordinates = function (city) {
  let limit = 1;
  let coordinates_api_url = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=${limit}&appid=${my_api_key}`;
  // get latitude and longitude by city name
  fetch(coordinates_api_url).then(function (response) {
    if (response.status == 200) {
      return response.json()
      
      .then(function (data) {

        // if the returned data is not empty,the length of the data should not be 0
        if(data.length!==0){
          let lat = data[0]["lat"]; //latitude
          let lon = data[0]["lon"]; //longitude
          let city_name = data[0]["name"]; // city name
          
          // check if input city is included in localstorage and create history element
          let history = JSON.parse(localStorage.getItem("city_info"));
  
          if (history) {
              let is_in_local = Object.keys(history).includes(city_name);
              if (!is_in_local) {
              search_history.append(
                  `<li class="list-group-item" data-city="${city_name}">${city_name}</li>`
              );}
          }
          else{
              search_history.append(
                  `<li class="list-group-item" data-city="${city_name}">${city_name}</li>`);
          }
  
          get_current_weather_data(lat, lon, city_name);
          get_forcast_weather_data(lat, lon, city_name);
          all_result_holder.removeClass("hidden");
        }
        else{
          alert("Your input is invalid, please try again")
        }

      });
    } else {
      alert("error " + response.status);
    }
  });
};

display_history = function () {
  let history = JSON.parse(localStorage.getItem("city_info"));

  if (history) {
    let city_history_list = Object.keys(history);
    for (let i = 0; i < city_history_list.length; i++) {
      let city_local_name = city_history_list[i];
      search_history.append(
        `<li class="list-group-item" data-city="${city_local_name}">${city_local_name}`
      );
    }
  } 
};

search_handler = function () {

  let city = search_element.val().trim();

  if (city) {
    get_city_coordinates(city);
  }
};

display_history();

search_button.on("click", search_handler);


// when click history city
search_history.on("click", "li", function (event) {

  let target = event.target;
  let city_name = target.dataset.city;
  let local_info = JSON.parse(localStorage.getItem("city_info"));
  let local_city_list = Object.keys(local_info);

  all_result_holder.removeClass("hidden");
  
  if (local_city_list.includes(city_name)) {
    let city_data = local_info[city_name];

    // render current weather page for selected city
    let current_date = city_data.current.date;
    let current_temp = city_data.current.current_temp;
    let current_humidity = city_data.current.current_humidity;
    let current_wind = city_data.current.current_wind;
    let current_icon_discription = city_data.current.icon;
    
    //date,city_name,icon_description,temp,wind,humidity
    display_current_weather(
      current_date,
      city_name,
      current_icon_discription,
      current_temp,
      current_wind,
      current_humidity
    );

    // render forcast weather page for selected city
    for (let i = 0; i < 5; i++) {
      let forcast_date = city_data[`forcast-${i}`].date;
      let forcast_temp = city_data[`forcast-${i}`].forcast_temp;
      let forcast_wind = city_data[`forcast-${i}`].forcast_wind;
      let forcast_humidity = city_data[`forcast-${i}`].forcast_humidity;
      let forcast_icon_description = city_data[`forcast-${i}`].icon;

      //index,date,icon_description,temp,wind,humidity
      display_forcast_weather(
        i,
        forcast_date,
        forcast_icon_description,
        forcast_temp,
        forcast_wind,
        forcast_humidity
      );
    }
  }
});


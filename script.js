'use strict';

// const form = document.querySelector('.form');
// const containerWorkouts = document.querySelector('.workouts');
// const inputType = document.querySelector('.form__input--type');
// const inputDistance = document.querySelector('.form__input--distance');
// const inputDuration = document.querySelector('.form__input--duration');
// const inputCadence = document.querySelector('.form__input--cadence');
// const inputElevation = document.querySelector('.form__input--elevation');


////////////////////////////////////////////////
//create workout class and Add some child for class app
class Workout {
  date = new Date();
  //unique identifier
  //-10 last 10 number
  id = (Date.now() + '').slice(-10);
  clicks = 0

  constructor(coords, distance, duration) {
    // this.date =..
    // this.id = ...
    this.coords = coords; //[lat, lng]
    this.distance = distance; //in km
    this.duration = duration; //in min
  }


  _setDescription() {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]}${this.date.getDate()}`;
  }

  click() {
    this.clicks++
  }
}

class Running extends Workout {
  type = 'running';

  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }

  calcPace() {
    //min/ km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  type = 'cycling';

  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    // this.type = "cycling"
    this.calcSpeed();
    this._setDescription();
  }

  calcSpeed() {
    //km/h
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}


// //we want to use map in the submit scope so we need global variable
// let map, mapEvent;
// //Geolocation is just another API
// //getCurrentPosition gets two callback function...first for get location successfully and second one is for error when it is not able to get location
// if (navigator.geolocation)
//   navigator.geolocation.getCurrentPosition(function(position) {
//     // const latitude = position.coords.latitude
//     //in descunstruction
//     const { latitude } = position.coords;
//     const { longitude } = position.coords;
//     console.log(`https://www.google.com/maps/search/map/@${latitude},${longitude}`);
//
//     //we have to make variable to give us coords and put them in setView instead of the coords numbers
//     const coords = [latitude, longitude];
//
//     //Leaflet.com website ...copy this part of scripts
//
//     //L is namespace for leaflet
//     //13 is the amount of zoom
//     map = L.map('map').setView(coords, 13);
//     console.log(map);
//     //the map that we see on the page is basically made up of small tiles and these tiles they come from this URL
//     // here'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
//     // which basically is from open street map. And maybe you have heard of open street map and it's basically an open
//     // source map that everyone can use for free. And so open street map is actually the one that we gonna use,/ but
//     // Leaflet works with all other kinds of maps as well, for example with Google maps if that's the one that you prefer.
//     // Now, we can also use this URL here to change the appearance of our map.
//     //I change .org >>>>> .fr/hot/ >>>> for changing the shape of the map
//     L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
//       attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//     }).addTo(map);
//
//
//     //WE ADD THIS PART for click and get the location
//     //for using click and have the coordination of location we can not use addListener like always with click
//     //so we can use leaflet library,
//     //on method here: >>>>NOT come from JS..It is instead of coming from the leaflet library.the map object is create by leaflet with spetial
//     //handling click on map
//     map.on('click', function(mapE) {
//       //because we don't need this map event
//       mapEvent = mapE;
//       //we want when we click on map show the form
//       form.classList.remove('hidden');
//       inputDistance.focus();
//     });
//
//   }, function() {
//     alert('could not get your position');
//   });
//
// //we want to submit happen when we click because we dont have submit click
// form.addEventListener('submit', function(e) {
//   //dont want default form behavior
//   e.preventDefault();
//   console.log('hello');
// //Clear input firld
//   inputDistance.value = inputCadence.value = inputDuration.value = inputElevation.value = '';
//
//   //display marker
//   console.log(mapEvent);
//   // {lat, lng} are in the map object , you can see in console and latlng is the name of object
//   const { lat, lng } = mapEvent.latlng;
//   L.marker([lat, lng]).addTo(map)
//     //bindPopup is the word you can see in the location
//     //in the Leaflet website in the documents we can see the options that we have
//     .bindPopup(L.popup({
//       maxwidth: 250,
//       minwidth: 100,
//       autoClose: false,
//       closeOnClick: false,
//       className: 'running-popup'
//     }))
//     .setPopupContent('workout')
//     .openPopup();
//
// });
//
// //changing meter for cycling and step for running
// inputType.addEventListener('change', function() {
//   //is like an inverse query selector.it selects parents and not children.
//   inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
//   inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
// });

//Application Architecture
///////////////////////////////////////////////////////////////////////////
//we want to organize coding with the class
//destructure
const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class App {
  #map;
  #mapZoomLevel = 13;
  #mapEvent;
  #workouts = [];

  //constructor function is called immediately when a new object created from this class
  constructor() {
    this._getPosition();
    //this._newWorkout>>>>>  it is an event handler function will always have the this keyword of the dumb element onto which it is attached. here is form element
    //for solving this problem we have to use bind
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElevationField);
    containerWorkouts.addEventListener("click", this._moveToPopup.bind(this));
  }

  _getPosition() {
    if (navigator.geolocation)
      //this ....because we are in the class so we need to use this
      //callback function here is this.loadMap...so it is not the method so this doesnt work for it...so we use bind(this) and this keyword point it to current object
      navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), function() {
        alert('could not get your position');
      });
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    console.log(`https://www.google.com/maps/search/map/@${latitude},${longitude}`);

    const coords = [latitude, longitude];

    //this.#map...it is property that define in the object , it is not a normal variable
    this.#map = L.map('map').setView(coords, this.#mapZoomLevel);
    console.log(this.#map);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.#map);


    this.#map.on('click', this._showForm.bind(this));

  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _hideForm() {
    //empty input
    inputDistance.value = inputCadence.value = inputDuration.value = inputElevation.value = '';

    form.style.display = "none";
    form.classList.add("hidden")
    setTimeout(() => form.style.display = "grid", 1000)
  }

  _toggleElevationField() {
    //is like an inverse query selector.it selects parents and not children.
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    const validInputs = (...inputs) => inputs.every(inp => Number.isFinite(inp));
    const allPositive = (...inputs) => inputs.every(inp => inp > 0);

    //dont want default form behavior
    e.preventDefault();

    //Get data from form
    const type = inputType.value;
    // with + convert string to number
    const duration = +inputDuration.value;
    const distance = +inputDistance.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    //If workout running, create running object
    if (type === 'running') {
      const cadence = +inputCadence.value;

      //check if data is valid
      if (
        // !Number.isFinite(distance) || !Number.isFinite(duration) || !Number.isFinite(cadence))
        !validInputs(distance, duration, cadence) || !allPositive(distance, duration, cadence))
        return alert('Inputs have to be positive numbers');

      workout = new Running([lat, lng], distance, duration, cadence);
    }

    //If workout cycling, create cycling object
    if (type === 'cycling') {
      const elevation = +inputElevation.value;

      if (!validInputs(distance, duration, elevation) || !allPositive(distance, duration))
        return alert('Inputs have to be positive numbers');

      workout = new Cycling([lat, lng], distance, duration, elevation);
    }
    //Add new object to workout array
    this.#workouts.push(workout);
    console.log(workout);

    //Render workout on map as marker
    this._renderWorkoutMarker(workout);

    //Render workout on list
    this._renderWorkout(workout);

//Hide form + Clear input firld
    this._hideForm()
  }

  _renderWorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(L.popup({
          maxwidth: 250,
          minwidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`
        })
      )
      .setPopupContent(`${workout.type === 'running' ? '🏃' : '♂'} ${workout.description}`)
      .openPopup();
  }

  _renderWorkout(workout) {
    let html = `
      <li class='workout workout--running' data-id='${workout.id}'>
      <h2 class='workout__title'>${workout.description}</h2>
      <div class='workout__details'>
        <span class='workout__icon'>${workout.type === 'running' ? '🏃' : '♂'}</span>
        <span class='workout__value'>${workout.distance}</span>
        <span class='workout__unit'>km</span>
      </div>
      <div class='workout__details'>
        <span class='workout__icon'>⏱</span>
        <span class='workout__value'>${workout.duration}</span>
        <span class='workout__unit'>min</span>
      </div>
    `;
    if (workout.type === 'running')
      html += `
 <div class='workout__details'>
        <span class='workout__icon'>⚡️</span>
        <span class='workout__value'>${workout.pace.toFixed(1)}</span>
        <span class='workout__unit'>min/km</span>
      </div>
       <div class="workout__details">
        <span class="workout__icon">🦶🏼</span>
        <span class="workout__value">${workout.cadence}</span>
        <span class="workout__unit">spm</span>
      </div>
      `

    if (workout.type === "cycling")
      html += `<div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${workout.speed.toFixed(1)}</span>
        <span class="workout__unit">km/h</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⛰</span>
        <span class="workout__value">${workout.elevationGain}</span>
        <span class="workout__unit">m</span>
      </div>`

    form.insertAdjacentHTML("afterend", html)
  }

  _moveToPopup(e) {
    const workoutEl = e.target.closest(".workout");
    console.log(workoutEl);

    if (!workoutEl) return;

    //when we click of form, it can find it on the map
    const workout = this.#workouts.find(
      work => work.id === workoutEl.dataset.id
    )
    console.log(workout);

    this.#map.setView(workout.coords, this.#mapZoomLevel, {
      animate: true,
      pan: {
        duration: 1,
      }
    })

    //using the public interface
    workout.click()
  }

}


const app = new App();
//for execute this part immediately it has to be in the constructor
// app._getPosition()





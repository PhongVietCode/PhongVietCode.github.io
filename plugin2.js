import { PLUGINS_APIKEY } from "./reusable/apikey.js";
import loadScript from "./reusable/loadScript.js";
import "./socket.io/client-dist/socket.io.js";
const API_HOST = "https://app.digitalauto.tech";

//---------------------------------------------------//
const socket = io("http://127.0.0.1:3000");
//--------------------------------------------------//
let mapContainer = document.createElement("div"); // main map
mapContainer.setAttribute("style", `position: height: 100%; width: 100%;`);
let map;
let mainMarker;
let svgMarker;
let routeResult;
let routeArray = [];
let step = 0.00001;
let running = false;
let stopping = false;
let submitted = false;
let sieuphuctap;
let currentPos = null;
let myID;
let myRoute;
let myRouteSegment;
let path;
let myRoad;
let j = 0;
let i = 0;
let heading;
let a = null,
  b = null;
let runInterval;
const mainBoard = document.createElement("div");
let blinkInterval;
let direction = 0; // -1: left,0: straing, 1: right
let carNearby = new Map();
let markerArray = [];
let speedCar = 0;
let distanceArray = [];
let changeDirection = false;
mainBoard.innerHTML = `
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
<link rel="stylesheet" type="text/css" href="http://127.0.0.1:5500/style.css">
<div class="bg">
	<div class ="container">
		<div class = "google-map"></div>
		<div class ="meter-object">
			<div class = "meter-head">
				<div class="icon-container">
					<div class="turn-left">
						<img src="http://127.0.0.1:5500/assest/turnleft.svg" id="left-arrow">
					</div>
					<div class="normal-warn">
						<img src="http://127.0.0.1:5500/assest/seatbell.svg">
						<img src="http://127.0.0.1:5500/assest/door.svg">
						<img src="http://127.0.0.1:5500/assest/headlight.svg"class="headlight">
						
					</div>
					<div class="turn-right">
						<img src="http://127.0.0.1:5500/assest/turnright.svg" id="right-arrow">
					</div>
				</div>
			</div>
			<div class="meter-body">
				<span class="speed-container" >
					<div class="speed-oval-line" >
						<div class="speed-fill" ></div>
						<div class="speed-outline"></div>
						<span class="triangle"></span>
						<div class="speed-cover">
							<span class="speed-icon" 
							style="display: flex; align-items: center;justify-content: center;margin-top: 30px;" >
								<img src="http://127.0.0.1:5500/assest/speed icon.svg">
							</span>
							<span class="speed-counter" >
								<span class="speed-number">0</span>
								<span class="speed-unit" >Km/h</span>
							</span>
							<div class="rpm-mode">
								<span class="speed-dot" id="mode-off">P</span>
								<span class="speed-dot" id="mode-off">R</span>
								<span class="speed-dot" id="mode-off">N</span>
								<span class="speed-dot" id="mode-on">D</span>
							</div>
						</div>
					</div>
				</span>
			</div>

			<div class="meter-tail">
				<div class="rpm-meter-container">
					<div class="rpm-meter-top-cover"></div>

					<div class="rpm-meter-line"></div>
					<div class="center-point"></div>
					<div class="rpm-meter-cover"></div>
					<div class="rpm-meter-scale rpm-meter-scale-1"></div>
					<div class="rpm-meter-scale rpm-meter-scale-2"></div>
					<div class="rpm-meter-scale rpm-meter-scale-3"></div>
					<div class="rpm-meter-scale rpm-meter-scale-4"></div>
					<div class="rpm-meter-scale rpm-meter-scale-5"></div>
					<div class="rpm-meter-scale rpm-meter-scale-6"></div>
					<div class="rpm-meter-scale rpm-meter-scale-7"></div>
					<div class="rpm-meter-scale rpm-meter-scale-8"></div>
					<div class="rpm-meter-bottom-cover"></div>
					<div class="arrow-container">
						<div class="arrow-wrapper">
							<div class="arrow rpm-arrow">

							</div>
							<span class="rpm-number">x100 RPM</span>
						</div>
					</div>

				</div>
				<div class="fuel-meter-container">
					<div class="fuel-cover"></div>
					<div class="fuel-cover-bottom"></div>

					<div class="arrow-container">
						<div class="arrow-wrapper">
							<div class="arrow fuel-arrow"></div>
							
							<span class="fuel-text">
								<span class="fuel-icon">
								<image src="http://127.0.0.1:5500/assest/lucide_fuel.svg"></image>
							</span>
						</div>
						<span style="color: #fff;margin-left:90px;">F</span>
					</div>
				</div>
			</div>
		</div>
		<div class ="total-feature">
			<div class="feature-container">

				<div class="head-info">
					<span class="time" style="font-weight: bold;">11:11</span>
					<span class="weather" style="font-weight: bold;"><img src="http://127.0.0.1:5500/assest/weather.svg">32℃</span>
					<span class="day"style="font-weight: bold;" >01/07/2023</span>

				</div>
				<div class="main-info">
					<div class="main-info-line main-info-dis">
						<span class="main-info-dis-icon" style="display: flex; align-items: center;">
							<img src="http://127.0.0.1:5500/assest/dis.svg">
							<span style="margin-left: 15px;">DIS</span>
						</span>
						<span class="main-info-dis-number" style="font-weight: medium;font-size: 2em;">110</span>
						<span>Km</span>
					</div>
					<div class="main-info-line main-info-temp">
						<span class="main-info-temp-icon" style="display: flex;align-items: center;">
							<img src="http://127.0.0.1:5500/assest/temp.svg">
							<span style="margin-left: 15px;">TEMP</span>
						</span>
						<span class="main-info-temp-number"style="font-weight: medium;font-size: 2em;">+26.2</span>
						<span>℃</span>
					</div>
					<div class="main-info-line main-info-dur">
						<span class="main-info-dur-icon" style="display: flex; align-items: center;">
							<img src="http://127.0.0.1:5500/assest/dur.svg">
							<span style="margin-left: 15px;">DUR</span>
						</span>
						<span class="main-info-dur-number"style="font-weight: medium;font-size: 2em;">189</span>
						<span >mins</span>
					</div>
					<div class="main-info-car">
					<img src="http://127.0.0.1:5500/assest/headlight-whitebg.png" class = "light-system" style="scale: 10%;  transform: rotate(180deg); overflow: hidden; z-index: 1; position: absolute; top:-444px" >
					<img src="http://127.0.0.1:5500/assest/mycar.png" style="scale: 80%; z-index: 2">
					<img src="http://127.0.0.1:5500/assest/headlight-whitebg.png" class = "light-system backlight backlight-left" style="scale: 3%;  transform: rotate(40deg); overflow: hidden; z-index: 1; position: absolute; top:-150px;left: -225%" >
					<img src="http://127.0.0.1:5500/assest/headlight-whitebg.png" class = "light-system backlight backlight-right" style="scale: 3%;  transform: rotate(325deg); overflow: hidden; z-index: 1; position: absolute; top:-150px; left: -200%" >
						<span class="status">PARKING</span>
					</div>    
				</div>

				<div class="nav">
					<ul class="nav-car">
						<li class="active"><a href="#total-info">
							<i class="fa fa-car" style="color: #757272 ;"></i>
						</a></li>
						<li class="inactive"><a href="#car-fan">
							<i class="fa fa-snowflake-o"style="color: #757272 ;"></i>
						</a></li>
						<li class="inactive"><a href="#car-mic">
							<i class="fa fa-microphone"style="color: #757272 ;"></i>
						</a></li>
						<li class="inactive"><a href="#car-bluetooth">
							<i class="fa fa-bluetooth"style="color: #757272 ;"></i>
						</a></li>
						<li><a href="#car-noti">
							<i class="fa fa-warning"style="color: #757272 ;"></i>
						</a></li>
					</ul>
				</div>
			</div>
		</div>
	</div>
	<div class="control-bar" style ="width:300px;height:400px;display:grid;align-content:center;justify-content:center;align-items:center" >
		<h1>Control</h1>
		<button type="button" id="btn-turn-left" class ="btn" >Turn left</button>
		<button type="button" id="btn-turn-right" class ="btn">Turn right</button>
		<button type="button" id="btn-speed-up" class ="btn">Speed up</button>
		<button type="button" id="btn-slow-down" class ="btn">Slown down</button>
		<button type="button" id="btn-emergency" class ="btn">Emergency</button>
		<button type="button" id="stopCar" class ="btn">Stop the car</button>
		<button type="button" id="runCar" class ="btn">Run the car</button>
		<button type="button" id="send-data" class ="btn">Send the data</button>
		<button type="button" id="stop-send" class ="btn">Stop send the data</button>

		<p>You want to : <span id="cnt">...<\span></p>

		<div class="user-input-route">
			<div>
				<div>
					<input type="text" id ="from" placeholder="Origin">
				</div>
			</div>
			<div>
				<div>
					<input type="text" id ="to" placeholder="Destination">
				</div>
			</div>
			<div>
				<button type="button" id="submit" class ="btn" style ="margin-top: 10px">Submit your location</button>
			</div>
		</div>
		<span id = "user-status">No connection</span>
	</div>
	<div class ="table">
		<h2>CarNearby</h2>
		<table id="car-table">
			<tr>
				<th>Name Car</th>
				<th>Speed</th>
				<th>Want to take l/r</th>
				<th>Distance (m)</th>
				<th>Angle</th>
			</tr>
		</table>
	</div>
</div>
`;
const bg = mainBoard.querySelector(".bg");
const container = bg.querySelector(".container");
const table = bg.querySelector(".table");
const carTable = table.querySelector("#car-table");
const ggContainer = container.querySelector(".google-map");
const meterObject = container.querySelector(".meter-object");
const meterHead = meterObject.querySelector(".meter-head");
const iconContainer = meterHead.querySelector(".icon-container");
const totalFeature = container.querySelector(".total-feature");
const featureContainer = totalFeature.querySelector(".feature-container");
const mainInfo = featureContainer.querySelector(".main-info");
const mainInfoCar = mainInfo.querySelector(".main-info-car");
const backLight = mainInfoCar.querySelector(".backlight");
const backLightLeft = mainInfoCar.querySelector(".backlight-left");
const backLightRight = mainInfoCar.querySelector(".backlight-right");
const status = mainInfoCar.querySelector(".status");
const control = bg.querySelector(".control-bar");
const sendData = control.querySelector("#send-data");
const stopSend = control.querySelector("#stop-send");
const input = control.querySelector(".user-input-route");
let runCar = control.querySelector("#runCar");
let stopCar = control.querySelector("#stopCar");
let inputSubmit = input.querySelector("#submit"); // id
const meter = container.querySelector(".meter-object");
const speed = meter.querySelector(".meter-body");
let turnLeftBtn = control.querySelector("#btn-turn-left");
let turnRightBtn = control.querySelector("#btn-turn-right");
const leftContainer = iconContainer.querySelector(".turn-left");
const rightContainer = iconContainer.querySelector(".turn-right");
const leftArrow = leftContainer.querySelector("#left-arrow");
const rightArrow = rightContainer.querySelector("#right-arrow");
let beepsound = new Audio("beep-01a.mp3");

const GoogleMapsPluginApi = async (apikey, box) => {
  console.log("GoogleMapsPluginApi successfull");
  await loadScript(
    box.window,
    `https://maps.googleapis.com/maps/api/js?key=${apikey}&libraries=geometry`
  );
  // MAP CREATATION

  map = new box.window.google.maps.Map(ggContainer, {
    zoom: 20,
    mapId: "a8dea08fb82841f5",
    tilt: 90,
  });

  socket.on("addNearby", (anotherCar) => {
    while (carTable.rows.length > 1) {
      carTable.deleteRow(1);
    }
    while (distanceArray.length > 1) {
      distanceArray.pop();
    }
    for (let j = 0; j < anotherCar.length; j++) {
      let info = anotherCar[j];
      if (info.id === myID || info.loc == null) continue;
      // visualize table
      const newLoc = new box.window.google.maps.LatLng(info.loc);
      let distance;
      if (currentPos) {
        distance = calculateDistance(
          currentPos.lat,
          currentPos.lng,
          info.loc.lat,
          info.loc.lng
        ).toFixed(3);
      }
      const newRow = carTable.insertRow();

      var nameCell = newRow.insertCell();
      nameCell.textContent = info.id;

      distanceArray.push({ id: info.id, dis: distance });

      var speedCell = newRow.insertCell();
      speedCell.textContent = info.speed;
      var direc = newRow.insertCell();
      direc.textContent =
        info.dir == -1 ? "Left" : info.dir == 0 ? "Straight" : "Right";

      var distanceCell = newRow.insertCell();
      distanceCell.textContent = distance;

      var anglecell = newRow.insertCell();
      anglecell.textContent = calculateAngle(a, info.slope).toFixed(2);
      // visulize in MAP
      if (carNearby.has(info.id) == false) {
        // dont have in carNearby
        let newmarker = new box.window.google.maps.Marker({
          draggable: false,
          icon: {
            path: box.window.google.maps.SymbolPath.CIRCLE,
            scale: 5,
          },
          map: map,
          // position: {lat: newLoc.lat,lng: newLoc.lng},
        });
        carNearby.set(info.id, 1);
        markerArray.push(newmarker);
      } else {
        if (markerArray[j] != undefined) {
          if (newLoc.lat) markerArray[j].setPosition(newLoc);
        } else {
          let newone = new box.window.google.maps.Marker({
            draggable: false,
            icon: {
              path: box.window.google.maps.SymbolPath.CIRCLE,
              scale: 5,
            },
            map: map,
          });
          markerArray[j] = newone;
        }
      }
    }
  });
};
function calculateAndDisplayRoute(box, path, map) {
  const directionsRenderer = new box.window.google.maps.DirectionsRenderer();
  box.window.directionsRenderer = directionsRenderer;
  // directionsRenderer.setMap(map);
  // MARKER CREATION
  svgMarker = {
    anchor: new box.window.google.maps.Point(270, 298),
    path: "m409.49 485.75-165-80.9-165 80.9c-25.3 12.4-52.4-13.1-41.6-39.1l178.5-427.9c10.4-25 45.8-25 56.3 0l178.4 427.9c10.8 25.9-16.3 51.5-41.6 39.1z",
    fillColor: "black",
    fillOpacity: 1,
    strokeWeight: 0,
    rotation: 0,
    scale: 0.15,
  };
  mainMarker = new box.window.google.maps.Marker({
    map: map,
    icon: svgMarker,
    draggable: true,
  });

  const start = new box.window.google.maps.LatLng(path[0].lat, path[0].lng);
  const end = new box.window.google.maps.LatLng(path[1].lat, path[1].lng);
  const mode = box.window.google.maps.TravelMode.DRIVING;
  const directionsService = new box.window.google.maps.DirectionsService();
  directionsService
    .route({
      origin: start,
      destination: end,
      travelMode: mode,
    })
    .then((response) => {
      routeResult = response;
      directionsRenderer.setDirections(response);
      showSteps(response, map, box);
    })
    .catch((e) => console.log("Directions request failed due to " + e));
}
function showSteps(directionResult, map, box) {
  // used varibable
  myRoute = directionResult.routes[0].legs[0];
  myRouteSegment = myRoute.steps[0];
  path = myRouteSegment.path;
  myRoad = [
    {
      lat: myRouteSegment.start_location.lat(),
      lng: myRouteSegment.start_location.lng(),
    },
    {
      lat: myRouteSegment.end_location.lat(),
      lng: myRouteSegment.end_location.lng(),
    },
  ];

  a = slope(myRoad);
  b = intercept(myRoad, a);
  // set marker position and map center
  mainMarker.setPosition(myRouteSegment.start_location);
  currentPos = {
    lat: mainMarker.getPosition().lat(),
    lng: mainMarker.getPosition().lng(),
  };
  map.setCenter(myRouteSegment.start_location);
  // set map heading
  let heading = box.window.google.maps.geometry.spherical.computeHeading(
    path[0],
    path[1]
  );
  // draw full route
  map.setHeading(heading);
  console.log("Heading: " + heading);
  for (let k = 0; k < myRoute.steps.length; k++) {
    let route = new box.window.google.maps.Polyline({
      map: map,
      path: myRoute.steps[k].path,
      geodesic: true,
      strokeColor: "#45b6fe",
      strokeOpacity: 1.0,
      strokeWeight: 20,
    });
    routeArray.push(route);
  }
}
function runMyCar(routeResult, map, box) {
  if (!routeResult || !map || running) return;
  running = true;
  // used variables
  myRoute = routeResult.routes[0].legs[0];
  myRouteSegment = myRoute.steps[0];
  path = myRouteSegment.path;
  myRoad = [
    {
      lat: myRouteSegment.start_location.lat(),
      lng: myRouteSegment.start_location.lng(),
    },
    {
      lat: myRouteSegment.end_location.lat(),
      lng: myRouteSegment.end_location.lng(),
    },
  ];

  a = slope(myRoad);
  b = intercept(myRoad, a);
  heading = box.window.google.maps.geometry.spherical.computeHeading(
    myRoad[0],
    myRoad[1]
  );
  map.setHeading(heading);
  mainMarker.setPosition(path[0]);
  map.setCenter(path[0]);
  // RUN
  sieuphuctap = setInterval(() => {
    if (running) {
      socket.emit("updateLoc", { id: myID, loc: currentPos });
      if (i > myRoute.steps.length) {
        console.log("end of road");
        speedCar = 0;
        setSpeed(speedCar);
        clearInterval(sieuphuctap);
        status.innerHTML = "STOP";
      }
      currentPos = {
        lat: mainMarker.getPosition().lat(),
        lng: mainMarker.getPosition().lng(),
      };
      let distanceToTurn = calculateDistance(
        currentPos.lat,
        currentPos.lng,
        myRoad[1].lat,
        myRoad[1].lng
      ).toFixed(3);
      if (distanceToTurn < 30) {
        if (!changeDirection) {
          if (myRoute.steps[i + 1]) {
            // console.log(myRoute.steps[i + 1].maneuver);
            changeDirection = true;
            if (myRoute.steps[i + 1].maneuver == "turn-right") {
              blinkingArrow(1);
              direction = 1;
            } else if (myRoute.steps[i + 1].maneuver == "turn-left") {
              blinkingArrow(-1);
              direction = -1;
            } else {
              blinkingArrow(0);
              direction = 0;
            }
          } else {
            blinkingArrow(0);
            direction = 0;
          }
        }
      } else {
        changeDirection = false;
        blinkingArrow(0);
        direction = 0;
      }
      map.setCenter(mainMarker.getPosition());
      if (heading < 120 && heading > 0) {
        //  (heading <= 0 && heading >= -90) || (heading >= 0 && heading <= 90)
        mainMarker.setPosition({
          lat: currentPos.lat + step,
          lng: a * currentPos.lat + b,
        });
        if (currentPos.lat > myRoad[1].lat) {
          i = i + 1;
          myRouteSegment = myRoute.steps[i];
          if (myRouteSegment) {
            path = myRouteSegment.path;
            myRoad = [
              {
                lat: myRouteSegment.start_location.lat(),
                lng: myRouteSegment.start_location.lng(),
              },
              {
                lat: myRouteSegment.end_location.lat(),
                lng: myRouteSegment.end_location.lng(),
              },
            ];
            a = slope(myRoad);
            b = intercept(myRoad, a);
            heading = box.window.google.maps.geometry.spherical.computeHeading(
              myRoad[0],
              myRoad[1]
            );
            mainMarker.setPosition(myRouteSegment.start_location);
            map.setHeading(heading);
            console.log("heading:" + heading);
          }
        }
      } else if (heading > -120 && heading < 0) {
        //(heading >= -180 && heading <= -90) || (heading >= 90 && heading <= 180)
        mainMarker.setPosition({
          lat: currentPos.lat + step,
          lng: a * currentPos.lat + b,
        });
        if (currentPos.lat > myRoad[1].lat) {
          i = i + 1;
          myRouteSegment = myRoute.steps[i];
          if (myRouteSegment) {
            path = myRouteSegment.path;
            myRoad = [
              {
                lat: myRouteSegment.start_location.lat(),
                lng: myRouteSegment.start_location.lng(),
              },
              {
                lat: myRouteSegment.end_location.lat(),
                lng: myRouteSegment.end_location.lng(),
              },
            ];
            a = slope(myRoad);
            b = intercept(myRoad, a);
            heading = box.window.google.maps.geometry.spherical.computeHeading(
              myRoad[0],
              myRoad[1]
            );
            mainMarker.setPosition(myRouteSegment.start_location);
            map.setHeading(heading);
            console.log("heading:" + heading);
          }
        }
      } else {
        mainMarker.setPosition({
          lat: currentPos.lat - step,
          lng: a * currentPos.lat + b,
        });
        if (currentPos.lat < myRoad[1].lat) {
          i = i + 1;
          myRouteSegment = myRoute.steps[i];
          if (myRouteSegment) {
            path = myRouteSegment.path;
            myRoad = [
              {
                lat: myRouteSegment.start_location.lat(),
                lng: myRouteSegment.start_location.lng(),
              },
              {
                lat: myRouteSegment.end_location.lat(),
                lng: myRouteSegment.end_location.lng(),
              },
            ];
            a = slope(myRoad);
            b = intercept(myRoad, a);
            heading = box.window.google.maps.geometry.spherical.computeHeading(
              myRoad[0],
              myRoad[1]
            );
            mainMarker.setPosition(myRouteSegment.start_location);
            map.setHeading(heading);
            console.log("heading:" + heading);
          }
        }
      }
    }
  }, 100);
}
function calculateRPM(speed) {
  let rpm = Math.round((speed * 60) / (7.2 * Math.PI * 0.25));
  return rpm;
}
function setSpeed(value) {
  if (value < 0 || value > 2 || !submitted) return;

  const bg = speed.querySelector(".speed-container");
  const ovalline = bg.querySelector(".speed-oval-line");
  ovalline.querySelector(".speed-fill").style.transform = `rotate(${
    value / 4
  }turn)`;
  const speedNumber = ovalline.querySelector(".speed-counter");
  if (value >= 1.2) {
    speedNumber.querySelector(".speed-number").style = `color:red;`;
    speedNumber.querySelector(".speed-number").style.textShadow =
      "0px 0px 10px #ff0000";
  }
  speedNumber.querySelector(".speed-number").textContent = `${Math.round(
    value * 100
  )}`;
  let speedUpBtn = control.querySelector("#btn-speed-up");
  if (speedUpBtn && running) {
    speedUpBtn.addEventListener("click", () => {
      console.log("speedUpBtn click");
      control.querySelector("#cnt").innerHTML = "Speed up";
      if (value < 2) {
        value = value + 0.05;
        if (step == 0) step = 0.00001;
        else step = step * 1.07;
      } else {
        value = 2;
      }
      speedNumber.querySelector(".speed-number").textContent = `${Math.round(
        value * 100
      )}`;
      ovalline.querySelector(".speed-fill").style.transform = `rotate(${
        value / 4
      }turn)`;
      if (value >= 1.2) {
        speedNumber.querySelector(".speed-number").style = `color:red;`;
        speedNumber.querySelector(".speed-number").style.textShadow =
          "0px 0px 10px #ff0000";
      } else {
        speedNumber.querySelector(".speed-number").style = `color:white;`;
        speedNumber.querySelector(".speed-number").style.textShadow =
          "0px 0px 0px #ff0000";
      }
    });
  }
  let slowDownBtn = control.querySelector("#btn-slow-down");
  if (slowDownBtn && running) {
    slowDownBtn.addEventListener("click", () => {
      control.querySelector("#cnt").innerHTML = "slow down";
      console.log("slowDownBtn click");
      if (value > 0.05) {
        value = value - 0.05;
        step = step / 0.5;
      } else {
        value = 0;
        step = 0;
      }
      speedNumber.querySelector(".speed-number").textContent = `${Math.round(
        value * 100
      )}`;
      ovalline.querySelector(".speed-fill").style.transform = `rotate(${
        value / 4
      }turn)`;
      if (value >= 1.2) {
        speedNumber.querySelector(".speed-number").style = `color:red;`;
        speedNumber.querySelector(".speed-number").style.textShadow =
          "0px 0px 10px #ff0000";
      } else {
        speedNumber.querySelector(".speed-number").style = `color:white;`;
        speedNumber.querySelector(".speed-number").style.textShadow =
          "0px 0px 0px #ff0000";
      }
    });
  }
}
function slope(myRoad) {
  if (myRoad[0].lat == myRoad[1].lat) {
    return null;
  }
  return (myRoad[1].lng - myRoad[0].lng) / (myRoad[1].lat - myRoad[0].lat);
}
function intercept(myRoad, slope) {
  if (slope === null) {
    // vertical line
    return myRoad[0].lat;
  }
  return myRoad[0].lng - slope * myRoad[0].lat;
}
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers

  // Convert latitude and longitude to radians
  const lat1Rad = toRadians(lat1);
  const lon1Rad = toRadians(lon1);
  const lat2Rad = toRadians(lat2);
  const lon2Rad = toRadians(lon2);

  // Calculate the differences between the coordinates
  const dLat = lat2Rad - lat1Rad;
  const dLon = lon2Rad - lon1Rad;

  // Apply the Haversine formula
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1Rad) *
      Math.cos(lat2Rad) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c * 1000;

  return distance;
}
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}
function calculateAngle(m1, m2) {
  const angle = Math.atan((m2 - m1) / (1 + m1 * m2));
  let rs = angle * (180 / Math.PI);
  if (rs < 0) rs = -rs;
  return rs;
}
let connect;
function senDataFunc() {
  if (submitted) {
    socket.emit("updateInfo", {
      id: myID,
      loc: currentPos,
      slope: a,
      dir: direction,
      speed: speedCar * 100,
    });
  }
}
function checkCollision(anotherCarInfo, distanceArray) {
  const count = anotherCarInfo.length;
  for (let i = 1; i < count; i++) {
    let info = anotherCarInfo[i];
    if (info.id === myID || info.loc == null) continue;
    if (haveColli == false) {
      const dis = calculateDistance(
        currentPos.lat,
        currentPos.lng,
        info.loc.lat,
        info.loc.lng
      ).toFixed(3);
      const angle = calculateAngle(a, info.slope).toFixed(2);
      const speed = info.speed;
      if (deltaDistanceWithID(info.id, distanceArray, anotherCarInfo)) {
        if (dis < 7 && angle > 80 && speed > 0 && speedCar > 0) {
          if (direction == 0 && info.dir == 0) {
            haveColli = true;
            console.log("Collided !!!");
            // setWarning(cells[0].textContent);
          }
          if (
            (direction == 0 && info.dir == 1) ||
            (direction == 0 && info.dir == -1)
          ) {
            haveColli = true;
            console.log("Collided !!!");
          }
          if (
            (direction == 1 && info.dir == 0) ||
            (direction == -1 && info.dir == 0)
          ) {
            haveColli = true;
            console.log("Collided !!!");
          }
        }
      }
    }
  }
}
function deltaDistanceWithID(id, distanceArray, anotherCarInfo) {
  let info;
  for (let i = 0; i < anotherCarInfo.length; i++) {
    if (anotherCarInfo[i].id == id) {
      info = anotherCarInfo[i];
    }
  }
  for (let i = 0; i < distanceArray.length; i++) {
    if (distanceArray[i].id === id) {
      let newDistance = calculateDistance(
        currentPos.lat,
        currentPos.lng,
        info.loc.lat,
        info.loc.lng
      );
      if (newDistance < distanceArray[i].dis) {
        return true;
      } else return false;
    }
  }
}
let warningInterval = null;
function sendWarning() {
  let meterObjStyle_1 = "-15px 15px 180px rgb(255, 0, 0)";
  let featureContainerStyle_1 = "15px 15px 180px rgb(255, 0, 0)";
  let meterObjStyle_2 = "-15px 15px 180px rgb(183, 74, 74)";
  let featureContainerStyle_2 = "15px 15px 180px rgb(183, 74, 74)";
  warningInterval = setInterval(() => {
    if (meterObject.style.boxShadow == meterObjStyle_1) {
      meterObject.style.boxShadow = meterObjStyle_2;
    } else {
      meterObject.style.boxShadow = meterObjStyle_1;
    }

    if (featureContainer.style.boxShadow == featureContainerStyle_1) {
      featureContainer.style.boxShadow = featureContainerStyle_2;
    } else {
      featureContainer.style.boxShadow = featureContainerStyle_1;
    }
	beepsound.play();
  }, 400);
}
function stopSendWarning() {
  clearInterval(warningInterval);
  warningInterval = null;
  featureContainer.style.boxShadow = "";
  meterObject.style.boxShadow = "";
}
socket.on("connected", (message) => {
  myID = message;
  control.querySelector("#user-status").innerHTML = message;
});
if (turnLeftBtn) {
  control.querySelector("#cnt").textContent = "turn left";
  turnLeftBtn.addEventListener("click", () => {
    if (leftArrow) {
      console.log("have  click");
      if (blinkInterval == null) {
        blinkingArrow(-1);
      } else {
        blinkingArrow(0);
      }
    }
  });
}
if (turnRightBtn) {
  control.querySelector("#cnt").textContent = "turn right";
  turnRightBtn.addEventListener("click", () => {
    if (rightArrow) {
      if (blinkInterval == null) {
        blinkingArrow(1);
      } else {
        blinkingArrow(0);
      }
    }
  });
}
function blinkingArrow(value) {
  if (value == 0) {
    if (blinkInterval) {
      clearInterval(blinkInterval);
      blinkInterval = null;
      rightArrow.style.opacity = "1";
      rightArrow.style.filter = "";
      leftArrow.style.opacity = "1";
      leftArrow.style.filter = "";
      backLightLeft.style.display = "none";
      backLightRight.style.display = "none";
    }
  } else if (value == 1) {
    blinkInterval = setInterval(() => {
      rightArrow.style.opacity = rightArrow.style.opacity == "1" ? "0.3" : "1";
      backLightRight.style.display = "block";
      backLightRight.style.opacity =
        backLightRight.style.opacity == "1" ? "0.5" : "1";
    }, 300);
    rightArrow.style.filter = "hue-rotate(-60deg)";
  } else {
    blinkInterval = setInterval(() => {
      leftArrow.style.opacity = leftArrow.style.opacity == "1" ? "0.3" : "1";
      backLightLeft.style.display = "block";
      backLightLeft.style.opacity =
        backLightLeft.style.opacity == "1" ? "0.5" : "1";
    }, 300);
    leftArrow.style.filter = "hue-rotate(-60deg)";
  }
}
sendData.addEventListener("click", () => {
  connect = setInterval(senDataFunc, 300);
});
stopSend.addEventListener("click", () => {
  if (connect) {
    clearInterval(connect);
  }
});
const plugin = ({ widgets, simulator, vehicle }) => {
  //----- WIDGET REGISTER-----//
  widgets.register("map", (box) => {
    GoogleMapsPluginApi(PLUGINS_APIKEY, box);
    inputSubmit.addEventListener("click", () => {
      var fromPos = input.querySelector("#from").value;
      var fromPosSplit = fromPos.split(",");
      var toPos = input.querySelector("#to").value;
      var toPosSplit = toPos.split(",");
      var wrongInput = false;
      if (fromPosSplit.length < 3 && toPosSplit.length < 3) {
        for (let i = 0; i < 2; i++) {
          if (isNaN(parseFloat(fromPosSplit))) wrongInput = true;
          if (isNaN(parseFloat(toPosSplit))) wrongInput = true;
        }
        if (wrongInput) {
          console.log("Each input must be 2 float number");
        } else {
          submitted = true;
          running = false;
          stopping = false;
          status.innerHTML = "PARKING";
          a = null;
          b = null;
          speedCar = 0;
          if (mainMarker) {
            for (let i = 0; i < routeArray.length; i++) {
              routeArray[i].setMap(null);
            }
            mainMarker.setMap(null);
            clearInterval(sieuphuctap);
            running = false;
          }
          const path = [
            { lat: 0, lng: 0 },
            { lat: 0, lng: 0 },
          ];
          path[0].lat = fromPosSplit[0];
          path[1].lat = toPosSplit[0];
          path[0].lng = fromPosSplit[1];
          path[1].lng = toPosSplit[1];
          setSpeed(0);
          calculateAndDisplayRoute(box, path, map);
          socket.emit("initLoc", {
            id: myID,
            loc: currentPos,
            slope: a,
            dir: direction,
            speed: speedCar,
          });
        }
      }
    });
    runCar.addEventListener("click", () => {
      if (submitted) {
        if (stopping) {
          running = true; // here still fail
        } else {
          if (running) {
            setInterval(runInterval, 100);
          } else {
            runMyCar(routeResult, map, box);
            i = 0;
          }
        }
        status.innerHTML = "DRIVING";
        speedCar = 0.5;
        setSpeed(speedCar);
      }
    });
    stopCar.addEventListener("click", () => {
      running = false;
      stopping = true;
      speedCar = 0;
      setSpeed(0);
      status.innerHTML = "STOP";
    });
    box.injectNode(mainBoard);
  });
};
export default plugin;

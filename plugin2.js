import { PLUGINS_APIKEY } from "./reusable/apikey.js";
import loadScript from "./reusable/loadScript.js";
//---------------------------------------------------//

let mapContainer = document.createElement("div"); // main map
mapContainer.setAttribute("style", `position: height: 100%; width: 100%;`);
const location = { lat: 10.850325, lng: 106.747632 };
let map;
let mainMarker; 
let svgMarker;
let routeResult;
let routeArray = [];
let initialCenter = location;
let step = 0.00001;
let running = false;

const mainBoard = document.createElement("div");
mainBoard.innerHTML =
`
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
<link rel="stylesheet" type="text/css" href="http://127.0.0.1:5500/style.css">
<div class="bg">
	<div class ="container">
		<div class = "google-map"></div>
		<div class ="meter-object">
			<div class = "meter-head">
				<div class="icon-container">
					<div class="turn-left">
						<img src="http://127.0.0.1:5500/assest/turnleft.svg">
					</div>
					<div class="normal-warn">
						<img src="http://127.0.0.1:5500/assest/seatbell.svg">
						<img src="http://127.0.0.1:5500/assest/door.svg">
						<img src="http://127.0.0.1:5500/assest/headlight.svg"class="headlight">
						
					</div>
					<div class="turn-right">
						<img src="http://127.0.0.1:5500/assest/turnright.svg">
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
							<div class="arrow">

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
							<div class="arrow fuel-arow"></div>
							
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
						<img src="http://127.0.0.1:5500/assest/mycar.png" style="scale: 80%">
						<span class="status">DRIVING</span>
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
		<button type="button" id="stop" class ="btn">Stop the car</button>
		<button type="button" id="runCar" class ="btn">Run the car</button>
		<p>You want to : <span id="cnt">...<\span></p>

		<div class="user-input-route user-input">
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
		<div class="user-input user-account">
			<div>
				<div>
					<input type="text" placeholder="tài khoản">
				</div>
			</div>
			<div>
				<div>
					<input type="text" placeholder="mật khẩu">
				</div>
			</div>
		</div>
	</div>
    </div>
    <script type="text/javascript" src="app.js"></script>
`
const bg = mainBoard.querySelector(".bg");
const container = bg.querySelector(".container")
const ggContainer = container.querySelector(".google-map")
const control = bg.querySelector(".control-bar");
const input = control.querySelector(".user-input-route");
let runCar = control.querySelector("#runCar");
let inputSubmit = input.querySelector("#submit"); // id
const meter = container.querySelector(".meter-object")
const speed = meter.querySelector(".meter-body");

const GoogleMapsLocation = async (apikey, box, initialCenter) => { // create a map in mapContainer

    await loadScript(box.window, `https://maps.googleapis.com/maps/api/js?key=${apikey}`);
    
	const { Map } = await box.window.google.maps.importLibrary("maps");
	// main map
	map = new Map(mapContainer, {
        zoom: 20,
		center: initialCenter,
		heading: 0,
		tilt: 90,
		mapId: "a8dea08fb82841f5",
    });
    //--------------------------
	const svgMarker = {
		path: "m409.49 485.75-165-80.9-165 80.9c-25.3 12.4-52.4-13.1-41.6-39.1l178.5-427.9c10.4-25 45.8-25 56.3 0l178.4 427.9c10.8 25.9-16.3 51.5-41.6 39.1z",
		fillColor: "black",
		fillOpacity: 1,
		strokeWeight: 0,
		rotation: 0,
		scale: 0.1,
		anchor: new box.window.google.maps.Point(0, 20),
	};
    mainMarker = new box.window.google.maps.Marker({
        position: initialCenter,
        map:map,
		icon: svgMarker,
		draggable: true,
	});

    mainMarker.setPosition(initialCenter)
    box.window.google.maps.event.addListener(mainMarker, 'dragend', function(ev){
        console.log(mainMarker.getPosition().lat());
        console.log(mainMarker.getPosition().lng());

    });

    //---------------------
    return {
        setLocation: (coordinates) => {
            if (coordinates === null) {
                if (mainMarker !== null) {
                    mainMarker.setMap(null)
                    mainMarker = null    
                }
            } else {
                const {lat, lng} = coordinates
                if (mainMarker === null) {
                    mainMarker = new box.window.google.maps.Marker({
                        position: {lat, lng},
                        map,
                        icon: icon === null ? {
                            path: "M -53.582954,-415.35856 C -67.309015,-415.84417 -79.137232,-411.40275 -86.431515,-395.45159 L -112.76807,-329.50717 C -131.95714,-324.21675 -140.31066,-310.27864 -140.75323,-298.84302 L -140.75323,-212.49705 L -115.44706,-212.49705 L -115.44706,-183.44029 C -116.67339,-155.74786 -71.290042,-154.67757 -70.275134,-183.7288 L -69.739335,-212.24976 L 94.421043,-212.24976 L 94.956841,-183.7288 C 95.971739,-154.67759 141.39631,-155.74786 140.16998,-183.44029 L 140.16998,-212.49705 L 165.43493,-212.49705 L 165.43493,-298.84302 C 164.99236,-310.27864 156.63886,-324.21677 137.44977,-329.50717 L 111.11322,-395.45159 C 103.81894,-411.40272 91.990714,-415.84414 78.264661,-415.35856 L -53.582954,-415.35856 z M -50.57424,-392.48409 C -49.426163,-392.49037 -48.215854,-392.45144 -46.988512,-392.40166 L 72.082372,-392.03072 C 82.980293,-392.28497 87.602258,-392.03039 92.236634,-381.7269 L 111.19565,-330.61998 L -86.30787,-330.86727 L -67.554927,-380.61409 C -64.630656,-390.57231 -58.610776,-392.44013 -50.57424,-392.48409 z M -92.036791,-305.02531 C -80.233147,-305.02529 -70.646071,-295.47944 -70.646071,-283.6758 C -70.646071,-271.87217 -80.233147,-262.28508 -92.036791,-262.28508 C -103.84043,-262.28508 -113.42751,-271.87216 -113.42751,-283.6758 C -113.42751,-295.47946 -103.84043,-305.02531 -92.036791,-305.02531 z M 117.91374,-305.02531 C 129.71738,-305.02533 139.26324,-295.47944 139.26324,-283.6758 C 139.26324,-271.87216 129.71738,-262.28508 117.91374,-262.28508 C 106.1101,-262.28507 96.523021,-271.87216 96.523021,-283.6758 C 96.523021,-295.47944 106.1101,-305.02531 117.91374,-305.02531 z M 103.2216,-333.14394 L 103.2216,-333.14394 z M 103.2216,-333.14394 C 103.11577,-333.93673 102.96963,-334.55679 102.80176,-335.21316 C 101.69663,-339.53416 100.2179,-342.16153 97.043938,-345.3793 C 93.958208,-348.50762 90.488134,-350.42644 86.42796,-351.28706 C 82.4419,-352.13197 45.472822,-352.13422 41.474993,-351.28706 C 33.885682,-349.67886 27.380491,-343.34759 25.371094,-335.633 C 25.286417,-335.3079 25.200722,-334.40363 25.131185,-333.2339 L 103.2216,-333.14394 z M 64.176391,-389.01277 C 58.091423,-389.00227 52.013792,-385.83757 48.882186,-379.47638 C 47.628229,-376.92924 47.532697,-376.52293 47.532697,-372.24912 C 47.532697,-368.02543 47.619523,-367.53023 48.822209,-364.99187 C 50.995125,-360.40581 54.081354,-357.67937 59.048334,-355.90531 C 60.598733,-355.35157 62.040853,-355.17797 64.86613,-355.27555 C 68.233081,-355.39187 68.925861,-355.58211 71.703539,-356.95492 C 75.281118,-358.72306 77.90719,-361.35074 79.680517,-364.96188 C 80.736152,-367.11156 80.820083,-367.68829 80.820085,-372.0392 C 80.820081,-376.56329 80.765213,-376.87662 79.470596,-379.50637 C 76.3443,-385.85678 70.261355,-389.02327 64.176391,-389.01277 z",
                            fillColor: '#2563eb',
                            fillOpacity: 1,
                            anchor: new box.window.google.maps.Point(12,-290),
                            strokeWeight: 0,
                            scale: .10,
                            rotation: 0
                        } : icon
                    })
                } else {
                    mainMarker.setPosition({lat, lng})
                }    
            }
        }
    }
    
}

const GoogleMapsPluginApi = async (apikey, box, path) => {
	console.log("GoogleMapsPluginApi successfull")
    await loadScript(box.window, `https://maps.googleapis.com/maps/api/js?key=${apikey}&libraries=geometry`)
	// MAP CREATATION

    map = new box.window.google.maps.Map(ggContainer, {
        zoom: 20,
		center: path[0],
		mapId: "a8dea08fb82841f5",
		tilt: 90,
	});
};
function calculateAndDisplayRoute(box, path, map) {
	const directionsRenderer = new box.window.google.maps.DirectionsRenderer();
	box.window.directionsRenderer = directionsRenderer
    // directionsRenderer.setMap(map);
	// MARKER CREATION
	svgMarker = {
		anchor: new box.window.google.maps.Point(298,298),
		path: "m409.49 485.75-165-80.9-165 80.9c-25.3 12.4-52.4-13.1-41.6-39.1l178.5-427.9c10.4-25 45.8-25 56.3 0l178.4 427.9c10.8 25.9-16.3 51.5-41.6 39.1z",
		fillColor: "black",
		fillOpacity: 1,
		strokeWeight: 0,
		rotation: 0,
		scale: 0.1,
	};
    mainMarker = new box.window.google.maps.Marker({
		position: initialCenter,
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
		showSteps(response,map,box);
    })
	.catch((e) => console.log("Directions request failed due to " + e));
}
function showSteps(directionResult, map, box) {
	// used varibable
	let i = 0;
	const myRoute = directionResult.routes[0].legs[0];
	let myRouteSegment = myRoute.steps[i];
	let path = myRouteSegment.path;
	// set marker position and map center
	mainMarker.setPosition(myRouteSegment.start_location);
	map.setCenter(myRouteSegment.start_location);
	// set map heading
	let heading = box.window.google.maps.geometry.spherical.computeHeading(
		path[0],
		path[1]
	);
	// draw full route
	map.setHeading(heading);
	for (let k = 0; k < myRoute.steps.length; k++) {
		let route = new box.window.google.maps.Polyline({
			map:map,
			path: myRoute.steps[k].path,
			geodesic: true,
			strokeColor: "#45b6fe",
			strokeOpacity: 1.0,
			strokeWeight: 20,
		});
		routeArray.push(route);
	}
	console.log(myRoute)

}
function runMyCar(routeResult, map, box){
	if (!routeResult || !map || running) return;
	console.log("Phong");
	// used variables
	let j = 0;
	let i = 0;
	const myRoute = routeResult.routes[0].legs[0];
	let myRouteSegment = myRoute.steps[i];
	let path = myRouteSegment.path;
	// RUN
	const routeInterval = setInterval(() => {
		let heading = box.window.google.maps.geometry.spherical.computeHeading(
			myRouteSegment.path[j],
			myRouteSegment.path[j+1]
		);
		map.setHeading(heading);
		mainMarker.setPosition(path[j]);
		map.setCenter(path[j])
		j = j + 1;
		if (j >= path.length - 1) {
			j = 0;
			i = i + 1;
			myRouteSegment = myRoute.steps[i];
			if (myRouteSegment) {
				path = myRouteSegment.path;
			}
			else {
				clearInterval(routeInterval)
			}
		}
	}, 700);
	
	
	// let myRoad = [{ lat: path[j].lat(), lng: path[j].lng() },
	// 	{ lat: path[j + 1].lat(), lng: path[j + 1].lng() }];
	// let a = slope(myRoad);
	// let b = intercept(myRoad, a);
	// const ratphuctap = setInterval(() => {
	// 	let currentPos = mainMarker.getPosition();
	// 	if (heading > 180) {
	// 		mainMarker.setPosition({ lat: currentPos.lat() + step, lng: a * currentPos.lat() + b });
	// 		map.setCenter(mainMarker.getPosition());
	// 		if (mainMarker.getPosition().lat() > myRoad[1].lat) { // het 1 doan
	// 			console.log("het 1 doan NHO");
	// 			j = j + 1;
	// 			if (j >= path.length - 1) { // het ca doan 
	// 				console.log("het doan LON");
	// 				j = 0;
	// 				i = i + 1;
	// 				if (i >= myRoute.steps.length) {	
	// 					clearInterval(ratphuctap)
	// 				}
	// 				myRouteSegment = myRoute.steps[i];
	// 				// ve path truoc 
	// 				if (myRouteSegment) {
	// 					path = myRouteSegment.path;
	// 					new box.window.google.maps.Polyline({
	// 						map: map,
	// 						path: path,
	// 						geodesic: true,
	// 						strokeColor: "#45b6fe",
	// 						strokeOpacity: 1.0,
	// 						strokeWeight: 20,
	// 					});
	// 				}
	// 			}
	// 			if (myRouteSegment) {
	// 				myRoad = [{ lat: path[j].lat(), lng: path[j].lng() },
	// 				{ lat: path[j + 1].lat(), lng: path[j + 1].lng() }];
	// 				a = slope(myRoad);
	// 				b = intercept(myRoad, a);
	// 				// heading = box.window.google.maps.geometry.spherical.computeHeading(
	// 				// 	path[j],
	// 				// 	path[j+1]
	// 				// );
	// 				// // map.setHeading(heading);
	// 				// console.log(heading);
	// 			}
	// 		}
	// 	}
	// 	else {
	// 		mainMarker.setPosition({ lat: currentPos.lat() - step, lng: a * currentPos.lat() + b });
	// 		map.setCenter(mainMarker.getPosition());
	// 		if (mainMarker.getPosition().lat() < myRoad[1].lat) { // het 1 doan
	// 			console.log("het 1 doan NHO");
	// 			j = j + 1;
	// 			if (j >= path.length - 1) { // het ca doan
	// 				console.log("het doan LON");
	// 				j = 0;
	// 				i = i + 1;
	// 				if (i >= myRoute.steps.length) {	
	// 					clearInterval(ratphuctap)
	// 				}
	// 				myRouteSegment = myRoute.steps[i];
	// 				// ve path truoc 
	// 				if (myRouteSegment) {
	// 					path = myRouteSegment.path;
	// 					new box.window.google.maps.Polyline({
	// 						map: map,
	// 						path: path,
	// 						geodesic: true,
	// 						strokeColor: "#45b6fe",
	// 						strokeOpacity: 1.0,
	// 						strokeWeight: 20,
	// 					});
	// 				}
	// 			}
	// 			if (myRouteSegment) {
	// 				myRoad = [{ lat: path[j].lat(), lng: path[j].lng() },
	// 				{ lat: path[j + 1].lat(), lng: path[j + 1].lng() }];
	// 				a = slope(myRoad);
	// 				b = intercept(myRoad, a);
	// 				// heading = box.window.google.maps.geometry.spherical.computeHeading(
	// 				// 	path[j],
	// 				// 	path[j+1]
	// 				// 	);
	// 				// // map.setHeading(heading);
	// 				// console.log(heading);
	// 			}
	// 		}
	// 	}
	// 	console.log("phong")
	// }, 100);	
	
	// for (i = 0; i < myRoute.steps.length; i++) {
	// 	const myRouteSegment = myRoute.steps[i];
	// 	mainMarker.setPosition(myRouteSegment.start_location);

	// 	const heading = box.window.google.maps.geometry.spherical.computeHeading(
	// 		myRouteSegment.start_location,
	// 		myRouteSegment.end_location
	// 	);
	// 	map.setHeading(heading);
	// 	const path = myRouteSegment.path;
	// 	let route = new box.window.google.maps.Polyline({
	// 		path: path,
	// 		geodesic: true,
	// 		strokeColor: "#45b6fe",
	// 		strokeOpacity: 1.0,
	// 		strokeWeight: 20,
	// 	});
	// 	route.setMap(map);
	// 	let j = 0;
	// 	const myInter = setInterval(() => {
	// 		if (j >= path.length - 1)
	// 			clearInterval(myInter);
	// 		mainMarker.setPosition(path[j]);
	// 		map.setCenter(path[j])
	// 		j = j + 1;
	// 		console.log("phong")
	// 	}, 1000);
	// }
}
function slope(myRoad) {
	if (myRoad[0].lat == myRoad[1].lat) {
		return null;
	}
	return (myRoad[1].lng - myRoad[0].lng) / (myRoad[1].lat - myRoad[0].lat);
}
function intercept(myRoad,slope) {
	if (slope === null) {
		// vertical line
		return myRoad[0].lat;
	}
	return (myRoad[0].lng - slope * myRoad[0].lat);
}


function calculateRPM(value){
	let rpm = Math.round(value*60/(7.2*Math.PI*0.25))
	return rpm
}
function setSpeed(value){
    if (value < 0 || value > 2) return;
    
    const bg = speed.querySelector(".speed-container");
    const ovalline = bg.querySelector(".speed-oval-line");
    ovalline.querySelector(".speed-fill").style.transform = `rotate(${value/4}turn)`
    const speedNumber = ovalline.querySelector(".speed-counter");
    if (value >= 1.2) {
        speedNumber.querySelector(".speed-number").style = `color:red;`
        speedNumber.querySelector(".speed-number").style.textShadow = "0px 0px 10px #ff0000"; 
    }
    speedNumber.querySelector(".speed-number").textContent = `${Math.round(value*100)}`
	let speedUpBtn = control.querySelector("#btn-speed-up")
	if (speedUpBtn) {
		speedUpBtn.addEventListener("click", () => {
			console.log("speedUpBtn click");
			control.querySelector("#cnt").innerHTML = 'Speed up';
			if (value < 1.95) {
				value = value + 0.05;
				if(step == 0)
					step = 0.00001;
				step = step * 1.5;
			}
			else {
				value = 2;
				step = step * 1.5;
			}
			speedNumber.querySelector(".speed-number").textContent = `${Math.round(value*100)}`
			ovalline.querySelector(".speed-fill").style.transform = `rotate(${value/4}turn)`
			if (value >= 1.2) {
				speedNumber.querySelector(".speed-number").style = `color:red;`
				speedNumber.querySelector(".speed-number").style.textShadow = "0px 0px 10px #ff0000"; 
			}
			else{
				speedNumber.querySelector(".speed-number").style = `color:white;`
				speedNumber.querySelector(".speed-number").style.textShadow = "0px 0px 0px #ff0000";
			}
		})
	}
	let slowDownBtn = control.querySelector("#btn-slow-down")
	if (slowDownBtn) {
		slowDownBtn.addEventListener("click", () => {
			control.querySelector("#cnt").innerHTML = 'slow down'
			console.log('slowDownBtn click');
			if (value > 0.05) {
				value = value - 0.05;
				step = step / 1.5;
			}
			else {
				value = 0;
				step = 0;
			}
			speedNumber.querySelector(".speed-number").textContent = `${Math.round(value*100)}`
			ovalline.querySelector(".speed-fill").style.transform = `rotate(${value/4}turn)`
			if (value >= 1.2) {
				speedNumber.querySelector(".speed-number").style = `color:red;`
				speedNumber.querySelector(".speed-number").style.textShadow = "0px 0px 10px #ff0000"; 
			}
			else{
				speedNumber.querySelector(".speed-number").style = `color:white;`
				speedNumber.querySelector(".speed-number").style.textShadow = "0px 0px 0px #ff0000";
			}
		})
	}
}

40.631663, -74.329692
40.630410, -74.329131


const plugin = ({ widgets, simulator, vehicle }) => {
	const path = [{lat: 0, lng: 0},{lat: 0,lng: 0}]
	//----- WIDGET REGISTER-----//
	widgets.register("map", (box) => {
		GoogleMapsPluginApi(PLUGINS_APIKEY, box, path);
		inputSubmit.addEventListener("click", () => {
			var fromPos = input.querySelector("#from").value;
			var fromPosSplit = fromPos.split(",")
			var toPos = input.querySelector("#to").value;
			var toPosSplit = toPos.split(",");
			var wrongInput = false;
			if (fromPosSplit.length < 3 && toPosSplit.length < 3) {
				for (let i = 0; i < 2; i++) {
					if (isNaN(parseFloat(fromPosSplit))) wrongInput = true;
					if (isNaN(parseFloat(toPosSplit))) wrongInput = true;
				}
				if (wrongInput) {
					console.log("Each input must be 2 float number")
				}
				else {
					if (mainMarker) {
						for (let i = 0; i < routeArray.length; i++){
							routeArray[i].setMap(null);
						}
						mainMarker.setMap(null);
					}
					path[0].lat = fromPosSplit[0];
					path[1].lat = toPosSplit[0];
					path[0].lng = fromPosSplit[1];
					path[1].lng = toPosSplit[1];
					calculateAndDisplayRoute(box, path, map)
				}
			}
		});
		runCar.addEventListener("click", () => {
			runMyCar(routeResult, map, box);
			setSpeed(1.1)
		});
		box.injectNode(mainBoard);
	})
	let leftBtn = control.querySelector("#btn-turn-left")
	if (leftBtn) {
		leftBtn.addEventListener("click", () => {
			console.log('leftBtn click')
			// initialLeft = true;
			// initialRight = false;
			control.querySelector("#cnt").innerHTML = 'Turn Left';
		})
	}
	let rightBtn = control.querySelector("#btn-turn-right")
	if (rightBtn) {
		rightBtn.addEventListener("click", () => {
			console.log('rightBtn click')
			// initialRight = true;
			// initialLeft = false;
			control.querySelector("#cnt").innerHTML = 'Turn right';
		})
	}
}
export default plugin;

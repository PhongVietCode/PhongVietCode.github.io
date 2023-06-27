import StatusTable from "./reusable/StatusTable.js"
import { PLUGINS_APIKEY } from "./reusable/apikey.js";
import loadScript from "./reusable/loadScript.js";
import "./socket.io/client-dist/socket.io.js";
const API_HOST = "https://app.digitalauto.tech"

// socket.io init ----------------------
const socket = io('http://127.0.0.1:3000');
//-------------------------
// ini var
let currentPos = { lat: 0, lng: 0 };
let nearMarkers = [];
let nearbyCar = new Map();
var maxSpeed = 100;
const initSpeed = 10;
let currentSpeed = 0;
let myCarname = "";
let distance = 0;
let initialLeft = false;
let haveWriteCurrentLocation = false;
let initialRight = false;
let a = 1;
let b = 1;
let myint;
let haveColli = false;
let currentInformation = { name: myCarname };
let timeInterval = 10;
let step = 0.0000001;
let initstep = 0.0000001;
let des; 
let route;
const control = document.createElement("div")
control.style = 'width:100%;height:100%;display:grid;align-content:center;justify-content:center;align-items:center'
control.innerHTML = `
	<style>
	.btn{
		border-radius: 12px;
		border: 2px solid #4CAF50; /* Green */
		margin:2px;
		transition-duration: 0.2s;
	}
	.btn:hover {
		background-color: #4CAF50; 
		color: white;
		box-shadow: 0 12px 16px 0 rgba(0,0,0,0.24), 0 17px 50px 0 rgba(0,0,0,0.19);
		padding: 3px;
		margin: 4px;
	}
	h1 {
		display: flex;
	}
	</style>
	<h1>Control</h1>
			<button type="button" id="btn-turn-left" class ="btn" >Turn left</button>
			<button type="button" id="btn-turn-right" class ="btn">Turn right</button>
			<button type="button" id="btn-speed-up" class ="btn">Speed up</button>
			<button type="button" id="btn-slow-down" class ="btn">Slown down</button>
			<button type="button" id="btn-emergency" class ="btn">Emergency</button>
			<button type="button" id="stop" class ="btn">Stop the car</button>
			<button type="button" id="continue" class ="btn">Run the car</button>
	<p>You want to : <span id="cnt">...<\span></p>
`
const bc = document.createElement("div")
bc.style = `width:100%;height:100%;display:grid;align-content:center;justify-content:center;align-items:center`
bc.innerHTML = `
	<style>
		table {
		font-family: arial, sans-serif;
		border-collapse: collapse;
		width: 100%;
		}
		td, th {
		border: 1px solid #dddddd;
		text-align: left;
		padding: 8px;
		}
		tr:nth-child(even) {
		background-color: #dddddd;
		}
		.message{
			background-color: powderblue;
			padding: 10px;
			align-content:center;
			justify-content:center;
		}
		h1{
			padding: 10px;
			align-content:center;
			justify-content:center;
		}
	</style>
	<h1> 
		This a a boardcase online
	</h1>
	<div id = "message" class = "mess" >
		If you are not connectting to sever. Please refresh the page
	</div>
	<p id = "name" class = "mess">Undefined</p>

	<h2>Warning</h2>
	<table id="warningTable">
	<tr>
		<th>Name Car</th>
		<th>Message</th>
	</tr>
	</table>
		`
const otherCarInfo = document.createElement("div")
otherCarInfo.innerHTML = `
<style>
	table {
	font-family: arial, sans-serif;
	border-collapse: collapse;
	width: 100%;
	}
	td, th {
	border: 1px solid #dddddd;
	text-align: left;
	padding: 8px;
	}
	tr:nth-child(even) {
	background-color: #dddddd;
	}
</style>
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
`

const interFace = document.createElement("div")
interFace.innerHTML = `
<link rel="stylesheet" type="text/css" href="style.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
<div class ="container">
<div class ="google-map"">
	<div class="google-map-container">
		<img src ="http://127.0.0.1:5500/assest/map.png" style="width: 100%;height: 100%;object-fit: contain;border-radius: 30px;">
	</div>
</div>

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
			<span class="weather" style="font-weight: bold;"><img src="assest/weather.svg">32℃</span>
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
				<img src="http://127.0.0.1:5500/assest/mycar.png">
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
`
let table = otherCarInfo.querySelector('#car-table');
let myWarning = bc.querySelector("#warningTable");
setInterval(checkCollision, timeInterval);
// ggmap -----------------------
const GoogleMapsLocation = async (apikey, box, initialCenter, { icon = null } = {}) => {
	await loadScript(box.window, `https://maps.googleapis.com/maps/api/js?key=${apikey}`);

	const imageIcon = {
		url: "https://cdn-icons-png.flaticon.com/512/10480/10480377.png",
		size: new box.window.google.maps.Size(71, 71),
		origin: new box.window.google.maps.Point(0, 0),
		anchor: new box.window.google.maps.Point(17, 34),
		scaledSize: new box.window.google.maps.Size(50, 50),
	};
	let myMarker = new box.window.google.maps.Marker({
		draggable: false,
		icon: {
			path: box.window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
			scale: 5,
		},
	});
	
	const ggMap = document.createElement("div");
	ggMap.setAttribute("style", `height: 100%; width: 100%;`);

	const map = new box.window.google.maps.Map(ggMap, {
		zoom: 30,
		center: initialCenter,
		heading: 0,
		tilt: 90,
		mapId: "a8dea08fb82841f5",
	});

	socket.on("getMarker", (baseInfo) => {
		if (haveWriteCurrentLocation == false) {
			let ne = bc.querySelector("#name");
			ne.innerHTML = `Your car is: ${baseInfo.name}`;
			myCarname = baseInfo.name;
			currentInformation.name = myCarname;
			haveWriteCurrentLocation = true;
			currentPos = baseInfo.location;
			des = baseInfo.des;
			myMarker.setMap(map);
			myMarker.setPosition(currentPos);
			map.setCenter(currentPos);
			map.setHeading(baseInfo.heading)
			let myRoad = [baseInfo.location, baseInfo.des];
			// KHI CONNECT THI CHAY LUON MOT LAN DUY NHAT
			route = new box.window.google.maps.Polyline({
				path: myRoad,
				geodesic: true,
				strokeColor: "#45b6fe",
				strokeOpacity: 1.0,
				strokeWeight: 30,
			});
			route.setMap(map);
			a = slope(myRoad);
			b = intercept(myRoad, a);
			let sentdata = setInterval(
				function () {
					socket.emit("sendPos", { // always send data to sever
						location: currentPos,
						name: myCarname,
						speed: currentSpeed,
						direction: { left: initialLeft, right: initialRight },
						slope : a
					});
				}
			, timeInterval/10);
			function runM() {
				if (baseInfo.rv) {
					currentPos = runMarkerR(a, b, currentPos);
					if(currentPos.lat < baseInfo.des.lat) clearInterval(myint);
				}
				else {	
					currentPos = runMarker(a, b, currentPos);
					if(currentPos.lat > baseInfo.des.lat) clearInterval(myint);
				}
				
				map.setCenter(currentPos)
				myMarker.setPosition(currentPos)
			}
			const cont = control.querySelector("#continue")
			if (cont) {
				cont.addEventListener("click", () => {
					myint = setInterval(runM, timeInterval);
					currentSpeed = initSpeed;
				})
			}
			const st = control.querySelector("#stop")
			if (st) {
				st.addEventListener("click", () => {
					clearInterval(myint);
					currentSpeed = 0;
				})
			}
			
		}
	})

	socket.on("addNearby", markers => { 
		while (table.rows.length > 1) {
			table.deleteRow(1)
		}
		for (let j = 0; j < markers.length; j++) {
			let info = markers[j];
			if (info != null && info.name != myCarname) {
				distance = calculateDistance(currentPos.lat,currentPos.lng, markers[j].location.lat,markers[j].location.lng).toFixed(5);
				const newRow = table.insertRow();
				var nameCell = newRow.insertCell();
				nameCell.textContent = markers[j].name;

				var speedCell = newRow.insertCell();
				speedCell.textContent = markers[j].speed;
				
				var directionCell = newRow.insertCell();
				let currentDirection;
				if (markers[j].direction.left == false && markers[j].direction.right == false){
					currentDirection = "Straight";
				}
				else if (markers[j].direction.left == true){
					currentDirection = "Left";
				}
				else {
					currentDirection = "Right";
				}
				directionCell.textContent = currentDirection;
				
				var distanceCell = newRow.insertCell();
				distanceCell.textContent = distance;
				
				var anglecell = newRow.insertCell();
				anglecell.textContent = calculateAngle(a,markers[j].slope).toFixed(2);

				if (nearbyCar.has(markers[j].name) == false) {
					// run only one time
					nearbyCar.set(markers[j].name,1);
					// console.log(`add a near by marker car !, ${markers[j].name}`)
					let newmarker = new box.window.google.maps.Marker({
						draggable: false,
						icon: {
							path: box.window.google.maps.SymbolPath.CIRCLE,
							scale: 5,
						},
						map: map,
						label: markers[j].name,
					});
					nearMarkers.push(newmarker);
				}
				else {
					if (nearMarkers[j] != undefined) {
						// console.log(`have markers ${nearMarkers[j].getLabel()}`)
						nearMarkers[j].setPosition({ lat: markers[j].location.lat, lng: markers[j].location.lng });	
					}
					else {
						let newone  = new box.window.google.maps.Marker({
							draggable: false,
							icon: {
								path: box.window.google.maps.SymbolPath.CIRCLE,
								scale: 5,
							},
							map: map,
							label: markers[j].name,
						});
						nearMarkers[j] = newone;
					}
				}
			}
		}
	})
	box.injectNode(ggMap);
}

// plugin ----------------------
const plugin = ({ widgets, simulator, vehicle }) => {
	let leftBtn = control.querySelector("#btn-turn-left")
	if (leftBtn) {
		leftBtn.addEventListener("click", () => {
			console.log('leftBtn click')
			initialLeft = true;
			initialRight = false;
			control.querySelector("#cnt").innerHTML = 'Turn Left';
		})
	}
	let rightBtn = control.querySelector("#btn-turn-right")
	if (rightBtn) {
		rightBtn.addEventListener("click", () => {
			console.log('rightBtn click')
			initialRight = true;
			initialLeft = false;
			control.querySelector("#cnt").innerHTML = 'Turn right';
		})
	}
	let speedUpBtn = control.querySelector("#btn-speed-up")
	if (speedUpBtn) {
		speedUpBtn.addEventListener("click", () => {
			console.log("speedUpBtn click");
			control.querySelector("#cnt").innerHTML = 'Speed up';
			if (currentSpeed < maxSpeed - 5) {
				currentSpeed = currentSpeed + 5;
				if(step == 0)
					step = initstep;
				step = step * 1.5;
			}
			else {
				currentSpeed = maxSpeed;
				step = step * 1.5;
			}

		})
	}
	let emergencyBtn = control.querySelector("#btn-emergency")
	if (emergencyBtn) {
		emergencyBtn.addEventListener("click", () => {
			control.querySelector("#cnt").innerHTML = 'Request for emergency case'
			socket.emit('emergency-case', currentInformation);

			// add button for cancel
			if (!control.querySelector('#cancel-btn')) {
				let newBtn = document.createElement("button")
				newBtn.textContent = 'Cancel emergency case';
				newBtn.id = 'cancel-btn';
				newBtn.type = 'button';
				control.appendChild(newBtn);
			}
			let cancelBtn = control.querySelector('#cancel-btn');
			if (cancelBtn) {
				cancelBtn.addEventListener("click", () => {
					cancelBtn.style.display = "none";
					currentSpeed = initSpeed;
					control.querySelector("#cnt").textContent = ''
				})
				cancelBtn.style.display = '';
			}
		})
	}
	socket.on('emergency-case-request', (message) => {
		console.log("emergency")
		const rows = myWarning.getElementsByTagName('tr');
		const name = message.name;
		let foundRow = null;
		for (let i = 1; i < rows.length; i++) {
			const cells = rows[i].getElementsByTagName('td');
			const firstCell = cells[0].textContent;
			const secondCell = cells[1].textContent;

			if (firstCell === name && secondCell === 'Emergency !') {
					foundRow = rows[i];
					break;
			}
		}
		if (foundRow == null) {
			const newRow = myWarning.insertRow();
			var nameCell = newRow.insertCell();
			nameCell.textContent = name;
			var warningCell = newRow.insertCell();
			warningCell.textContent = 'Emergency !';
		}
	})
	
	let slowDownBtn = control.querySelector("#btn-slow-down")
	if (slowDownBtn) {
		slowDownBtn.addEventListener("click", () => {
			control.querySelector("#cnt").innerHTML = 'slow down'
			console.log('slowDownBtn click');
			if (currentSpeed > 5) {
				currentSpeed = currentSpeed - 5;
				step = step / 1.5;
			}
			else {
				currentSpeed = 0;
				step = 0;

			}
		})
	}
	simulator("Vehicle.ADAS.CruiseControl.SpeedSet", "get", () => {
		return currentSpeed;
	});
	simulator("Vehicle.Body.Lights.IsLeftIndicatorOn", "set", (value) => {
		initialLeft = value;
	});
	simulator("Vehicle.Body.Lights.IsRightIndicatorOn", "set", (value) => {
		initialRight = value;
	});
	simulator("Vehicle.Body.Lights.IsLeftIndicatorOn", "get", () => {
		return initialLeft;
	});
	simulator("Vehicle.Body.Lights.IsRightIndicatorOn", "get", () => {
		return initialRight;
	});

	// widget register ----------------------------
	socket.on('connect', () => {
		let mess = bc.querySelector("#message");
		mess.innerHTML = `You have connected to sever, your ID: ${socket.id}`;
		socket.emit("requestMarker", "give me marker");
	})
	widgets.register("Light", (box) => {
		box.injectNode(control)
	})
	widgets.register("Boardcast", (box) => {
		box.injectNode(bc)
	})
	widgets.register("listCar", (box) => {
		box.injectNode(otherCarInfo)
	})
	widgets.register("Table",
		StatusTable({
			apis: ["Vehicle.ADAS.CruiseControl.SpeedSet", "Vehicle.Body.Lights.IsRightIndicatorOn", "Vehicle.Body.Lights.IsLeftIndicatorOn"],
			vehicle: vehicle,
			refresh: 100
		})
	)
	widgets.register(
		"GoogleMapLocation",
		(box) => {
			GoogleMapsLocation(PLUGINS_APIKEY, box, currentPos)
		}
	)
	widgets.register("interFace",(box)=>{
		box.injectNode(interFace)
	}
	)
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
		Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	const distance = R * c * 1000;

	return distance;
}

function toRadians(degrees) {
	return degrees * (Math.PI / 180);
}
function runMarker(a, b, currentPos) {
	currentPos.lat = currentPos.lat + step;
	currentPos.lng = a * currentPos.lat + b;
	route.setPath([currentPos, des]);
	return currentPos;
}
function runMarkerR(a, b, currentPos) {
	currentPos.lat = currentPos.lat - step;
	currentPos.lng = a * currentPos.lat + b;
	return currentPos;
}
function calculateAngle(m1, m2) {
	const angle = Math.atan((m2 - m1) / (1 + m1 * m2));
	let rs = angle * (180 / Math.PI);
	if (rs < 0) rs = -rs;
	return rs;
}
function checkCollision() {
	const rows = table.getElementsByTagName('tr');
	let cells;
	for (let i = 1; i < rows.length; i++) {
		if (haveColli == false) {
			cells = rows[i].getElementsByTagName('td');
			const dis = cells[3].textContent;
			if (dis < 7) {
				const angle = cells[4].textContent;
				if (angle > 80) {
						const speed = cells[1].textContent;
						// if (speed > 0) {
						haveColli = true;
						setWarning(cells[0].textContent);
						console.log("Collided !!!")
						// }
					}
				}
			
		}
	}
}
function setWarning(name) {
	if (haveColli) {
		// warn to driver
		const newRow = myWarning.insertRow();
		var nameCell = newRow.insertCell();
		nameCell.textContent = name;
		var warningCell = newRow.insertCell();
		warningCell.textContent = 'Collide !!';
		// auto set speed
		currentSpeed = 0;
		// stop the camera
		clearInterval(myint);
	}
	else {
		// const Wrows = myWarning.getElementsByTagName('tr');
		// let Wcells;
		// for (let i = 1; i < Wrows.length; i++) {
		// 	Wcells = Wrows[i].getElementsByTagName('td');
		// 	if (Wcells[0].textContent === name) {
		// 		myWarning.deleteRow(i);
		// 		console.log("solve collide")
		// 	}
		// }
		// setInterval(myint, 1000);
	}
}
export default plugin
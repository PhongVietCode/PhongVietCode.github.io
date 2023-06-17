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
let table = otherCarInfo.querySelector('#car-table');
let myWarning = bc.querySelector("#warningTable");
setInterval(checkCollision, 1000);
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
			haveWriteCurrentLocation = true;
			currentPos = baseInfo.location;
			myMarker.setMap(map);
			myMarker.setPosition(currentPos);

			map.setCenter(currentPos);
			map.setHeading(baseInfo.heading)
			let myRoad = [baseInfo.location, baseInfo.des];
			// KHI CONNECT THI CHAY LUON MOT LAN DUY NHAT
			const route = new box.window.google.maps.Polyline({
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
			, 700);
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
					myint = setInterval(runM, 1000);
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
			
			// console.log("Draw a marker: " + baseInfo.name)
		}
	})

	socket.on("addNearby", markers => { 
		// console.log(markers)
		while (table.rows.length > 1) {
			table.deleteRow(1);
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
				anglecell.textContent = calculateAngle(a,markers[j].slope);

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
		// console.log(nearMarkers)
	})
	box.injectNode(ggMap);
}

// plugin ----------------------
const plugin = ({ widgets, simulator, vehicle }) => {
	
	
	socket.on('list-car', (listCar) => {
		for (let i = 0; i < listCar.length; i++) {
			console.log('line 103');
			// console.log(listCar[i]);
		}
	})
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
			if (currentSpeed < maxSpeed - 5)
				currentSpeed = currentSpeed + 5;
			else
				currentSpeed = maxSpeed;

		})
	}
	let emergencyBtn = control.querySelector("#btn-emergency")
	if (emergencyBtn) {
		emergencyBtn.addEventListener("click", () => {
			console.log('EmergencyBtn click');
			control.querySelector("#cnt").innerHTML = 'Request for emergency case'
			socket.emit('emergency-case', currentInformation);
			// add button for cancel
			if (!control.querySelector('#cancel-btn')) {
				let newBtn = document.createElement("button");
				newBtn.textContent = 'Cancel emergency case';
				newBtn.id = 'cancel-btn';
				newBtn.type = 'button';
				control.appendChild(newBtn);
			}
			let cancelBtn = control.querySelector('#cancel-btn');
			if (cancelBtn) {
				cancelBtn.addEventListener("click", () => {
					console.log('cancel btn click');
					cancelBtn.style.display = "none";
					currentSpeed = initSpeed;
					control.querySelector("#cnt").textContent = ''
				})
				cancelBtn.style.display = '';
			}
			console.log(currentInformation);
		})
	}
	socket.on('emergency-case-request', (message) => {
		let name = message.name
		if (currentInformation.name == name) {
			console.log("Success for request way")
			console.log(`Your name: ${currentInformation.name}`)
			console.log(`Request name: ${name}`)
			let mess = bc.querySelector("#message");
			mess.innerHTML = 'Success for request way. You can speed up now !!!';
			currentSpeed = currentSpeed * 1.1;
		}
		else {
			console.log("other car need to go fast")
			console.log(`Your name: ${currentInformation.name}`)
			console.log(`Request name: ${name}`)
			let mess = bc.querySelector("#message");
			mess.innerHTML = 'Other car need to go fast!. Slow down';
			currentSpeed = 0;

		}
	})
	let slowDownBtn = control.querySelector("#btn-slow-down")
	if (slowDownBtn) {
		slowDownBtn.addEventListener("click", () => {
			control.querySelector("#cnt").innerHTML = 'slow down'
			console.log('slowDownBtn click');
			if (currentSpeed > 5) {
				currentSpeed = currentSpeed - 5;
			}
			else {
				currentSpeed = 0;
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
	currentPos.lat = currentPos.lat + 0.00000000000000000001;
	currentPos.lng = a * currentPos.lat + b;
	return currentPos;
}
function runMarkerR(a, b, currentPos) {
	currentPos.lat = currentPos.lat - 0.00000000000000000001;
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
				else {
					haveColli = false;
					setWarning(cells[0].textContent);
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
		const Wrows = myWarning.getElementsByTagName('tr');
		let Wcells;
		for (let i = 1; i < Wrows.length; i++) {
			Wcells = Wrows[i].getElementsByTagName('td');
			if (Wcells[0].textContent == name) {
				myWarning.deleteRow(i);
			}
		}
	}
}
export default plugin
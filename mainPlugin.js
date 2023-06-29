import { PLUGINS_APIKEY } from "./reusable/apikey.js";
import loadScript from "./reusable/loadScript.js";
import "./socket.io/client-dist/socket.io.js";
const API_HOST = "https://app.digitalauto.tech"

//---------------------------------------------------//
const socket = io('http://127.0.0.1:3000');
//--------------------------------------------------//
const baseRoute = [
	[{ lat: 40.632062, lng: -74.330391 }, { lat: 40.630421, lng: -74.327539 }],
	[{ lat: 40.630338, lng: -74.329200 }, { lat: 40.630179, lng: -74.327987 }],
	[{ lat: 40.631791, lng: -74.327792 }, { lat: 40.630071, lng: -74.328100 }],
	[{ lat: 40.631028, lng: -74.329862 }, { lat: 40.630228, lng: -74.327218 }],
];
let mapContainer = document.createElement("div"); // main map
mapContainer.setAttribute("style", `position: height: 100%; width: 100%;`);
let map;
let mainMarker; 
let svgMarker;
let routeResult;
let routeArray = [];
let markerID = [];
let step = 0.00001;
let running = false;
let stopping = false;
let submitted = false;
let haveColli = false;
let sieuphuctap;
let currentPos = null;
let myID;
let myRoute ;
let myRouteSegment;
let path;
let myRoad;
let j = 0;
let i = 0;
let heading;
let a = null, b = null;
let warningInterval = null;
let runInterval;
const mainBoard = document.createElement("div");
let blinkInterval;
let direction = 0; // -1: left,0: straing, 1: right
let carNearby = new Map();
let markerArray = [];
let distanceArray = [];
let anotherCarInfo = [];
let speedCar = 0;
let changeDirection = false;
let rpmNumber = 0, fuelNumber = 100;
let randomValue = -1;

mainBoard.innerHTML =
`
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
<link rel="stylesheet" type="text/css" href="http://127.0.0.1:5500/style.css">
<div class="bg">
	<div class ="container">
		<div class = "google-map">
            <img src ="https://th.bing.com/th/id/R.68adb561dcadf80f67de0f32a5c53d5b?rik=jimdahS9PKU1nQ&pid=ImgRaw&r=0" style="object-fit: fill;width: 100%; height: 100%;">
        </div>
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
                <div class="feature-container-info">
                    <div class="car-info">
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
                            <img src="http://127.0.0.1:5500/assest/headlight-whitebg.png" class = "light-system backlight backlight-left" style="scale: 3%;  transform: rotate(40deg); overflow: hidden; z-index: 1; position: absolute; top:-150px;left: -176%" >
                            <img src="http://127.0.0.1:5500/assest/headlight-whitebg.png" class = "light-system backlight backlight-right" style="scale: 3%;  transform: rotate(325deg); overflow: hidden; z-index: 1; position: absolute; top:-150px; left: -154%" >
							<span class="status">PARKING</span>
						</div>   
                        </div>	
                    </div>
				</div>
				<div class="nav">
					<ul class="nav-car">
						<li class="active" id = "car-info-btn"><a href="javascript:console.log('Hello World!');">
							<i class="fa fa-car" style="color: #757272 ;"></i>
						</a></li>
						<li class="inactive"><a href="javascript:console.log('Hello World!');">
							<i class="fa fa-microphone"style="color: #757272 ;"></i>
						</a></li>
						<li class="inactive" id = "boardcast-btn"><a href="javascript:console.log('Hello World!');">
							<i class="fa fa-bluetooth"style="color: #757272 ;"></i>
						</a></li>
						<li class="inactive"><a href="javascript:console.log('Hello World!');">
							<i class="fa fa-snowflake-o"style="color: #757272 ;"></i>
						</a></li>
						<li><a href="javascript:console.log('Hello World!');">
							<i class="fa fa-warning"style="color: #757272 ;"></i>
						</a></li>
					</ul>
				</div>
			</div>
		</div>
	</div>
	<div class="control-bar">
		<h1 class="control-bar-title">Control</h1>
        <div class="user-input-route">
			<div>
				<div>
					<input type="text" id ="from" class ="user-input-route-box" class placeholder="Origin">
				</div>
			</div>
			<div>
				<div>
					<input type="text" id ="to" class ="user-input-route-box" placeholder="Destination">
				</div>
			</div>
			<div>
				<button type="button" id="submit" class ="user-input-route-btn" style ="margin-top: 10px">Submit</button>
			</div>
            <span>Or</span>
            <div class="user-input-route-random">
				<form action="#" id ="form-choose-loc" >
                    <label for="cars">Choose a location:</label>
                    <select name="cars" id="cars-random" onchange="getRandomInput(this)">
                      <option value="-1"></option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                    </select>
                    <br>
                </form>
			</div>
		</div>
        <div class ="control-bar-unit control-bar-unit-speed">
			<div class ="control-bar-unit-speed-box box-1">
           		<button type="button" id="btn-speed-up" class ="control-bar-btn speed-btn speed-btn10">10</button>
            	<button type="button" id="btn-slow-down" class ="control-bar-btn speed-btn speed-btn20">20</button>
			</div>
            <div class ="control-bar-unit-speed-box box-2">
				<button type="button" id="btn-slow-down" class ="control-bar-btn speed-btn speed-btn70">70</button>
            	<button type="button" id="btn-slow-down" class ="control-bar-btn speed-btn speed-btn120">120</button>
			</div>
           
        </div>
        <div class="control-bar-unit control-bar-unit-control">
            <button type="button" id="stopCar" class ="control-bar-btn">Stop car</button>
            <button type="button" id="runCar" class ="control-bar-btn">Run car</button>
        </div>
        <div class="control-bar-unit control-bar-text">
            <span id="cnt">...</span>
            <span id = "user-status">No connection</span>
        </div>
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
`

const bg = mainBoard.querySelector(".bg");
const container = bg.querySelector(".container");
const table = bg.querySelector(".table");
const carTable = table.querySelector("#car-table");
const ggContainer = container.querySelector(".google-map")
const meterObject = container.querySelector(".meter-object");
const meterHead = meterObject.querySelector(".meter-head");
const meterTail = meterObject.querySelector(".meter-tail");
const rpmMeterContainer = meterTail.querySelector(".rpm-meter-container");
const arrowContainerRPM = rpmMeterContainer.querySelector(".arrow-container")
const arrowWrapperRPM = arrowContainerRPM.querySelector(".arrow-wrapper");
const rpmArrow = arrowWrapperRPM.querySelector(".rpm-arrow");
const fuelMeterContainer = meterTail.querySelector(".fuel-meter-container");
const arrowContainerFuel = fuelMeterContainer.querySelector(".arrow-container")
const arrowWrapperFuel = arrowContainerFuel.querySelector(".arrow-wrapper");
const fuelArrow = arrowWrapperFuel.querySelector(".fuel-arrow");
const iconContainer = meterHead.querySelector(".icon-container");
const totalFeature = container.querySelector(".total-feature")

// Feature Container
const featureContainer = totalFeature.querySelector(".feature-container")
const featureContainerInfo = featureContainer.querySelector(".feature-container-info");
const nav = featureContainer.querySelector(".nav");
// //-----------User login-----------\\
const userLoginContainer = document.createElement("div");
userLoginContainer.className = "user-login";
userLoginContainer.style = `
	display: block
`
userLoginContainer.innerHTML = `
<div class ="user-login">
	<div class="user-login-form">
		<div class ="user-login-form-text"style="font-size: 1.7em;margin-bottom: 37px;">BoardCast Channel</div>
		<div class ="user-login-form-text" style="font-size: 4em; margin-bottom: 44px;">Login</div>
		<div class="user-login-info">
			<div>
				<div>
					<input type="text" class="input-box" id ="user-name" placeholder="Your user ID">
				</div>
			</div>
			<div>
				<div>
					<input type="text" class="input-box" id ="password" placeholder="Password">
				</div>
			</div>
			<div class="check-box" style="left:0; width:46%">
				<input type="checkbox" id="rememberMe" name="rememberMe" value="Bike">
				<label for="rememberMe" style="color: #fff;left:0">Remember me</label><br>
			</div>
			<div class="check-box">
				<input type="checkbox" id="agreeTerm" name="agreeTerm" value="Bike">
				<label for="agreeTerm" style="color: #fff;"> I agree with <u style="color: rgb(184, 131, 233)">Terms and Condition</u> and <u style="color: rgb(184, 131, 233)">Policy Privacy</u> </label><br>
			</div>
			<div>
				<button type="button" id ="user-login-info-btn" class="submit-btn" style ="margin-top: 70px">Login</button>
			</div>
			
			<div class ="user-login-form-text" style="font-size: 1.3em;margin-top: 15px;">Don't have account? <u style="color: chartreuse;"> Get started </u></div>
		</div>
	</div>
</div>
`
const userLoginForm = userLoginContainer.querySelector(".user-login-form");
const userLoginFormBtn = userLoginForm.querySelector("div #user-login-info-btn"); 
// ---------BoardcastSetting--------------\\
const boardcastContainer = document.createElement("div");
boardcastContainer.className = "boardcast-setting";
boardcastContainer.style = `display:block;`
boardcastContainer.innerHTML = `
<div class = "boardcast-setting">
	<button type="button" id = "send-data-btn" class="boardcast-setting-btn" onclick="javascript:console.log('Phong')" >
		<span class="label">Send Data</span>
		<span class="transition"></span>
		<span class="gradient"></span>
	</button>
	<button type="button" id = "stop-send-data-btn" class="boardcast-setting-btn"  onclick="javascript:console.log('Phong')" >
		<span class="label">Stop Send Data</span>
		<span class="transition"></span>
		<span class="gradient"></span>
	</button>

	<div>
		<input type="text" id ="from" class ="boardcast-setting-emergency" class placeholder="Emergency ID">
	</div>   
	<div class="boardcast-setting-priority">
		<form action="#">
			<label for="priority">Priority level:</label>
			<select name="priority" id="priority-choose" onchange="console.log(this.value)">
				<option value="-1"></option>
				<option value="1">1</option>
				<option value="2">2</option>
				<option value="3">3</option>
				<option value="4">4</option>
			</select>
			<br>
		</form>
	</div>
	<div class = "boardcast-setting-info" style="color: #fff; font-size: 1.2em; margin: 10px;
	padding:10px">If you not send data, you won't be warned about the potential collsion</div>
	<div class = "boardcast-setting-info boardcast-setting-info-emergency" style="color: #fff; font-size: 1.2em; margin: 5px;
	padding:10px">Input your Emergency ID to get the highest priority level</div>
</div>
`
const sendData = boardcastContainer.querySelector("#send-data-btn")
const stopSend = boardcastContainer.querySelector("#stop-send-data-btn")
// Car info-----------------------------\\
const carInfo = featureContainerInfo.querySelector(".car-info");
const mainInfoCar = carInfo.querySelector(".main-info-car")
const backLight = mainInfoCar.querySelector(".backlight")
const backLightLeft = mainInfoCar.querySelector(".backlight-left")
const backLightRight = mainInfoCar.querySelector(".backlight-right")
const status = mainInfoCar.querySelector(".status");
const meter = container.querySelector(".meter-object")
const speed = meter.querySelector(".meter-body");
// Control bar-----------------------
const controlBar = bg.querySelector(".control-bar");
const controlBarUnitSpeed = controlBar.querySelector(".control-bar-unit-speed");
const boxSpeed1 = controlBarUnitSpeed.querySelector(".box-1")
const speed10 = boxSpeed1.querySelector(".speed-btn10");
const speed20 = boxSpeed1.querySelector(".speed-btn20");
const boxSpeed2 = controlBarUnitSpeed.querySelector(".box-2")
const speed70 = boxSpeed2.querySelector(".speed-btn70");
const speed120 = boxSpeed2.querySelector(".speed-btn120");



const controlBarUnitControl = controlBar.querySelector(".control-bar-unit-control");
const controlBartext = controlBar.querySelector(".control-bar-text");
const input = controlBar.querySelector(".user-input-route");
const inputRandom = input.querySelector(".user-input-route-random");
const forminputRandom = inputRandom.querySelector("#form-choose-loc");
const selectinputRandom = forminputRandom.querySelector("#cars-random");
const inputRandomBtn = inputRandom.querySelector("#random-submit");
let inputSubmit = input.querySelector("#submit"); // id

let runCar = controlBarUnitControl.querySelector("#runCar");
let stopCar = controlBarUnitControl.querySelector("#stopCar");
let speedUpBtn = controlBarUnitSpeed.querySelector("#btn-speed-up")
let slowDownBtn = controlBarUnitSpeed.querySelector("#btn-slow-down")
//==================================

const leftContainer = iconContainer.querySelector(".turn-left");
const rightContainer = iconContainer.querySelector(".turn-right");
const leftArrow = leftContainer.querySelector('#left-arrow');
const rightArrow = rightContainer.querySelector('#right-arrow');

const GoogleMapsPluginApi = async (apikey, box) => {
	console.log("GoogleMapsPluginApi successfull")
    await loadScript(box.window, `https://maps.googleapis.com/maps/api/js?key=${apikey}&libraries=geometry`)
	// MAP CREATATION

    map = new box.window.google.maps.Map(ggContainer, {
        zoom: 20,
		mapId: "a8dea08fb82841f5",
		tilt: 90,
	});

	socket.on("addNearby", anotherCar => { 
		anotherCarInfo = anotherCar;
		while (carTable.rows.length > 1) {
			carTable.deleteRow(1)
		}
		while (distanceArray.length >1){
			distanceArray.pop();
		}
		for (let j = 0; j < anotherCar.length; j++){
			let info = anotherCar[j];
			if (info.id === myID || info.loc == null) continue;
			// visualize table
			const newLoc = new box.window.google.maps.LatLng(info.loc);
			let distance;
			let angle = calculateAngle(a, info.slope).toFixed(2);
			if(currentPos){
				distance = calculateDistance(currentPos.lat,currentPos.lng,info.loc.lat,info.loc.lng).toFixed(3);
			}

			const newRow = carTable.insertRow();
			
			var nameCell = newRow.insertCell();
			nameCell.textContent = info.id;
			distanceArray.push({id : info.id, dis : distance});
			var speedCell = newRow.insertCell();
			speedCell.textContent = info.speed;
			var direc = newRow.insertCell();
			direc.textContent = (info.dir == -1) ? "Left" : ((info.dir == 0) ? "Straight" : "Right");
			var distanceCell = newRow.insertCell();
			distanceCell.textContent = distance;
			var anglecell = newRow.insertCell();
			anglecell.textContent = angle;

			// visulize in MAP
			if (carNearby.has(info.id) == false) { // dont have in carNearby
				let newmarker = new box.window.google.maps.Marker({
					draggable: false,
					icon: {
						anchor: new box.window.google.maps.Point(270,298),
						path: "M391.909 145.036c-.938-2.731-4.263-4.855-7.039-4.855h-36.061c-2.775 0-6.101 2.124-7.04 4.855-.918 2.673-1.604 5.058-2.06 7.301l-24.088-66.641c-3.973-10.989-14.495-18.372-26.179-18.372H105.209c-11.685 0-22.205 7.383-26.18 18.374L54.94 152.345c-.457-2.245-1.143-4.633-2.062-7.309-.938-2.731-4.264-4.855-7.039-4.855H9.778c-2.775 0-6.101 2.124-7.039 4.855-3.652 10.633-3.65 16.72.001 27.354.938 2.731 4.264 4.855 7.039 4.855H45.84c.034 0 .07-.009.105-.01l-.544 1.507c-7.353 2.443-12.662 9.365-12.662 17.539v122.156a8.886 8.886 0 0 0 8.887 8.887h44.727a8.887 8.887 0 0 0 8.887-8.887v-43.262h204.17v43.262a8.887 8.887 0 0 0 8.887 8.887h44.727a8.886 8.886 0 0 0 8.887-8.887V196.281c0-8.172-5.307-15.093-12.657-17.538l-.545-1.508c.033.001.068.009.101.009h36.061c2.776 0 6.101-2.124 7.039-4.855 3.651-10.633 3.649-16.72-.001-27.353zm-283.297-45.008h177.402l28.108 77.762H80.505l28.107-77.762zm4.948 132.543H76.142c-8.028 0-14.535-6.507-14.535-14.535 0-8.027 6.506-14.535 14.535-14.535h37.418c8.027 0 14.535 6.507 14.535 14.535.001 8.028-6.508 14.535-14.535 14.535zm204.945 0h-37.418c-8.027 0-14.535-6.507-14.535-14.535 0-8.027 6.508-14.535 14.535-14.535h37.418c8.028 0 14.535 6.507 14.535 14.535s-6.507 14.535-14.535 14.535z",
						fillColor: "black",
						fillOpacity: 1,
						strokeWeight: 0,
						rotation: 0,
						scale: 0.15,
					},
					map: map,
					// position: {lat: newLoc.lat,lng: newLoc.lng},
				});
				carNearby.set(info.id, 1);
				markerArray.push(newmarker);
				console.log("add new marker o tren");
			}
			else {
				if (markerArray[j] != undefined) {
					if(newLoc.lat)
						markerArray[j].setPosition(newLoc);	
				}
				else {
					let newone  = new box.window.google.maps.Marker({
						draggable: false,
						icon: {
							anchor: new box.window.google.maps.Point(270,298),
							path: "M391.909 145.036c-.938-2.731-4.263-4.855-7.039-4.855h-36.061c-2.775 0-6.101 2.124-7.04 4.855-.918 2.673-1.604 5.058-2.06 7.301l-24.088-66.641c-3.973-10.989-14.495-18.372-26.179-18.372H105.209c-11.685 0-22.205 7.383-26.18 18.374L54.94 152.345c-.457-2.245-1.143-4.633-2.062-7.309-.938-2.731-4.264-4.855-7.039-4.855H9.778c-2.775 0-6.101 2.124-7.039 4.855-3.652 10.633-3.65 16.72.001 27.354.938 2.731 4.264 4.855 7.039 4.855H45.84c.034 0 .07-.009.105-.01l-.544 1.507c-7.353 2.443-12.662 9.365-12.662 17.539v122.156a8.886 8.886 0 0 0 8.887 8.887h44.727a8.887 8.887 0 0 0 8.887-8.887v-43.262h204.17v43.262a8.887 8.887 0 0 0 8.887 8.887h44.727a8.886 8.886 0 0 0 8.887-8.887V196.281c0-8.172-5.307-15.093-12.657-17.538l-.545-1.508c.033.001.068.009.101.009h36.061c2.776 0 6.101-2.124 7.039-4.855 3.651-10.633 3.649-16.72-.001-27.353zm-283.297-45.008h177.402l28.108 77.762H80.505l28.107-77.762zm4.948 132.543H76.142c-8.028 0-14.535-6.507-14.535-14.535 0-8.027 6.506-14.535 14.535-14.535h37.418c8.027 0 14.535 6.507 14.535 14.535.001 8.028-6.508 14.535-14.535 14.535zm204.945 0h-37.418c-8.027 0-14.535-6.507-14.535-14.535 0-8.027 6.508-14.535 14.535-14.535h37.418c8.028 0 14.535 6.507 14.535 14.535s-6.507 14.535-14.535 14.535z",
							fillColor: "black",
							fillOpacity: 1,
							strokeWeight: 0,
							rotation: 0,
							scale: 0.15,
						},
						map: map,
					});
					console.log("add new marker o duoi");
					markerArray[j] = newone;
				}
			}	
		}
	})
};
function calculateAndDisplayRoute(box, path, map) {
	const directionsRenderer = new box.window.google.maps.DirectionsRenderer();
	box.window.directionsRenderer = directionsRenderer
    // directionsRenderer.setMap(map);
	// MARKER CREATION
	svgMarker = {
		anchor: new box.window.google.maps.Point(270,298),
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
		showSteps(response,map,box);
    })
	.catch((e) => console.log("Directions request failed due to " + e));
}
function showSteps(directionResult, map, box) {
	// used varibable
	myRoute = directionResult.routes[0].legs[0];
	myRouteSegment = myRoute.steps[0];
	path = myRouteSegment.path;
	myRoad = [{ lat: myRouteSegment.start_location.lat(), lng: myRouteSegment.start_location.lng() },
		{ lat: myRouteSegment.end_location.lat(), lng: myRouteSegment.end_location.lng() }];

	a = slope(myRoad);
	b = intercept(myRoad, a);
	// set marker position and map center
	mainMarker.setPosition(myRouteSegment.start_location);
	currentPos = {lat: mainMarker.getPosition().lat(), lng: mainMarker.getPosition().lng()};
	map.setCenter(myRouteSegment.start_location);
	// set map heading
	let heading = box.window.google.maps.geometry.spherical.computeHeading(
		path[0],
		path[1]
	);
	// draw full route
	map.setHeading(heading);
	console.log("Heading: " + heading)
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
}
function runMyCar(routeResult, map, box){
	if (!routeResult || !map || running) return;
	running = true;
	// used variables
	myRoute = routeResult.routes[0].legs[0];
	myRouteSegment = myRoute.steps[0];
	path = myRouteSegment.path;
	myRoad = [{ lat: myRouteSegment.start_location.lat(), lng: myRouteSegment.start_location.lng() },
			  { lat: myRouteSegment.end_location.lat(), lng: myRouteSegment.end_location.lng() }];

	a = slope(myRoad);
	b = intercept(myRoad, a);
	heading = box.window.google.maps.geometry.spherical.computeHeading(
		myRoad[0],
		myRoad[1]
	);
	map.setHeading(heading);
	mainMarker.setPosition(path[0]);
	map.setCenter(path[0])
	// RUN
	sieuphuctap = setInterval(() => {
		if (running && speedCar > 0) {
			socket.emit("updateLoc", { id: myID, loc: currentPos });
			if (i > myRoute.steps.length) {
				console.log("end of road");
				speedCar = 0;
				setSpeed(speedCar);
				rpmArrow.style.transform = `rotate(${-30}deg)`
				clearInterval(sieuphuctap);
				status.innerHTML = "STOP";
			}
			currentPos = { lat: mainMarker.getPosition().lat(), lng: mainMarker.getPosition().lng() };
			let distanceToTurn = calculateDistance(currentPos.lat,currentPos.lng,myRoad[1].lat,myRoad[1].lng).toFixed(3)
			if (distanceToTurn < 30) {
				if (!changeDirection) {
					if (myRoute.steps[i + 1]) {
						changeDirection = true;
						if (myRoute.steps[i + 1].maneuver == "turn-right") {
							blinkingArrow(1);
							direction = 1;
							controlBartext.querySelector("#cnt").textContent = 'Turning right';

						}
						else if (myRoute.steps[i + 1].maneuver == "turn-left")
						{	
							controlBartext.querySelector("#cnt").textContent = 'Turning left';

							blinkingArrow(-1);
							direction = -1
						}
						else {
							controlBartext.querySelector("#cnt").textContent = 'Go straight';

							blinkingArrow(0);
							direction = 0;
						}
					}
					else {
						blinkingArrow(0);
						direction = 0;
					}
				}
			}
			else {
				changeDirection = false;
				blinkingArrow(0);
				direction = 0;
			}
			map.setCenter(mainMarker.getPosition());
			if (heading < 120 && heading > 0 ) { //  (heading <= 0 && heading >= -90) || (heading >= 0 && heading <= 90)
				mainMarker.setPosition({ lat: currentPos.lat + step, lng: a * currentPos.lat + b });
				if (currentPos.lat > myRoad[1].lat) {
					i = i + 1;
					myRouteSegment = myRoute.steps[i];
					if (myRouteSegment) {
						path = myRouteSegment.path;
						myRoad = [{ lat: myRouteSegment.start_location.lat(), lng: myRouteSegment.start_location.lng() },
								  { lat: myRouteSegment.end_location.lat(), lng: myRouteSegment.end_location.lng() }];
						a = slope(myRoad);
						b = intercept(myRoad, a);
						heading = box.window.google.maps.geometry.spherical.computeHeading(
							myRoad[0],
							myRoad[1]
						);
						mainMarker.setPosition(myRouteSegment.start_location);
						map.setHeading(heading);
					}
				}
			}
			else if (heading > -120 && heading < 0 ) { //(heading >= -180 && heading <= -90) || (heading >= 90 && heading <= 180)
				mainMarker.setPosition({ lat: currentPos.lat + step, lng: a * currentPos.lat + b });
				if (currentPos.lat > myRoad[1].lat) {
					i = i + 1;
					myRouteSegment = myRoute.steps[i];
					if (myRouteSegment) {
						path = myRouteSegment.path;
						myRoad = [{ lat: myRouteSegment.start_location.lat(), lng: myRouteSegment.start_location.lng() },
							{ lat: myRouteSegment.end_location.lat(), lng: myRouteSegment.end_location.lng() }];
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
			else {
				mainMarker.setPosition({ lat: currentPos.lat - step, lng: a * currentPos.lat + b });
				if (currentPos.lat < myRoad[1].lat) {
					i = i + 1;
					myRouteSegment = myRoute.steps[i];
					if (myRouteSegment) {
						path = myRouteSegment.path;
						myRoad = [{ lat: myRouteSegment.start_location.lat(), lng: myRouteSegment.start_location.lng() },
							{ lat: myRouteSegment.end_location.lat(), lng: myRouteSegment.end_location.lng() }];
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
	}, 70);
}
function calculateRPM(speed){
	rpmNumber = Math.round(speed * 60 / (7.2 * Math.PI * 0.25))
	rpmArrow.style.transform = `rotate(${rpmNumber/10}deg)`
}
function setSpeed(value) {
	if (value < 0 || value > 2 || !submitted) return;
	speedCar = value * 100;
	step = speedCar / 10000000;
    const bg = speed.querySelector(".speed-container");
    const ovalline = bg.querySelector(".speed-oval-line");
    ovalline.querySelector(".speed-fill").style.transform = `rotate(${value/4}turn)`
    const speedNumber = ovalline.querySelector(".speed-counter");
    if (value >= 1.2) {
        speedNumber.querySelector(".speed-number").style = `color:red;`
        speedNumber.querySelector(".speed-number").style.textShadow = "0px 0px 10px #ff0000"; 
	}
	else {
		speedNumber.querySelector(".speed-number").style = `color: #fff;`
        speedNumber.querySelector(".speed-number").style.textShadow = "0px 0px 0px #ff0000"; 
	}
    speedNumber.querySelector(".speed-number").textContent = `${Math.round(value*100)}`
	calculateRPM(value*100);
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
			speed: speedCar*100,
		});
	}
}
setInterval(() => {
	socket.emit("updateInfo", {
		id: myID,
		loc: currentPos,
		slope: a,
		dir: direction,
		speed: speedCar*100,
	});
},100)
setInterval(() => {
	checkCollision(anotherCarInfo);
	sendWarning();
}, 100);
function checkCollision(anotherCarInfo) {
	for (let i = 0; i < anotherCarInfo.length; i++) {
		let info = anotherCarInfo[i];
		if (!info) continue;
		if (info.id === myID || info.loc == null) continue;
		let dis;
		if(currentPos)
			 dis = calculateDistance(currentPos.lat,currentPos.lng,info.loc.lat,info.loc.lng).toFixed(3);
		const angle = calculateAngle(a, info.slope).toFixed(2);
		const speed = info.speed;
		if (deltaDistanceWithID(info.id, distanceArray, anotherCarInfo)){
			if (dis < 20 && angle > 40){ // && speed > 0 && speedCar > 0
				if ((direction == 0 && info.dir == 0) ||
					(direction == 0 && info.dir == 1) || (direction == 0 && info.dir == -1) ||
					(direction == 1 && info.dir == 0) || (direction == -1 && info.dir == 0) ) {
					sendWarning(true);

				}
				else {
					sendWarning(false);

				}
			}
		}
		else {
			sendWarning(false);
		}
	}
}
function deltaDistanceWithID(id,distanceArray,anotherCarInfo) {
	let info;
	for (let i = 0; i < anotherCarInfo.length; i ++){
		if (anotherCarInfo[i].id == id){
			info = anotherCarInfo[i];
		}
	}
	for (let i = 0; i< distanceArray.length;i++){
		if (distanceArray[i].id === id) {
			let newDistance;
			if(currentPos)
				newDistance = calculateDistance(currentPos.lat,currentPos.lng,info.loc.lat,info.loc.lng)
			if (newDistance < distanceArray[i].dis){
				return true;
			}
			else return false;
		}
	}
}
function sendWarning(haveColli) {
	let meterObjStyle_1 = "-15px 15px 180px rgb(255, 0, 0)";
	let featureContainerStyle_1 = "15px 15px 180px rgb(255, 0, 0)"
	let meterObjStyle_2 = "-15px 15px 180px rgb(183, 74, 74)";
	let featureContainerStyle_2 = "15px 15px 180px rgb(183, 74, 74)";
	warningInterval = setInterval(() => {
		if (haveColli) { 
			console.log("Set box shadow");
			if (meterObject.style.boxShadow == meterObjStyle_1){
				meterObject.style.boxShadow = meterObjStyle_2;
			}
			else {
				meterObject.style.boxShadow = meterObjStyle_1;
			}
			
			if (featureContainer.style.boxShadow == featureContainerStyle_1)
			{
				featureContainer.style.boxShadow = featureContainerStyle_2;
			}
			else {
				featureContainer.style.boxShadow = featureContainerStyle_1;
			}
		}
		else {
			clearInterval(warningInterval);
			meterObject.style.boxShadow = "0px 0px 0px transparent !important";
			featureContainer.style.boxShadow = "0px 0px 0px transparent !important";
		}
	}, 300);
}
socket.on("connected", (message) => {
	myID = message;
	controlBartext.querySelector("#user-status").innerHTML = message;
});
socket.on("disconnectClient", (carID) => {
	console.log("a car has disconnect")
});
function blinkingArrow(value) {
	if (value == 0) {
		if (blinkInterval) {
			clearInterval(blinkInterval);
			blinkInterval = null;
			rightArrow.style.opacity = '1';
			rightArrow.style.filter = ""
			leftArrow.style.opacity = '1';
			leftArrow.style.filter = ""
			backLightLeft.style.display = "none";
			backLightRight.style.display = "none";

		}
	}
	else if (value == 1) {
		blinkInterval = setInterval(() => {
			rightArrow.style.opacity = (rightArrow.style.opacity == '1') ? '0.3' : '1';
			backLightRight.style.display = "block";
			backLightRight.style.opacity = (backLightRight.style.opacity == '1') ? '0.5' : '1';
		}, 300);
		rightArrow.style.filter = "hue-rotate(-60deg)";
	}
	else {
		blinkInterval = setInterval(() => {
			console.log("blinking");
			leftArrow.style.opacity = (leftArrow.style.opacity == '1') ? '0.3' : '1';
			backLightLeft.style.display = "block";
			backLightLeft.style.opacity = (backLightLeft.style.opacity == '1') ? '0.5' : '1';
		}, 300);
		leftArrow.style.filter = "hue-rotate(-60deg)";
	}
}
speed20.addEventListener("click", () => {
	if (submitted) {
		setSpeed(0.2);
	}
})
speed70.addEventListener("click", () => {
	if (submitted) {
		setSpeed(0.7);
	}
})
speed120.addEventListener("click", () => {
	if (submitted) {
		setSpeed(1.2);
	}
})
speed10.addEventListener("click", () => {
	if (submitted) {
		setSpeed(0.1);
	}
})
const plugin = ({ widgets, simulator, vehicle }) => {
	let path = [{ lat: 0, lng: 0 }, { lat: 0, lng: 0 }];
	//----- WIDGET REGISTER-----//
	widgets.register("map", (box) => {
		GoogleMapsPluginApi(PLUGINS_APIKEY, box);
		selectinputRandom.onchange = function () {
			console.log(selectinputRandom.value);
			if (selectinputRandom.value != -1) {
				path = baseRoute[selectinputRandom.value -1];
				submitted = true;
				running = false;
				stopping = false;
				status.innerHTML = "PARKING";
				a = null;
				b = null;
				speedCar = 0;
				if (mainMarker) {
					for (let i = 0; i < routeArray.length; i++){
						routeArray[i].setMap(null);
					}
					mainMarker.setMap(null);
					clearInterval(sieuphuctap);
					running = false;
				}
				setSpeed(0);
				calculateAndDisplayRoute(box, path, map)
				socket.emit("initLoc", {
					id: myID,
					loc: currentPos,
					slope: a,
					dir: direction,
					speed: speedCar,
				});
				rpmArrow.style.transform = `rotate(${-30}deg)`
				fuelArrow.style.transform = `rotate(${fuelNumber * 2}deg)`
				blinkingArrow(0);
				sendWarning();
			}
			else {
				controlBartext.querySelector("#cnt").textContent = 'Choose location again';
			}
		}
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
					controlBartext.querySelector("#cnt").textContent = "Must use lat, lng";
				}
				else {
					sendWarning();
					submitted = true;
					running = false;
					stopping = false;
					status.innerHTML = "PARKING";
					a = null;
					b = null;
					speedCar = 0;
					if (mainMarker) {
						for (let i = 0; i < routeArray.length; i++){
							routeArray[i].setMap(null);
						}
						mainMarker.setMap(null);
						clearInterval(sieuphuctap);
						running = false;
					}
					path[0].lat = fromPosSplit[0];
					path[1].lat = toPosSplit[0];
					path[0].lng = fromPosSplit[1];
					path[1].lng = toPosSplit[1];
					setSpeed(0);
					calculateAndDisplayRoute(box, path, map)
					socket.emit("initLoc", {
						id: myID,
						loc: currentPos,
						slope: a,
						dir: direction,
						speed: speedCar,
					});
					rpmArrow.style.transform = `rotate(${-30}deg)`
					fuelArrow.style.transform = `rotate(${fuelNumber * 2}deg)`
					blinkingArrow(0);
				}
			}
		});
		runCar.addEventListener("click", () => {
			if (submitted) {
				if (stopping) {
					running = true; // here still fail
				}
				else {	
					if (running) {
						setInterval(runInterval, 100);
					}
					else {
						runMyCar(routeResult, map, box);
						i = 0;
					}
				}
				status.innerHTML = "DRIVING";
				if(speedCar == 0)
					speedCar = 0.5;
				setSpeed(speedCar);
				rpmArrow.style.transform = `rotate(${rpmNumber/10}deg)`
				fuelArrow.style.transform = `rotate(${fuelNumber * 2}deg)`
				
			}
		});
		stopCar.addEventListener("click", () => {
			running = false;
			stopping = true;
			speedCar = 0;
			rpmArrow.style.transform = `rotate(${-30}deg)`
			setSpeed(0);
			status.innerHTML = "STOP";
		});
		box.injectNode(mainBoard);
	})
}
export default plugin;

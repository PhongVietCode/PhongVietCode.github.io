import StatusTable from "./reusable/StatusTable.js"
import { PLUGINS_APIKEY } from "./reusable/apikey.js";
import loadScript from "./reusable/loadScript.js";
import "./socket.io/client-dist/socket.io.js";
const API_HOST = "https://app.digitalauto.tech"
// socket.io init ----------------------
//const socket = io('http://127.0.0.1:3000');
//-------------------------
// ini var
let ggMap;
let map;
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



const biggestPlugin = document.createElement('div')
biggestPlugin.style = 'width: 10px; height: 10px; object-fit: contain;'
biggestPlugin.innerHTML = ` 
<link rel="stylesheet" type="text/css" href="http://127.0.0.1:5500/style.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">

<div class ="container">
<div class ="google-map">
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
</div>`
const GoogleMapsLocation = async (apikey, box, initialCenter, { icon = null } = {}) => {
	await loadScript(box.window, `https://maps.googleapis.com/maps/api/js?key=${apikey}`);
	let myMarker = new box.window.google.maps.Marker({
		draggable: false,
	});
    const container = biggestPlugin.querySelector(".container")
    const ggContainer = container.querySelector(".google-map")
    //ggContainer.innerHTML = ggMap; 
	map = new box.window.google.maps.Map(ggContainer, {
		zoom: 30,
		center: initialCenter,
		heading: 0,
		tilt: 90,
		mapId: "a8dea08fb82841f5",
	});
    console.log(map);

}

const plugin = ({ widgets, simulator, vehicle }) =>{
    widgets.register("biggestPlugin", (box) => {
        box.injectNode(biggestPlugin);
        GoogleMapsLocation(PLUGINS_APIKEY, box, currentPos)
    })
}
export default plugin
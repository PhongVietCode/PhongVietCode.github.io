
const doc = document.querySelector(".container");
const meter = doc.querySelector(".meter-object")
const speed = meter.querySelector(".meter-body");

function setSpeed(speed, value) {
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
}
setSpeed(speed, 0.9)

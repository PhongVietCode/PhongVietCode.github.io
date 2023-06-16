import { PLUGINS_APIKEY } from "../reusable/apikey.js";
import loadScript from "../reusable/loadScript.js";

let map;
const ggMap = document.createElement("div");

const loader = new Loader({
  apiKey: PLUGINS_APIKEY,
  version: "weekly",
});

loader.load().then(async () => {
  const { Map } = await google.maps.importLibrary("maps");
	ggMap.setAttribute("style", `display:flex; height: 100%; width: 100%;`);
  map = new Map(ggMap, {
    center: { lat: -34.397, lng: 150.644 },
    zoom: 8,
  });
});


const plugin = ({ widgets, simulator, vehicle }) => { 
    widgets.register(
      "map",
      (box) => {
        box.injectNode(ggMap);
      }
    )
}
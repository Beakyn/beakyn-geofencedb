const mapLayers = {
  state: {
    url: 'mapbox://shfishburn.bkn-geofence-state',
    sourceLayer: 'BKN_GEOFENCE_STATE',
    zoom: 3,
    label: 'State',
  },
  county: {
    url: 'mapbox://shfishburn.bkn-geofence-county',
    sourceLayer: 'BKN_GEOFENCE_COUNTY',
    zoom: 4,
    label: 'County',
  },
  'zip-code': {
    url: 'mapbox://shfishburn.bkn-geofence-zip',
    sourceLayer: 'BKN_GEOFENCE_ZIP',
    zoom: 4,
    label: 'Zip Code',
  },
  place: {
    url: 'mapbox://shfishburn.bkn-geofence-place',
    sourceLayer: 'BKN_GEOFENCE_PLACE',
    zoom: 4,
    label: 'Place',
  },
  csa: {
    url: 'mapbox://shfishburn.bkn-geofence-csa',
    sourceLayer: 'BKN_GEOFENCE_CSA',
    zoom: 5,
    label: 'CSA',
  },
  cbsa: {
    url: 'mapbox://shfishburn.bkn-geofence-cbsa',
    sourceLayer: 'BKN_GEOFENCE_CBSA',
    zoom: 5,
    label: 'CBSA',
  },
  'census-tract': {
    url: 'mapbox://shfishburn.bkn-geofence-census-tract',
    sourceLayer: 'BKN_GEOFENCE_CENSUS_TRACT',
    zoom: 5,
    label: 'Census Tract',
  },
  'census-block-group': {
    url: 'mapbox://shfishburn.bkn-geofence-block-group',
    sourceLayer: 'BKN_GEOFENCE_BLOCK_GROUP',
    zoom: 5,
    label: 'Block Group',
  },
  'census-block-group-v2': {
    url: 'mapbox://shfishburn.0wqmnz4z',
    sourceLayer: 'BKN_GEOFENCE_BLOCK_GROUP_V2-bmzxoy',
    zoom: 6,
    label: 'Block Group V2',
  },
};

let activeLayer;

// Cache select element.
const selectElm = document.querySelector('.select-css');

mapboxgl.accessToken = 'pk.eyJ1Ijoic2hmaXNoYnVybiIsImEiOiJjazJsd201ZDMwYXZlM2RwMDRpeHFvOXB6In0.2XBQLAbYp4pu3Gs7DbD1jg';

const map = new mapboxgl.Map({
  container: 'map',
  zoom: 4,
  center: [-98.579394, 39.828610],
  style: 'mapbox://styles/shfishburn/cjnm64jjh0eb22rpi2oul427g'
});

// Create a popup, but don't add it to the map yet.
const popup = new mapboxgl.Popup({
  closeButton: false,
  closeOnClick: false
});

map.on('load', () => {
  // Add sources
  for (layer in mapLayers) {
    const {url} = mapLayers[layer];
    map.addSource(layer, {type: 'vector', url});
  }

  // Load default layer.
  loadLayer(selectElm.value);

  // Track changes on select to load other layers.
  selectElm.addEventListener('change', function() {
    loadLayer(this.value);
  });
})

function loadLayer(layerName) {
  // Extract properties from `mapLayers`.
  const {url, zoom, sourceLayer} = mapLayers[layerName];

  // Remove active layer if enabled.
  if (activeLayer) map.removeLayer(activeLayer);

  // Set map zoom.
  map.flyTo({zoom});
  map.setMinZoom(zoom);

  // Add map layer.
  map.addLayer({
    id: layerName,
    type: 'fill',
    source: layerName,
    'source-layer': sourceLayer,
    paint: {
      'fill-outline-color': 'rgba(30,14,98,0.5)',
      'fill-color': 'rgba(128,7,212,0.02)',
    },
  });

  addPopupMouseEvents(layerName);

  // Set active layer to current.
  activeLayer = layerName;
}

function addPopupMouseEvents(layerName) {
  map.on('mouseenter', layerName, function(e) {
    // Change the cursor style as a UI indicator.
    map.getCanvas().style.cursor = 'pointer';

    var coordinates = e.features[0].geometry.coordinates.slice();
    var description = e.features[0].properties.geoId;

    const title = e.features[0].properties.id;
    const properties = e.features[0].properties;

    // Ensure that if the map is zoomed out such that multiple
    // copies of the feature are visible, the popup appears
    // over the copy being pointed to.
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    // Populate the popup and set its coordinates
    // based on the feature found.
    popup.setLngLat(e.lngLat)
      .setHTML(popupTemplate(title, properties))
      .addTo(map);
  });

  map.on('mouseleave', layerName, function() {
    map.getCanvas().style.cursor = '';
    popup.remove();
  });
}

const popupTemplate = (title, properties) => `
  <div class="mapbox-popup">
    <h6><strong>${title}</strong></h6>

    ${Object.keys(properties)
      .map((key) => propertyTemplate(key, properties[key]))
      .join()
      .replace(/<\/div>,*/g, '</div>')}
  </div>
`;

const propertyTemplate = (name, value) => {
  console.log(typeof value, value);

  return value
    ? `
    <div>
      <strong>${name}:</strong>
      <span>${Array.isArray(value) ? value.split(',') : value}</span>
    </div>`
    : '';
}

let platform = new H.service.Platform({
    'apikey': '0dA4g00nyBtdpbvK-02osAwZLoI_oTg2A5S2nCJdLf4'
});

let defaultLayers = platform.createDefaultLayers();

const map = new H.Map(
    document.getElementById('mapContainer'),
    defaultLayers.vector.normal.map,
    {
        zoom: 6,
        center: {
          lat: 21.158627, lng: 78.445921
        }
    });
map.getBaseLayer().getProvider().setStyle(new H.map.Style(
    'https://heremaps.github.io/maps-api-for-javascript-examples/change-style-at-load/data/dark.yaml',
    'https://js.api.here.com/v3/3.1/styles/omv/'));

const ui = H.ui.UI.createDefault(map, defaultLayers);
new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

window.addEventListener('resize', function () {
    map.getViewPort().resize();
});

loadData();

function loadData() {

    $.ajax({
        dataType: "json",
        url: "https://cors-anywhere.herokuapp.com/https://raw.githubusercontent.com/sriharikapu/covid19Marker.github.io/master/newdataset.json",
        success: function(data){
            let featureArray = data.features;
            for (let feature of featureArray) {
                let attribute = feature.attributes;

                let name = attribute.Country_Region;
                let lat = attribute.Lat;
                let lon = attribute.Long_;
                let active_cases = attribute.Active;
                let recovered = attribute.Recovered;
                let deaths = attribute.Deaths;
                let estimated_cases = attribute.Estimated;
                let lastUpdated1 = new Date(attribute.Last_Update);
                let lastUpdated = lastUpdated1.toLocaleString();

                let radius = estimated_cases / 10 + 100000;

                addCase(lat, lon, radius, name, active_cases, deaths, estimated_cases, lastUpdated);
            }
        }
    });

}

function addCase(lat, lon, radius, name, active_cases, recovered, deaths, estimated_cases, lastUpdated){

    let circle = new H.map.Circle(
        { lat: lat, lng: lon},
        radius,
        {
            style: {
                strokeColor: 'rgba(0, 0, 0, 0.6)',
                lineWidth: 2,
                fillColor: 'rgba(221, 229, 66, 0.78)'
            }
        }
    );
    map.addObject(circle);

    let open = false;
    let bubble = new H.ui.InfoBubble({lng: lon, lat: lat}, {
        content: "<b>" + name + "</b> " +
            "<p>Active Cases: <b>" + active_cases + "</b></p>" +
            "<p>Recovered: <b>" + recovered + "</b></p>" +
            "<p>Estimated: <b>" + estimated_cases + "</b></p>" +
            "<p>Deadths: <b>" + deaths + "</b></p>" +
            "<p>Last Updated: <b>" + lastUpdated + "</b></p>"
    });
    bubble.close();
    ui.addBubble(bubble);
    circle.addEventListener('tap', function(){
        if(bubble.getState() === H.ui.InfoBubble.State.OPEN){
            bubble.close();
        }else{
            for(let otherBubbles of ui.getBubbles()){
                otherBubbles.close();
            }
            bubble.open();
        }
    });
}

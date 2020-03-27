// gathers the stats from https://gisanddata.maps.arcgis.com/apps/opsdashboard/index.html#/bda7594740fd40299423467b48e9ecf6
// and adds the estimated amount of cases

const URL = "https://services9.arcgis.com/N9p5hsImWXAccRNI/arcgis/rest/services/Z7biAeD8PAkqgmWhxG2A/FeatureServer/2/query?f=json&where=Confirmed%20%3E%200&returnGeometry=false&spatialRel=esriSpatialRelIntersects&outFields=*&orderByFields=Confirmed%20desc&resultOffset=0&resultRecordCount=200&cacheHint=true";

async function handleRequest(request) {
    request = new Request(request);
    // spoof header
    request.headers.set('referer', '-');
    let response = await fetch(URL, request);

    // https://medium.com/@tomaspueyo/coronavirus-act-today-or-people-will-die-f4d3d9cd99ca
    const death_rate = 0.015;

    let json = await response.json();

    let featureArray = json.features;
    for (let feature of featureArray) {
        let attribute = feature.attributes;
        let active_cases = attribute.Active;
        let deaths = attribute.Deaths;
        let estimated = deaths == 0 ? active_cases : Math.round((deaths / death_rate) * Math.pow(2, 17.3/6.2));
        attribute.Estimated = estimated;
    }

    return new Response(JSON.stringify(json));
}
addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
})

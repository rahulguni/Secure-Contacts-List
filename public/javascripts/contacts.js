const container = document.getElementById('mapid');
if(container){
    var mymap = L.map('mapid').setView([41.080636, -74.173640], 14);

    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1Ijoicmd1bmkiLCJhIjoiY2todmt2NW9kMTZxMDJ5cm10b3U3YnlrdiJ9.q2mvDu0HUljmHbd-Shz2XQ'
    }).addTo(mymap); 
}

function flyMap(id){
    //record the id from list, id= lat + long in the list
    var lat = parseFloat(id.slice(0, 9));
    var lon = parseFloat(id.slice(10, id.length));

    var popup = id + "popup";
    
    var marker = new L.Marker([lat, lon]).addTo(mymap);
    marker.bindPopup("<b>" + document.getElementById(popup).innerHTML + "</b>").openPopup();
    mymap.flyTo([lat,lon], 15);
}

document.getElementById("sign-out-btn").onclick = function()
{
    location.href="/logout";
}


document.getElementById("create-btn").onclick = function()
{
    location.href="/mailer";
}

function deletefunc(id){
    document.getElementById("delete_id").value = id;
    console.log(document.getElementById("delete_id").value);
    document.getElementById('deleteform').submit();
}

function updatefunc(id){
    document.getElementById("update_id").value = id;
    document.getElementById('updateform').submit();
}



    
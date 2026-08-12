fetch("/api/public/firmware/latest")

.then(res=>res.json())

.then(data=>{

if(data.success){

const fw=data.firmware;

document.getElementById(
"fw-version"
).textContent =
"Version " + fw.version;

const info =
document.getElementById(
"fw-info"
);

info.replaceChildren();

info.appendChild(
document.createTextNode(
"Channel: " + fw.channel
)
);

info.appendChild(
document.createElement("br")
);

info.appendChild(
document.createTextNode(
"Hardware: " + fw.hardware_version
)
);

info.appendChild(
document.createElement("br")
);

info.appendChild(
document.createTextNode(
"Release: " +
(fw.release_notes || "Stable Release")
)
);

}

})

.catch(()=>{

document.getElementById(
"fw-info"
).innerHTML =
"Unable to load firmware";

});

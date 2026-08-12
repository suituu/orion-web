let latestFirmwareVersion = "";



/*
 * Load latest firmware
 */
fetch("/api/public/firmware/latest")


.then(res=>res.json())


.then(data=>{


if(!data.success){

return;

}



const fw = data.firmware;



latestFirmwareVersion = fw.version;



document.getElementById(
"fw-title"
).textContent =
"ORION OS " + fw.version;



document.getElementById(
"fw-channel"
).textContent =
"Channel: " + fw.channel;



document.getElementById(
"fw-hardware"
).textContent =
"Hardware: " + fw.hardware_version;



document.getElementById(
"fw-size"
).textContent =
"Size: " + fw.file_size + " KB";



document.getElementById(
"fw-date"
).textContent =
"Released: " + fw.published_at;



document.getElementById(
"fw-checksum"
).textContent =
"SHA256: " + (fw.checksum || "");





})

.catch(()=>{


document.getElementById(
"fw-title"
).textContent =
"Unable to load firmware";


});






/*
 * Load firmware history
 */

fetch("/api/public/firmware/history")


.then(res=>res.json())


.then(data=>{


if(!data.success){

return;

}



const box =
document.getElementById(
"fw-history"
);



box.replaceChildren();


data.firmwares.forEach(fw=>{


let card =
document.createElement("div");



card.className="card";



const title =
document.createElement("h2");

title.textContent =
"ORION OS " + fw.version;


const channelText =
document.createElement("p");

channelText.textContent =
"Channel: " + fw.channel;


const hardwareText =
document.createElement("p");

hardwareText.textContent =
"Hardware: " + fw.hardware_version;


const releaseNotesText =
document.createElement("p");

releaseNotesText.textContent =
fw.release_notes || "";


const releasedText =
document.createElement("p");

releasedText.textContent =
"Released: " + fw.published_at;


card.appendChild(title);

card.appendChild(channelText);

card.appendChild(hardwareText);

card.appendChild(releaseNotesText);

card.appendChild(releasedText);

box.appendChild(card);



});


})

.catch(()=>{


document.getElementById(
"fw-history"
).innerHTML =
"Unable to load history";


});







/*
 * License firmware download
 */

function downloadFirmware(){



const key =
document.getElementById(
"license-key"
).value.trim();



const result =
document.getElementById(
"download-result"
);



if(!key){


result.innerHTML =
"Please enter license key";


return;


}



if(!latestFirmwareVersion){


result.innerHTML =
"Firmware information loading";


return;


}



result.innerHTML =
"Checking license...";




fetch(

"/api/public/download/"
+
key
+
"/"
+
latestFirmwareVersion

)



.then(res=>res.json())


.then(data=>{


if(!data.success){


result.textContent =
data.message ||
"Download failed";


return;


}



result.innerHTML =
"Starting download...";



window.location.href =
data.download_url;



})


.catch(()=>{


result.innerHTML =
"Server error";


});



}

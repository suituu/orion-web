fetch("/api/public/firmware/history")

.then(res=>res.json())

.then(data=>{

if(!data.success){

return;

}

const box =
document.getElementById("fw-history");

box.replaceChildren();

data.firmwares.forEach(fw=>{

let card=document.createElement("div");

card.className="card";

let label =
fw.channel==="stable"
?
"Stable Release"
:
"Beta Preview";

const title =
document.createElement("h3");

title.textContent =
"Version " + fw.version;

const details =
document.createElement("p");

details.appendChild(
document.createTextNode(
label
)
);

details.appendChild(
document.createElement("br")
);

details.appendChild(
document.createTextNode(
"Hardware: " + fw.hardware_version
)
);

details.appendChild(
document.createElement("br")
);

details.appendChild(
document.createTextNode(
fw.release_notes || ""
)
);

details.appendChild(
document.createElement("br")
);

details.appendChild(
document.createTextNode(
fw.published_at
)
);

card.appendChild(title);

card.appendChild(details);

box.appendChild(card);

});

})

.catch(()=>{

document.getElementById(
"fw-history"
).innerHTML=

"<p>Unable to load history</p>";

});

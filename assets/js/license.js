function checkLicense(){


const key =
document.getElementById("key").value.trim();


const result =
document.getElementById("result");


if(!key){

result.innerHTML="Please enter license key";

return;

}


result.innerHTML="Checking...";



fetch("/api/public/license/"+key)


.then(res=>res.json())


.then(data=>{


if(data.success){


const l=data.license;


result.innerHTML=`


<div class="box">


<div class="key">
${l.license_key}
</div>


<div class="info">


<p>
<span class="label">
Product:
</span>

${l.product}

</p>


<p>
<span class="label">
Status:
</span>

${l.status}

</p>


<p>
<span class="label">
Activation:
</span>

${l.activated_count}/${l.activation_limit}

</p>


<p>
<span class="label">
Device:
</span>

${l.device_id || "Not Activated"}

</p>


<p>
<span class="label">
Created:
</span>

${l.created_at}

</p>


</div>


</div>


`;



}else{


result.innerHTML="License Not Found";


}


})


.catch(()=>{


result.innerHTML="Server Error";


});


}
(() => {
    const button = document.querySelector("[data-license-check]");

    if (button) {
        button.addEventListener("click", checkLicense);
    }
})();

const params =
new URLSearchParams(
window.location.search
);


const orderId =
String(
params.get("id") || ""
);

const orderIdNumber =
Number(orderId);


if(
!/^[1-9]\d*$/.test(orderId) ||
!Number.isSafeInteger(orderIdNumber)
){

document.getElementById("content").innerHTML =
"Invalid order id";

throw new Error("invalid id");

}


const guestAccessToken =
String(
sessionStorage.getItem(
"orion_guest_access_token_" + orderId
) || ""
).trim();


if(
!/^[a-f0-9]{64}$/.test(
guestAccessToken
)
){

document.getElementById("content").innerHTML =
"Unable to access order information";

throw new Error(
"missing guest access token"
);

}


const encodedOrderId =
encodeURIComponent(orderId);

const requestOptions = {

headers:{

"X-Guest-Access-Token":
guestAccessToken

}

};


Promise.all([

fetch(
"/api/orders/guest/" + encodedOrderId,
requestOptions
)
.then(res=>res.json()),


fetch(
"/api/public/license/order/" +
encodedOrderId,
requestOptions
)
.then(res=>res.json())

])


.then(result=>{


const orderData=result[0];

const licenseData=result[1];



if(
!orderData.success ||
!licenseData.success
){

throw new Error("query failed");

}



const order =
orderData.order;


const license =
licenseData.license;



document.getElementById("content").innerHTML = `


<div class="info">


<p>
<span class="label">
Product:
</span>

<span class="value">
${order.product_id==2?"ORION Pro":"ORION Standard"}
</span>

</p>


<p>

<span class="label">
Order:
</span>

<span class="value">
${order.order_no}
</span>

</p>


<p>

<span class="label">
Amount:
</span>

<span class="value">
¥${order.amount}
</span>

</p>



<p>

<span class="label">
Status:
</span>

<span class="value">
${order.status}
</span>

</p>


</div>



<div class="license">

${license.license_key}

</div>


`;



})

.catch(err=>{


document.getElementById("content").innerHTML =
"Unable to load order information";


console.log(err);


});

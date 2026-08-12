const params =
new URLSearchParams(
window.location.search
);


const product =
params.get("product");



let product_id;
let amount;
let product_name;



if(product === "pro"){

product_id = 2;
amount = 599;
product_name = "ORION Pro";

}

else{

product_id = 1;
amount = 299;
product_name = "ORION Standard";

}



fetch("/api/orders/guest",
{

method:"POST",

headers:{

"Content-Type":"application/json"

},

body:JSON.stringify({

product_id:product_id,

amount:amount

})

})


.then(res=>res.json())


.then(data=>{


if(data.success){

const orderId =
String(
data.order_id || ""
);

const orderIdNumber =
Number(orderId);

const guestAccessToken =
String(
data.guest_access_token || ""
).trim();


if(
!/^[1-9]\d*$/.test(orderId) ||
!Number.isSafeInteger(orderIdNumber) ||
!/^[a-f0-9]{64}$/.test(
guestAccessToken
)
){

throw new Error(
"invalid guest order access"
);

}


sessionStorage.setItem(
"orion_guest_access_token_" + orderId,
guestAccessToken
);


document.getElementById("content").innerHTML = `


<div class="info">


<p>
产品：
${product_name}
</p>


<p>
金额：
¥${amount}
</p>


<p>
订单号：
${data.order_no}
</p>


<p>
订单ID：
${orderId}
</p>


<p>
状态：
${data.status}
</p>


</div>


<a href="/checkout/pay/?id=${encodeURIComponent(orderId)}">

<button>
Continue Payment
</button>

</a>


`;


}

else{


document.getElementById("content").innerHTML =
"Create Order Failed";


}


})


.catch(err=>{


document.getElementById("content").innerHTML =
"Server Error";


});

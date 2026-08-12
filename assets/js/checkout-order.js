const params =
    new URLSearchParams(
        window.location.search
    );

const product =
    params.get("product");

let product_id;
let amount;
let product_name;

if (product === "pro") {
    product_id = 2;
    amount = 599;
    product_name = "ORION Pro";
} else {
    product_id = 1;
    amount = 299;
    product_name = "ORION Standard";
}

const content =
    document.getElementById("content");

fetch(
    "/api/orders/guest",
    {
        method: "POST",

        headers: {
            "Content-Type":
                "application/json"
        },

        body: JSON.stringify({
            product_id: product_id,
            amount: amount
        })
    }
)
    .then((res) => res.json())
    .then((data) => {
        if (!data.success) {
            content.textContent =
                "Create Order Failed";

            return;
        }

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

        if (
            !/^[1-9]\d*$/.test(orderId) ||
            !Number.isSafeInteger(
                orderIdNumber
            ) ||
            !/^[a-f0-9]{64}$/.test(
                guestAccessToken
            )
        ) {
            throw new Error(
                "invalid guest order access"
            );
        }

        sessionStorage.setItem(
            "orion_guest_access_token_" +
                orderId,
            guestAccessToken
        );

        const info =
            document.createElement("div");

        info.className =
            "info";

        function appendInfoRow(
            label,
            value
        ) {
            const row =
                document.createElement("p");

            row.appendChild(
                document.createTextNode(
                    label
                )
            );

            row.appendChild(
                document.createTextNode(
                    String(value)
                )
            );

            info.appendChild(
                row
            );
        }

        appendInfoRow(
            "产品：",
            product_name
        );

        appendInfoRow(
            "金额：",
            "¥" + String(amount)
        );

        appendInfoRow(
            "订单号：",
            data.order_no
        );

        appendInfoRow(
            "订单ID：",
            orderId
        );

        appendInfoRow(
            "状态：",
            data.status
        );

        const paymentLink =
            document.createElement("a");

        paymentLink.href =
            "/checkout/pay/?id=" +
            encodeURIComponent(orderId);

        const paymentButton =
            document.createElement("button");

        paymentButton.textContent =
            "Continue Payment";

        paymentLink.appendChild(
            paymentButton
        );

        content.replaceChildren(
            info,
            paymentLink
        );
    })
    .catch(() => {
        content.textContent =
            "Server Error";
    });

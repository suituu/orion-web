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

const content =
    document.getElementById("content");

if (
    !/^[1-9]\d*$/.test(orderId) ||
    !Number.isSafeInteger(orderIdNumber)
) {
    content.textContent =
        "Invalid order id";

    throw new Error(
        "invalid id"
    );
}

const guestAccessToken =
    String(
        sessionStorage.getItem(
            "orion_guest_access_token_" + orderId
        ) || ""
    ).trim();

if (
    !/^[a-f0-9]{64}$/.test(
        guestAccessToken
    )
) {
    content.textContent =
        "Unable to access order information";

    throw new Error(
        "missing guest access token"
    );
}

const encodedOrderId =
    encodeURIComponent(orderId);

const requestOptions = {
    headers: {
        "X-Guest-Access-Token":
            guestAccessToken
    }
};

Promise.all([
    fetch(
        "/api/orders/guest/" +
        encodedOrderId,
        requestOptions
    )
        .then((res) => res.json()),

    fetch(
        "/api/public/license/order/" +
        encodedOrderId,
        requestOptions
    )
        .then((res) => res.json())
])
    .then((result) => {
        const orderData =
            result[0];

        const licenseData =
            result[1];

        if (
            !orderData.success ||
            !licenseData.success ||
            !orderData.order ||
            !licenseData.license
        ) {
            throw new Error(
                "query failed"
            );
        }

        const order =
            orderData.order;

        const license =
            licenseData.license;

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

            const labelElement =
                document.createElement("span");

            labelElement.className =
                "label";

            labelElement.textContent =
                label + ":";

            const valueElement =
                document.createElement("span");

            valueElement.className =
                "value";

            valueElement.textContent =
                value === null ||
                value === undefined ||
                value === ""
                    ? "Unknown"
                    : String(value);

            row.appendChild(
                labelElement
            );

            row.appendChild(
                document.createTextNode(" ")
            );

            row.appendChild(
                valueElement
            );

            info.appendChild(
                row
            );
        }

        const productName =
            order.product_id == 2
                ? "ORION Pro"
                : "ORION Standard";

        appendInfoRow(
            "Product",
            productName
        );

        appendInfoRow(
            "Order",
            order.order_no
        );

        appendInfoRow(
            "Amount",
            order.amount === null ||
            order.amount === undefined ||
            order.amount === ""
                ? "Unknown"
                : "¥" + String(order.amount)
        );

        appendInfoRow(
            "Status",
            order.status
        );

        const licenseElement =
            document.createElement("div");

        licenseElement.className =
            "license";

        licenseElement.textContent =
            license.license_key === null ||
            license.license_key === undefined ||
            license.license_key === ""
                ? "License unavailable"
                : String(
                    license.license_key
                );

        content.replaceChildren(
            info,
            licenseElement
        );
    })
    .catch(() => {
        content.textContent =
            "Unable to load order information";
    });

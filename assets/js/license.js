function checkLicense() {
    const key =
        document.getElementById("key").value.trim();

    const result =
        document.getElementById("result");

    if (!key) {
        result.textContent =
            "Please enter license key";

        return;
    }

    result.textContent =
        "Checking...";

    fetch(
        "/api/public/license/" +
        encodeURIComponent(key)
    )
        .then((res) => res.json())
        .then((data) => {
            if (
                !data.success ||
                !data.license
            ) {
                result.textContent =
                    "License Not Found";

                return;
            }

            const license =
                data.license;

            const box =
                document.createElement("div");

            box.className =
                "box";

            const keyElement =
                document.createElement("div");

            keyElement.className =
                "key";

            keyElement.textContent =
                key;

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

                const valueText =
                    value === null ||
                    value === undefined ||
                    value === ""
                        ? "Unknown"
                        : String(value);

                row.appendChild(
                    labelElement
                );

                row.appendChild(
                    document.createTextNode(
                        " " + valueText
                    )
                );

                info.appendChild(
                    row
                );
            }

            appendInfoRow(
                "Product",
                license.product
            );

            appendInfoRow(
                "Status",
                license.status
            );

            box.appendChild(
                keyElement
            );

            box.appendChild(
                info
            );

            result.replaceChildren(
                box
            );
        })
        .catch(() => {
            result.textContent =
                "Server Error";
        });
}
(() => {
    const button = document.querySelector("[data-license-check]");

    if (button) {
        button.addEventListener("click", checkLicense);
    }
})();

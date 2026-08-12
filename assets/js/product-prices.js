(() => {
    const PRICE_SELECTOR =
        "[data-product-price]";

    const PRICE_UNAVAILABLE_TEXT =
        "价格暂不可用";

    function formatPrice(value) {
        const amount =
            Number(value);

        if (
            !Number.isFinite(amount) ||
            amount < 0
        ) {
            return null;
        }

        return (
            "¥" +
            amount.toLocaleString(
                "zh-CN",
                {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2
                }
            )
        );
    }

    function setUnavailablePrices(
        elements
    ) {
        elements.forEach(
            (element) => {
                element.textContent =
                    PRICE_UNAVAILABLE_TEXT;
            }
        );
    }

    function applyProductPrices(
        products,
        elements
    ) {
        const prices =
            new Map();

        products.forEach(
            (product) => {
                const productId =
                    Number(
                        product.id
                    );

                const price =
                    formatPrice(
                        product.price
                    );

                if (
                    !Number.isSafeInteger(
                        productId
                    ) ||
                    productId <= 0 ||
                    price === null
                ) {
                    return;
                }

                prices.set(
                    String(productId),
                    price
                );
            }
        );

        elements.forEach(
            (element) => {
                const productId =
                    String(
                        element.dataset
                            .productPrice ||
                        ""
                    ).trim();

                const price =
                    prices.get(
                        productId
                    );

                element.textContent =
                    price ||
                    PRICE_UNAVAILABLE_TEXT;
            }
        );
    }

    const priceElements =
        Array.from(
            document.querySelectorAll(
                PRICE_SELECTOR
            )
        );

    if (priceElements.length === 0) {
        return;
    }

    fetch("/api/products")
        .then((response) => {
            if (!response.ok) {
                throw new Error(
                    "product price request failed"
                );
            }

            return response.json();
        })
        .then((products) => {
            if (!Array.isArray(products)) {
                throw new Error(
                    "invalid product price response"
                );
            }

            applyProductPrices(
                products,
                priceElements
            );
        })
        .catch(() => {
            setUnavailablePrices(
                priceElements
            );
        });
})();

const TOKEN_KEY = "orion_token";

const loadingPanel =
    document.getElementById("loadingPanel");

const errorPanel =
    document.getElementById("errorPanel");

const errorMessage =
    document.getElementById("errorMessage");

const errorAction =
    document.getElementById("errorAction");

const orderContent =
    document.getElementById("orderContent");

function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
}

async function requestApi(path) {
    const token = getToken();

    const response = await fetch(path, {
        headers: token
            ? {
                Authorization: `Bearer ${token}`
            }
            : {}
    });

    let data;

    try {
        data = await response.json();
    } catch (error) {
        throw new Error("服务器返回了无效数据");
    }

    if (response.status === 401) {
        clearToken();
        throw new Error("登录已失效，请重新登录");
    }

    if (!response.ok || data.success === false) {
        throw new Error(
            data.message ||
            data.error ||
            "请求失败"
        );
    }

    return data;
}

function formatDate(value) {
    if (!value) {
        return "—";
    }

    const text = String(value);

    const normalized = text.includes("T")
        ? text
        : text.replace(" ", "T") + "Z";

    const date = new Date(normalized);

    if (Number.isNaN(date.getTime())) {
        return text;
    }

    return new Intl.DateTimeFormat("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
    }).format(date);
}

function formatMoney(value, currency = "CNY") {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "—";
    }

    const amount = Number(value);

    if (!Number.isFinite(amount)) {
        return String(value);
    }

    try {
        return new Intl.NumberFormat("zh-CN", {
            style: "currency",
            currency: String(currency || "CNY")
        }).format(amount);
    } catch (error) {
        return `¥${amount.toFixed(2)}`;
    }
}

function createStatus(status) {
    const element = document.createElement("span");
    const normalized =
        String(status || "unknown").toLowerCase();

    element.className = "status";

    if (
        ["active", "online", "paid"].includes(normalized)
    ) {
        element.classList.add(`status-${normalized}`);
    } else if (
        [
            "unused",
            "inactive",
            "created",
            "pending"
        ].includes(normalized)
    ) {
        element.classList.add(`status-${normalized}`);
    } else if (
        [
            "revoked",
            "offline",
            "failed",
            "cancelled",
            "canceled",
            "refunded"
        ].includes(normalized)
    ) {
        element.classList.add(`status-${normalized}`);
    } else {
        element.classList.add("status-default");
    }

    element.textContent = status || "unknown";

    return element;
}

function appendDetail(container, label, value, className = "") {
    const labelElement = document.createElement("div");
    labelElement.className = "detail-label";
    labelElement.textContent = label;

    const valueElement = document.createElement("div");
    valueElement.className =
        `detail-value ${className}`.trim();

    valueElement.textContent =
        value === null ||
        value === undefined ||
        value === ""
            ? "—"
            : String(value);

    container.append(labelElement, valueElement);
}

function maskLicenseKey(value) {
    const key = String(value || "");

    if (!key) {
        return "—";
    }

    const parts = key.split("-");

    if (parts.length >= 4) {
        return parts
            .map((part, index) => {
                if (
                    index >= 2 &&
                    index < parts.length - 1
                ) {
                    return "•".repeat(
                        Math.max(part.length, 4)
                    );
                }

                return part;
            })
            .join("-");
    }

    if (key.length <= 8) {
        return "•".repeat(key.length);
    }

    return (
        key.slice(0, 4) +
        "•".repeat(Math.max(key.length - 8, 4)) +
        key.slice(-4)
    );
}

function copyText(value) {
    if (
        navigator.clipboard &&
        window.isSecureContext
    ) {
        return navigator.clipboard.writeText(value);
    }

    const textArea = document.createElement("textarea");

    textArea.value = value;
    textArea.setAttribute("readonly", "");
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";

    document.body.appendChild(textArea);
    textArea.select();

    const copied =
        document.execCommand("copy");

    textArea.remove();

    if (!copied) {
        return Promise.reject(
            new Error("Copy failed")
        );
    }

    return Promise.resolve();
}

function appendLicenseKeyDetail(container, value) {
    const labelElement = document.createElement("div");
    labelElement.className = "detail-label";
    labelElement.textContent = "License Key";

    const valueElement = document.createElement("div");
    valueElement.className =
        "detail-value license-key-control";

    const fullKey =
        value === null ||
        value === undefined ||
        value === ""
            ? ""
            : String(value);

    if (!fullKey) {
        valueElement.textContent = "—";
        container.append(labelElement, valueElement);
        return;
    }

    const maskedKey = maskLicenseKey(fullKey);

    const keyText = document.createElement("span");
    keyText.className =
        "license-key license-key-text";
    keyText.textContent = maskedKey;

    const actions = document.createElement("span");
    actions.className = "license-key-actions";

    const toggleButton =
        document.createElement("button");

    toggleButton.type = "button";
    toggleButton.className = "license-key-button";
    toggleButton.textContent = "显示";
    toggleButton.setAttribute(
        "aria-pressed",
        "false"
    );

    let revealed = false;

    toggleButton.addEventListener("click", () => {
        revealed = !revealed;

        keyText.textContent = revealed
            ? fullKey
            : maskedKey;

        toggleButton.textContent = revealed
            ? "隐藏"
            : "显示";

        toggleButton.setAttribute(
            "aria-pressed",
            String(revealed)
        );
    });

    const copyButton =
        document.createElement("button");

    copyButton.type = "button";
    copyButton.className = "license-key-button";
    copyButton.textContent = "复制";

    copyButton.addEventListener(
        "click",
        async () => {
            copyButton.disabled = true;

            try {
                await copyText(fullKey);
                copyButton.textContent = "已复制";
            } catch (error) {
                copyButton.textContent = "复制失败";
            }

            window.setTimeout(() => {
                copyButton.textContent = "复制";
                copyButton.disabled = false;
            }, 1500);
        }
    );

    actions.append(toggleButton, copyButton);
    valueElement.append(keyText, actions);
    container.append(labelElement, valueElement);
}

function renderOrder(data) {
    const order = data.order;
    const payment = data.payment;
    const licenses = Array.isArray(data.licenses)
        ? data.licenses
        : [];

    document.title =
        `${order.order_no || "订单详情"} - ORION`;

    document.getElementById("pageTitle").textContent =
        order.product || "订单详情";

    document.getElementById("pageSubtitle").textContent =
        order.order_no
            ? `订单号：${order.order_no}`
            : "ORION 订单详情";

    const orderStatus =
        document.getElementById("orderStatus");

    orderStatus.replaceChildren(
        createStatus(order.status)
    );

    const orderDetails =
        document.getElementById("orderDetails");

    orderDetails.replaceChildren();

    appendDetail(
        orderDetails,
        "订单号",
        order.order_no
    );

    appendDetail(
        orderDetails,
        "产品",
        order.product ||
        `产品 #${order.product_id || "—"}`
    );

    appendDetail(
        orderDetails,
        "订单金额",
        formatMoney(order.amount)
    );

    appendDetail(
        orderDetails,
        "订单状态",
        order.status
    );

    appendDetail(
        orderDetails,
        "创建时间",
        formatDate(order.created_at)
    );

    renderPayment(payment);
    renderLicenses(licenses);
}

function renderPayment(payment) {
    const container =
        document.getElementById("paymentContent");

    container.replaceChildren();

    if (!payment) {
        const empty = document.createElement("div");
        empty.className = "empty-state";
        empty.textContent = "当前订单暂无支付记录";
        container.appendChild(empty);
        return;
    }

    const panel = document.createElement("div");
    panel.className = "panel detail-panel";

    const details = document.createElement("div");
    details.className = "details";

    appendDetail(
        details,
        "支付单号",
        payment.payment_no
    );

    appendDetail(
        details,
        "支付渠道",
        payment.provider
    );

    appendDetail(
        details,
        "支付金额",
        formatMoney(
            payment.amount,
            payment.currency
        )
    );

    appendDetail(
        details,
        "支付状态",
        payment.status
    );

    appendDetail(
        details,
        "交易号",
        payment.transaction_id
    );

    appendDetail(
        details,
        "支付时间",
        formatDate(payment.paid_at)
    );

    appendDetail(
        details,
        "失败时间",
        formatDate(payment.failed_at)
    );

    appendDetail(
        details,
        "失败原因",
        payment.failure_reason
    );

    appendDetail(
        details,
        "创建时间",
        formatDate(payment.created_at)
    );

    panel.appendChild(details);
    container.appendChild(panel);
}

function renderLicenses(licenses) {
    const list =
        document.getElementById("licenseList");

    list.replaceChildren();

    document.getElementById("licenseCount").textContent =
        `共 ${licenses.length} 个`;

    if (licenses.length === 0) {
        const empty = document.createElement("div");
        empty.className = "empty-state";
        empty.textContent = "当前订单暂无 License";
        list.appendChild(empty);
        return;
    }

    for (const license of licenses) {
        const card = document.createElement("article");
        card.className = "panel item-card";

        const titleRow =
            document.createElement("div");

        titleRow.className = "item-title-row";

        const title =
            document.createElement("h3");

        title.className = "item-title";
        title.textContent =
            `License #${license.id || "—"}`;

        titleRow.append(
            title,
            createStatus(license.status)
        );

        const details =
            document.createElement("div");

        details.className = "details";

        appendLicenseKeyDetail(
            details,
            license.license_key
        );

        appendDetail(
            details,
            "设备编号",
            license.device_id
        );

        appendDetail(
            details,
            "激活次数",
            `${license.activated_count ?? 0} / ` +
            `${license.activation_limit ?? 1}`
        );

        appendDetail(
            details,
            "激活时间",
            formatDate(license.activated_at)
        );

        appendDetail(
            details,
            "到期时间",
            formatDate(license.expires_at)
        );

        appendDetail(
            details,
            "撤销时间",
            formatDate(license.revoked_at)
        );

        appendDetail(
            details,
            "创建时间",
            formatDate(license.created_at)
        );

        card.append(titleRow, details);
        list.appendChild(card);
    }
}

function showError(message, loginRequired = false) {
    loadingPanel.hidden = true;
    orderContent.hidden = true;
    errorPanel.hidden = false;
    errorMessage.textContent = message;

    if (loginRequired) {
        errorAction.textContent = "重新登录";
        errorAction.href = "/account/";
    } else {
        errorAction.textContent = "返回用户中心";
        errorAction.href = "/account/";
    }
}

async function loadOrder() {
    const token = getToken();

    if (!token) {
        showError(
            "请先登录账户，再查看订单详情。",
            true
        );
        return;
    }

    const params =
        new URLSearchParams(window.location.search);

    const orderIdText =
        String(params.get("id") || "");

    const orderId = Number(orderIdText);

    if (
        !/^[1-9]\d*$/.test(orderIdText) ||
        !Number.isSafeInteger(orderId)
    ) {
        showError("订单编号无效。");
        return;
    }

    try {
        const data = await requestApi(
            `/api/orders/${orderId}`
        );

        renderOrder(data);

        loadingPanel.hidden = true;
        errorPanel.hidden = true;
        orderContent.hidden = false;
    } catch (error) {
        showError(
            error.message ||
            "订单信息加载失败。",
            String(error.message).includes("登录")
        );
    }
}

loadOrder();

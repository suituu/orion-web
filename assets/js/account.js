const TOKEN_KEY = "orion_token";

const loginPanel = document.getElementById("loginPanel");
const loadingPanel = document.getElementById("loadingPanel");
const dashboard = document.getElementById("dashboard");
const logoutButton = document.getElementById("logoutButton");
const loginForm = document.getElementById("loginForm");
const loginButton = document.getElementById("loginButton");
const loginMessage = document.getElementById("loginMessage");
const passwordForm =
    document.getElementById("passwordForm");

const passwordButton =
    document.getElementById("passwordButton");

const passwordMessage =
    document.getElementById("passwordMessage");

function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

function saveToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
}

function showLogin(message = "") {
    loginPanel.hidden = false;
    loadingPanel.hidden = true;
    dashboard.style.display = "none";
    logoutButton.hidden = true;
    loginMessage.textContent = message;
}

function showLoading() {
    loginPanel.hidden = true;
    loadingPanel.hidden = false;
    dashboard.style.display = "none";
    logoutButton.hidden = true;
}

function showDashboard() {
    loginPanel.hidden = true;
    loadingPanel.hidden = true;
    dashboard.style.display = "block";
    logoutButton.hidden = false;
}

async function requestApi(path, options = {}) {
    const headers = {
        ...(options.headers || {})
    };

    const token = getToken();

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(path, {
        ...options,
        headers
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

    const normalized = value.includes("T")
        ? value
        : value.replace(" ", "T") + "Z";

    const date = new Date(normalized);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
    }).format(date);
}

function formatMoney(value) {
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

    return new Intl.NumberFormat("zh-CN", {
        style: "currency",
        currency: "CNY"
    }).format(amount);
}

function createStatus(status) {
    const element = document.createElement("span");
    const normalized = String(status || "unknown").toLowerCase();

    element.className = "status";

    if (["active", "online", "paid"].includes(normalized)) {
        element.classList.add(`status-${normalized}`);
    } else if (["unused", "inactive", "created", "pending"].includes(normalized)) {
        element.classList.add(`status-${normalized}`);
    } else if (["revoked", "offline", "failed", "cancelled", "canceled", "refunded"].includes(normalized)) {
        element.classList.add(`status-${normalized}`);
    } else {
        element.classList.add("status-default");
    }

    element.textContent = status || "unknown";

    return element;
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

    const copied = document.execCommand("copy");

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

    const toggleButton = document.createElement("button");
    toggleButton.type = "button";
    toggleButton.className = "license-key-button";
    toggleButton.textContent = "显示";
    toggleButton.setAttribute("aria-pressed", "false");

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

    const copyButton = document.createElement("button");
    copyButton.type = "button";
    copyButton.className = "license-key-button";
    copyButton.textContent = "复制";

    copyButton.addEventListener("click", async () => {
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
    });

    actions.append(toggleButton, copyButton);
    valueElement.append(keyText, actions);
    container.append(labelElement, valueElement);
}

function appendDetail(container, label, value, className = "") {
    const labelElement = document.createElement("div");
    labelElement.className = "detail-label";
    labelElement.textContent = label;

    const valueElement = document.createElement("div");
    valueElement.className = `detail-value ${className}`.trim();
    valueElement.textContent =
        value === null ||
        value === undefined ||
        value === ""
            ? "—"
            : String(value);

    container.append(labelElement, valueElement);
}

function renderProfile(profile) {
    document.getElementById("profileName").textContent =
        profile.username || "ORION 用户";

    document.getElementById("profileEmail").textContent =
        profile.email || "未设置邮箱";

    document.getElementById("profileCreated").textContent =
        `注册时间：${formatDate(profile.created_at)}`;

    document.getElementById("orderCount").textContent =
        profile.orders ?? 0;

    document.getElementById("paymentCount").textContent =
        profile.payments ?? 0;

    document.getElementById("licenseCount").textContent =
        profile.licenses ?? 0;

    document.getElementById("deviceCount").textContent =
        profile.devices ?? 0;
}

function renderOrders(orders) {
    const list = document.getElementById("orderList");

    list.replaceChildren();

    document.getElementById("orderSectionCount").textContent =
        `共 ${orders.length} 个`;

    if (orders.length === 0) {
        const empty = document.createElement("div");
        empty.className = "empty-state";
        empty.textContent = "当前账户暂无订单";
        list.appendChild(empty);
        return;
    }

    for (const order of orders) {
        const card = document.createElement("a");
        card.className = "panel item-card order-card";
        card.href =
            `/account/order/?id=${encodeURIComponent(order.id)}`;

        card.setAttribute(
            "aria-label",
            `查看订单 ${order.order_no || order.id}`
        );
        const titleRow = document.createElement("div");
        titleRow.className = "item-title-row";

        const title = document.createElement("h3");
        title.className = "item-title";
        title.textContent =
            order.product ||
            `产品 #${order.product_id || "—"}`;

        titleRow.append(
            title,
            createStatus(order.status)
        );

        const details = document.createElement("div");
        details.className = "details";

        appendDetail(details, "订单号", order.order_no);
        appendDetail(details, "金额", formatMoney(order.amount));
        appendDetail(details, "创建时间", formatDate(order.created_at));
        const action = document.createElement("div");
        action.className = "order-card-action";
        action.textContent = "查看详情 →";

        card.append(titleRow, details, action);
        list.appendChild(card);
    }
}

function renderLicenses(licenses) {
    const list = document.getElementById("licenseList");

    list.replaceChildren();

    document.getElementById("licenseSectionCount").textContent =
        `共 ${licenses.length} 个`;

    if (licenses.length === 0) {
        const empty = document.createElement("div");
        empty.className = "empty-state";
        empty.textContent = "当前账户暂无 License";
        list.appendChild(empty);
        return;
    }

    for (const license of licenses) {
        const card = document.createElement("article");
        card.className = "panel item-card";

        const titleRow = document.createElement("div");
        titleRow.className = "item-title-row";

        const title = document.createElement("h3");
        title.className = "item-title";
        title.textContent = license.product || "ORION License";

        titleRow.append(title, createStatus(license.status));

        const details = document.createElement("div");
        details.className = "details";

        appendLicenseKeyDetail(
            details,
            license.license_key
        );
        appendDetail(details, "设备编号", license.device_id);
        appendDetail(details, "激活次数", license.activated_count ?? 0);
        appendDetail(details, "激活时间", formatDate(license.activated_at));
        appendDetail(details, "到期时间", formatDate(license.expires_at));
        appendDetail(details, "创建时间", formatDate(license.created_at));

        card.append(titleRow, details);
        list.appendChild(card);
    }
}

function renderDevices(devices) {
    const list = document.getElementById("deviceList");

    list.replaceChildren();

    document.getElementById("deviceSectionCount").textContent =
        `共 ${devices.length} 台`;

    if (devices.length === 0) {
        const empty = document.createElement("div");
        empty.className = "empty-state";
        empty.textContent = "当前账户暂无已绑定设备";
        list.appendChild(empty);
        return;
    }

    for (const device of devices) {
        const card = document.createElement("article");
        card.className = "panel item-card";

        const titleRow = document.createElement("div");
        titleRow.className = "item-title-row";

        const title = document.createElement("h3");
        title.className = "item-title";
        title.textContent = device.device_id || "ORION Device";

        titleRow.append(title, createStatus(device.status));

        const details = document.createElement("div");
        details.className = "details";

        appendDetail(details, "设备型号", device.model);
        appendDetail(details, "授权产品", device.product);
        appendDetail(details, "固件版本", device.firmware_version);
        appendDetail(details, "硬件版本", device.hardware_version);
        appendDetail(details, "序列号", device.serial_number);
        appendDetail(details, "MAC 地址", device.mac_address);
        appendDetail(details, "License 状态", device.license_status);
        appendDetail(details, "最后在线", formatDate(device.last_seen));

        card.append(titleRow, details);
        list.appendChild(card);
    }
}

async function loadAccount() {
    if (!getToken()) {
        showLogin();
        return;
    }

    showLoading();

    try {
        const [
            profileResponse,
            ordersResponse,
            licensesResponse,
            devicesResponse
        ] = await Promise.all([
            requestApi("/api/account/profile"),
            requestApi("/api/orders/me"),
            requestApi("/api/account/licenses"),
            requestApi("/api/account/devices")
        ]);

        renderProfile(profileResponse.data);
        renderOrders(ordersResponse.orders || []);
        renderLicenses(licensesResponse.data || []);
        renderDevices(devicesResponse.data || []);

        showDashboard();
    } catch (error) {
        showLogin(error.message);
    }
}

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    loginMessage.textContent = "";
    loginMessage.classList.remove("message-success");
    loginButton.disabled = true;
    loginButton.textContent = "正在登录……";

    const username = document
        .getElementById("username")
        .value
        .trim();

    const password = document
        .getElementById("password")
        .value;

    try {
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                password
            })
        });

        const data = await response.json();

        if (!response.ok || !data.success || !data.token) {
            throw new Error(
                data.error ||
                data.message ||
                "用户名或密码错误"
            );
        }

        saveToken(data.token);
        loginForm.reset();

        await loadAccount();
    } catch (error) {
        loginMessage.textContent = error.message;
    } finally {
        loginButton.disabled = false;
        loginButton.textContent = "登录";
    }
});

passwordForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    passwordMessage.textContent = "";
    passwordMessage.classList.remove("message-success");

    const currentPassword = document
        .getElementById("currentPassword")
        .value;

    const newPassword = document
        .getElementById("newPassword")
        .value;

    const confirmPassword = document
        .getElementById("confirmPassword")
        .value;

    if (!currentPassword) {
        passwordMessage.textContent = "请输入当前密码";
        return;
    }

    if (
        newPassword.length < 8 ||
        newPassword.length > 128
    ) {
        passwordMessage.textContent =
            "新密码长度必须为 8–128 位";
        return;
    }

    if (currentPassword === newPassword) {
        passwordMessage.textContent =
            "新密码不能与当前密码相同";
        return;
    }

    if (newPassword !== confirmPassword) {
        passwordMessage.textContent =
            "两次输入的新密码不一致";
        return;
    }

    passwordButton.disabled = true;
    passwordButton.textContent = "正在修改……";

    try {
        await requestApi("/api/account/password", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                current_password: currentPassword,
                new_password: newPassword
            })
        });

        passwordForm.reset();
        clearToken();
        loginForm.reset();

        showLogin(
            "密码修改成功，请使用新密码重新登录"
        );

        loginMessage.classList.add(
            "message-success"
        );
    } catch (error) {
        if (
            error.message ===
            "Current password is incorrect"
        ) {
            passwordMessage.textContent =
                "当前密码错误";
        } else {
            passwordMessage.textContent =
                error.message;
        }
    } finally {
        passwordButton.disabled = false;
        passwordButton.textContent = "修改密码";
    }
});

logoutButton.addEventListener("click", () => {
    clearToken();
    loginForm.reset();
    passwordForm.reset();
    passwordMessage.textContent = "";
    loginMessage.classList.remove("message-success");
    showLogin("已退出登录");
});

loadAccount();

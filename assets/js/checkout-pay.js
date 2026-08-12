const params =
    new URLSearchParams(
        window.location.search
    );

const orderId =
    params.get("id");

const content =
    document.getElementById("content");

if (
    !orderId ||
    !/^[1-9]\d*$/.test(orderId)
) {
    content.textContent =
        "订单编号无效";
} else {
    const orderUrl =
        "/account/order/?id=" +
        encodeURIComponent(orderId);

    content.innerHTML = `
        <div class="info">
            <p>
                <strong>订单编号：</strong>
                ${orderId}
            </p>

            <p>
                <strong>支付状态：</strong>
                支付通道正在接入
            </p>

            <p>
                当前暂不可在线付款，请稍后再试。
            </p>
        </div>

        <p>
            <a href="${orderUrl}">
                查看订单
            </a>
        </p>

        <p>
            <a href="/account/">
                返回用户中心
            </a>
        </p>
    `;
}

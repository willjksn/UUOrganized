import { listOrders } from "@/lib/purchases";
import { formatPrice } from "@/lib/price";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const orders = await listOrders();

  return (
    <section className="section admin-main">
      <div className="wrap stack">
        <div className="admin-head">
          <div>
            <p className="eyebrow">Sales</p>
            <h1>Orders</h1>
            <p className="fine">Each card payment on the site. The same note is emailed to you.</p>
          </div>
        </div>
        {orders.length ? (
          <div className="order-list">
            {orders.map((order) => (
              <article className="order-card" key={order.sessionId}>
                <div>
                  <h2>{order.product}</h2>
                  <p className="fine">
                    {new Date(order.createdAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                  <p>
                    {order.name || "Buyer"}
                    {order.email ? ` · ${order.email}` : ""}
                  </p>
                  <p className="fine">
                    {formatPrice(order.amountCents)} item
                    {order.ships ? ` · ${formatPrice(order.shippingCents)} shipping` : " · Download"}
                    {order.stockAfter == null ? "" : ` · ${order.stockAfter} left`}
                  </p>
                  {order.address ? <p className="order-address">{order.address}</p> : null}
                </div>
                <p className="order-total">{formatPrice(order.totalCents)}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="panel empty-note">No sales yet. When someone pays on the site, the order shows up here.</p>
        )}
      </div>
    </section>
  );
}

export function PromoBar({ message, code }: { message: string; code: string }) {
  if (!message) return null;

  return (
    <div className="promo">
      <p>
        {message}
        {code ? (
          <>
            {" "}
            <strong>{code}</strong>
          </>
        ) : null}
      </p>
    </div>
  );
}

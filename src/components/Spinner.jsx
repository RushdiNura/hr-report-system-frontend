import "../styles/spinner.css";

/**
 * size <= 28 renders a small inline spinner suitable for buttons.
 * size undefined (or > 28) renders a full loading view with label text,
 * for whole-page/section loading states.
 */
export default function Spinner({ size, label = "Loading..." }) {
  const isInline = typeof size === "number" && size <= 28;

  if (isInline) {
    return (
      <span
        className="seal-spinner seal-spinner-inline"
        style={{ width: size, height: size }}
        role="status"
        aria-label={label}
      />
    );
  }

  return (
    <div className="seal-spinner-container" role="status" aria-label={label}>
      <span
        className="seal-spinner"
        style={{ width: size || 48, height: size || 48 }}
      />
      <p className="loading-text">{label}</p>
    </div>
  );
}

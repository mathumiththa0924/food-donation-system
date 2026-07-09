import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useSearchParams, useNavigate } from "react-router-dom";
import { createMoneyDonation } from "../api/moneyDonation";
import toast from "react-hot-toast";
import FloatingFood from "../components/FloatingFood";

function formatCardNumber(value) {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

function formatExpiry(value) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function formatCvc(value) {
  return value.replace(/\D/g, "").slice(0, 3);
}

function generateTransactionId() {
  return "12345678";
}

function maskCardNumber(cardNumber) {
  const digits = cardNumber.replace(/\D/g, "");
  if (digits.length < 4) return "****";
  return `**** **** **** ${digits.slice(-4)}`;
}

function DetailRow({ label, value, bold = false }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #eef2f7" }}>
      <span style={{ color: "#64748b", fontSize: 14 }}>{label}</span>
      <span style={{ color: "#0f172a", fontSize: 14, fontWeight: bold ? 700 : 600, textAlign: "right", maxWidth: "60%" }}>{value}</span>
    </div>
  );
}

function ConfirmationModal({ open, details, onDone }) {
  if (!open) return null;

  return createPortal(
    <div style={{
      position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.55)",
      backdropFilter: "blur(4px)", display: "flex", alignItems: "center",
      justifyContent: "center", zIndex: 999999, padding: 20
    }}>
      <div style={{
        background: "#fff", borderRadius: 16, width: "100%", maxWidth: 420,
        padding: "36px 32px 28px", boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
        textAlign: "center", animation: "fadeIn 0.25s ease"
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: "50%", background: "#22c55e",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px", fontSize: 32, color: "white", fontWeight: 700
        }}>✓</div>
        <h2 style={{ margin: "0 0 24px", color: "#0f172a", fontSize: 24, fontWeight: 800 }}>Payment Confirmed!</h2>

        <div style={{ textAlign: "left", marginBottom: 28 }}>
          <DetailRow label="Donation for:" value={details.purpose} />
          <DetailRow label="Payment type:" value="Visa / Mastercard" />
          <DetailRow label="Amount:" value={`LKR ${Number(details.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} bold />
          <DetailRow label="Date:" value={details.date} />
          <DetailRow label="Transaction ID:" value={details.transactionId} />
        </div>

        <button
          onClick={onDone}
          style={{
            width: "100%", background: "#334155", color: "white", border: "none",
            padding: "14px 20px", borderRadius: 10, fontSize: 15, fontWeight: 700,
            cursor: "pointer", letterSpacing: "0.5px"
          }}
        >
          DONE
        </button>
      </div>
    </div>,
    document.body
  );
}

function ReceiptModal({ open, details, onPrint, onClose }) {
  const receiptRef = useRef(null);

  if (!open) return null;

  const handlePrint = () => {
    const content = receiptRef.current;
    if (!content) return;
    const win = window.open("", "_blank");
    win.document.write(`
      <html><head><title>Donation Receipt</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; color: #111; }
        h1 { color: #16a34a; margin-bottom: 8px; }
        .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .label { color: #666; }
        .value { font-weight: 600; }
        .amount { font-size: 20px; font-weight: 800; }
      </style></head><body>
      ${content.innerHTML}
      </body></html>
    `);
    win.document.close();
    win.print();
    onPrint?.();
  };

  return createPortal(
    <div style={{
      position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.55)",
      backdropFilter: "blur(4px)", display: "flex", alignItems: "center",
      justifyContent: "center", zIndex: 999999, padding: 20
    }}>
      <div style={{
        background: "#fff", borderRadius: 16, width: "100%", maxWidth: 480,
        padding: "32px 28px 24px", boxShadow: "0 24px 60px rgba(0,0,0,0.18)"
      }}>
        <div ref={receiptRef}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#dcfce7", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: 28, fontWeight: 700 }}>✓</div>
            <h2 style={{ margin: 0, color: "#0d9488", fontSize: 22, fontWeight: 700 }}>Payment successful</h2>
            <p style={{ margin: "8px 0 0", color: "#64748b", fontSize: 13 }}>Donation receipt</p>
          </div>

          <DetailRow label="Payment type" value="Visa / Mastercard" />
          <DetailRow label="Card" value={details.maskedCard} />
          <DetailRow label="Donation for" value={details.purpose} />
          <DetailRow label="Amount paid" value={`LKR ${Number(details.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} bold />
          <DetailRow label="Date" value={details.date} />
          <DetailRow label="Transaction id" value={details.transactionId} />
          <DetailRow label="Donation ref" value={details.donationId?.slice(-8)?.toUpperCase() || "—"} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 24 }}>
          <button
            onClick={handlePrint}
            style={{
              background: "#2563eb", color: "white", border: "none", padding: "13px 16px",
              borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer", letterSpacing: "0.5px"
            }}
          >
            PRINT
          </button>
          <button
            onClick={onClose}
            style={{
              background: "#2563eb", color: "white", border: "none", padding: "13px 16px",
              borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer", letterSpacing: "0.5px"
            }}
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function MockCheckout({ theme = "dark" }) {
  const isLight = theme === "light";
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const amount = searchParams.get("amount");
  const requestId = searchParams.get("request_id");
  const purpose = searchParams.get("purpose") || "Donation";
  const maxAmount = Number(searchParams.get("max") || 0);

  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [step, setStep] = useState("form");
  const [receiptDetails, setReceiptDetails] = useState(null);

  const token = localStorage.getItem("token");
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    if (!token || !user) {
      navigate("/login", { replace: true });
    }
  }, [navigate, token, user]);

  if (!token || !user) return null;

  const pageBg = isLight
    ? "radial-gradient(ellipse at 20% 20%, #ffffff 0%, #f8fafc 40%, #e2e8f0 70%, #d6d8de 100%)"
    : "radial-gradient(ellipse at 20% 20%, #2d5a3d 0%, #1a3a2a 40%, #0f2219 70%, #08150e 100%)";

  const cardDigits = cardNumber.replace(/\D/g, "");

  const validateForm = () => {
    if (cardDigits.length !== 16) {
      toast.error("Card number must be exactly 16 digits");
      return false;
    }
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      toast.error("Enter expiry as MM/YY");
      return false;
    }
    const [mm] = expiry.split("/").map(Number);
    if (mm < 1 || mm > 12) {
      toast.error("Invalid expiry month");
      return false;
    }
    if (cvc.length !== 3) {
      toast.error("CVC must be exactly 3 digits");
      return false;
    }
    return true;
  };

  const handlePay = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (maxAmount > 0 && Number(amount) > maxAmount) {
      toast.error(`Maximum donation allowed is LKR ${maxAmount.toLocaleString()}`);
      return;
    }

    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 1200));

      const res = await createMoneyDonation({
        moneyRequestId: requestId,
        amount: Number(amount),
        donationMethod: "online",
        paymentStatus: "success"
      });

      const transactionId = generateTransactionId();
      const dateStr = new Date().toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric"
      });

      setReceiptDetails({
        amount,
        purpose,
        date: dateStr,
        transactionId,
        maskedCard: maskCardNumber(cardNumber),
        donationId: res.data?._id
      });
      setStep("confirm");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Payment Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDone = () => setStep("receipt");

  const handleCloseReceipt = () => {
    navigate(`/donor?payment=success&request_id=${requestId}&amount=${amount}&donation_id=${receiptDetails?.donationId || ""}`);
  };

  const inputStyle = {
    width: "100%",
    padding: "16px",
    background: isLight ? "#fff" : "rgba(255,255,255,0.03)",
    border: isLight ? "1px solid rgba(15,23,42,0.12)" : "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px",
    color: isLight ? "#0f172a" : "white",
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box",
    letterSpacing: cardNumber ? "0.5px" : "normal"
  };

  const labelStyle = {
    display: "block", fontSize: 11, fontWeight: 600,
    color: isLight ? "#64748b" : "#95a89b",
    marginBottom: 8, letterSpacing: "1px", textTransform: "uppercase"
  };

  return (
    <>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }`}</style>

      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: pageBg, padding: 20, position: "relative", overflow: "hidden"
      }}>
        <FloatingFood count={16} />
        <div style={{
          background: isLight ? "rgba(255,255,255,0.98)" : "rgba(35, 53, 41, 0.4)",
          backdropFilter: "blur(20px)", border: isLight ? "1px solid rgba(15,23,42,0.08)" : "1px solid rgba(255,255,255,0.05)",
          borderRadius: "24px", padding: "48px 40px", width: "100%", maxWidth: "460px",
          boxShadow: "0 24px 48px rgba(0,0,0,0.25)", boxSizing: "border-box", position: "relative", zIndex: 1
        }}>
          <div style={{ textAlign: "center", marginBottom: 30 }}>
            <div style={{ fontSize: 13, color: "#2563eb", fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>SECURE CHECKOUT</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: isLight ? "#0f172a" : "#e8923a", marginBottom: 8 }}>Visa / Mastercard Payment</div>
            <div style={{ fontSize: 13, color: isLight ? "#64748b" : "rgba(255,255,255,0.55)", marginBottom: 12 }}>Secure online card payment (simulation mode)</div>
            <div style={{ fontSize: 15, color: isLight ? "#475569" : "rgba(255,255,255,0.7)" }}>
              Donation for: <b style={{ color: isLight ? "#0f172a" : "white" }}>{purpose}</b>
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: isLight ? "#0f172a" : "white", marginTop: 12 }}>
              LKR {Number(amount).toLocaleString()}
            </div>
          </div>

          <form onSubmit={handlePay} style={{ display: "grid", gap: 20 }}>
            <div>
              <label style={labelStyle}>Card Information</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="1234 5678 1234 5678"
                required
                value={cardNumber}
                onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                maxLength={19}
                style={inputStyle}
              />
              <div style={{ fontSize: 11, color: isLight ? "#94a3b8" : "rgba(255,255,255,0.4)", marginTop: 6 }}>
                {cardDigits.length}/16 digits
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={labelStyle}>Expiry</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="MM/YY"
                  required
                  value={expiry}
                  onChange={e => setExpiry(formatExpiry(e.target.value))}
                  maxLength={5}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>CVC</label>
                <input
                  type="password"
                  inputMode="numeric"
                  placeholder="123"
                  required
                  value={cvc}
                  onChange={e => setCvc(formatCvc(e.target.value))}
                  maxLength={3}
                  style={inputStyle}
                />
                <div style={{ fontSize: 11, color: isLight ? "#94a3b8" : "rgba(255,255,255,0.4)", marginTop: 6 }}>
                  {cvc.length}/3 digits
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 10,
                background: loading ? "#94a3b8" : "linear-gradient(90deg, #ed9647 0%, #d87e32 100%)",
                color: "white", border: "none", padding: "16px", fontSize: 16, fontWeight: 700,
                borderRadius: "12px", cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 8px 20px rgba(237, 150, 71, 0.25)"
              }}
            >
              {loading ? "Processing..." : `Pay LKR ${Number(amount).toLocaleString()}`}
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              style={{ background: "transparent", color: "#d68840", border: "none", textDecoration: "underline", cursor: "pointer", fontWeight: 500, fontSize: 14 }}
            >
              Cancel and Return
            </button>
          </form>
        </div>
      </div>

      <ConfirmationModal
        open={step === "confirm"}
        details={receiptDetails}
        onDone={handleDone}
      />

      <ReceiptModal
        open={step === "receipt"}
        details={receiptDetails}
        onClose={handleCloseReceipt}
      />
    </>
  );
}

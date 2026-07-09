import { useState } from "react";
import { createPortal } from "react-dom";
import { createMoneyDonation } from "../api/moneyDonation";
import ChatWidget from "./ChatWidget";
import { COLORS } from "../theme";
import toast from "react-hot-toast";

const PAYMENT_METHODS = [
  {
    id: "online",
    icon: "💳",
    title: "Online Card Payment",
    subtitle: "Visa / Mastercard — Instant & secure"
  },
  {
    id: "bank_transfer",
    icon: "🏦",
    title: "Bank Transfer",
    subtitle: "Direct to NGO bank — No gateway fee"
  },
  {
    id: "cash_handover",
    icon: "💵",
    title: "Cash Hand Over",
    subtitle: "Meet NGO in person — Local donors"
  }
];

const METHOD_LABELS = {
  online: "Online Card",
  bank_transfer: "Bank Transfer",
  cash_handover: "Cash Hand Over"
};

const CHAT_METHODS = ["bank_transfer", "cash_handover"];

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 13, padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <span style={{ color: "rgba(255,255,255,0.55)" }}>{label}</span>
      <span style={{ color: "white", fontWeight: 600, textAlign: "right" }}>{value}</span>
    </div>
  );
}

export default function DonationCheckoutModal({ open, onClose, fundraiser, onSuccess, onOnlinePay, currentUserId }) {
  const [step, setStep] = useState("amount");
  const [amount, setAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [donorNote, setDonorNote] = useState("");
  const [receiptFile, setReceiptFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);

  if (!open || !fundraiser) return null;

  const ngo = fundraiser.ngoId || {};
  const settings = ngo.donationSettings || {};
  const remainingAmount = Math.max(0, Number(fundraiser.amountNeeded || 0) - Number(fundraiser.amountRaised || 0));
  const goalReached = remainingAmount <= 0;

  const resetAndClose = () => {
    setStep("amount");
    setAmount("");
    setSelectedMethod(null);
    setDonorNote("");
    setReceiptFile(null);
    setShowChat(false);
    onClose();
  };

  const validateAmount = () => {
    if (goalReached) {
      toast.error("This fundraiser goal is already fully funded");
      return false;
    }
    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return false;
    }
    if (Number(amount) > remainingAmount) {
      toast.error(`Maximum donation is LKR ${remainingAmount.toLocaleString()} (remaining to goal)`);
      return false;
    }
    return true;
  };

  const handleSelectMethod = (methodId) => {
    if (!validateAmount()) return;
    setSelectedMethod(methodId);
    setShowChat(false);
    setStep("details");
  };

  const handleOnlinePay = () => {
    if (!validateAmount()) return;
    onOnlinePay({
      amount,
      requestId: fundraiser._id,
      purpose: fundraiser.purpose,
      maxAmount: remainingAmount
    });
  };



  const handleSubmitPending = async (method) => {
    if (!validateAmount()) return;

    if (method === "bank_transfer" && !receiptFile) {
      toast.error("Please upload your payment receipt");
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("moneyRequestId", fundraiser._id);
      fd.append("amount", Number(amount));
      fd.append("donationMethod", method);
      fd.append("donorNote", donorNote.trim());
      if (receiptFile) fd.append("receipt", receiptFile);

      const res = await createMoneyDonation(fd);
      toast.success(
        method === "cash_handover"
          ? "Handover request sent! NGO will confirm once received."
          : "Donation submitted! NGO will verify and confirm."
      );
      resetAndClose();
      onSuccess?.(res?.data);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to submit donation");
    } finally {
      setLoading(false);
    }
  };

  const renderBankDetails = () => (
    <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: 16, marginBottom: 16, textAlign: "left" }}>
      <div style={{ fontSize: 12, color: COLORS.amber, fontWeight: 700, marginBottom: 10, letterSpacing: "0.5px" }}>BANK TRANSFER DETAILS</div>
      <InfoRow label="Bank" value={settings.bankName} />
      <InfoRow label="Account No." value={settings.accountNumber} />
      <InfoRow label="Branch" value={settings.branch} />
      <InfoRow label="SWIFT (Foreign)" value={settings.swift} />
      {!settings.bankName && !settings.accountNumber && (
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, margin: "8px 0 0" }}>
          NGO has not added bank details yet. Use chat below to contact them.
        </p>
      )}
    </div>
  );

  const renderReceiptUpload = () => (
    <div style={{ marginBottom: 16, textAlign: "left" }}>
      <label style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,0.6)", marginBottom: 8, fontWeight: 600 }}>
        Upload Payment Receipt *
      </label>
      <input
        type="file"
        accept="image/*,.pdf"
        onChange={e => setReceiptFile(e.target.files?.[0] || null)}
        style={{ width: "100%", color: "white", fontSize: 13 }}
      />
      {receiptFile && <div style={{ fontSize: 12, color: COLORS.mint, marginTop: 6 }}>{receiptFile.name}</div>}
    </div>
  );

  const renderAppChat = () => (
    <div style={{ marginBottom: 16, textAlign: "left" }}>
      {!showChat ? (
        <button
          type="button"
          onClick={() => setShowChat(true)}
          style={{
            width: "100%",
            background: "rgba(126, 200, 160, 0.12)",
            color: COLORS.mint,
            border: `1px solid ${COLORS.mint}55`,
            padding: "12px 16px",
            borderRadius: 12,
            fontWeight: 700,
            cursor: "pointer",
            fontSize: 14
          }}
        >
          💬 Chat with NGO in App
        </button>
      ) : (
        <ChatWidget
          moneyRequestId={fundraiser._id}
          currentUserId={currentUserId}
          otherUserId={ngo._id}
          compact
          title={`Chat with ${ngo.name || "NGO"}`}
        />
      )}
    </div>
  );

  const renderDetails = () => {
    const method = selectedMethod;

    if (method === "online") {
      return (
        <>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 14, margin: "0 0 20px" }}>
            Pay securely with Visa or Mastercard. Payment is processed instantly.
          </p>
          <button
            onClick={handleOnlinePay}
            style={{ width: "100%", background: "linear-gradient(90deg, #ed9647, #d87e32)", color: "white", padding: 16, border: "none", borderRadius: 12, fontWeight: 700, fontSize: 16, cursor: "pointer" }}
          >
            Continue to Card Payment — LKR {Number(amount).toLocaleString()}
          </button>
        </>
      );
    }

    if (method === "bank_transfer") {
      return (
        <>
          {renderBankDetails()}
          {renderReceiptUpload()}
          <textarea
            placeholder="Optional note (reference number, date...)"
            value={donorNote}
            onChange={e => setDonorNote(e.target.value)}
            rows={2}
            style={{ width: "100%", padding: 12, marginBottom: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "white", fontSize: 13, boxSizing: "border-box", fontFamily: "inherit" }}
          />
          {renderAppChat()}
          <button disabled={loading} onClick={() => handleSubmitPending("bank_transfer")} style={{ width: "100%", background: COLORS.mint, color: COLORS.forest, padding: 16, border: "none", borderRadius: 12, fontWeight: 700, cursor: "pointer" }}>
            {loading ? "Submitting..." : "I've Transferred — Submit Receipt"}
          </button>
        </>
      );
    }

    if (method === "cash_handover") {
      return (
        <>
          <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: 16, marginBottom: 16, textAlign: "left" }}>
            <div style={{ fontSize: 12, color: COLORS.amber, fontWeight: 700, marginBottom: 10 }}>MEET THE NGO</div>
            <InfoRow label="Organization" value={ngo.organization || ngo.name} />
            <InfoRow label="Phone" value={ngo.phone} />
            <InfoRow label="Office Address" value={settings.officeAddress} />
          </div>
          <textarea
            placeholder="When & where can you hand over? (optional)"
            value={donorNote}
            onChange={e => setDonorNote(e.target.value)}
            rows={2}
            style={{ width: "100%", padding: 12, marginBottom: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "white", fontSize: 13, boxSizing: "border-box", fontFamily: "inherit" }}
          />
          {renderAppChat()}
          <button disabled={loading} onClick={() => handleSubmitPending("cash_handover")} style={{ width: "100%", background: "rgba(126,200,160,0.2)", color: COLORS.mint, padding: 16, border: `1px solid ${COLORS.mint}`, borderRadius: 12, fontWeight: 700, cursor: "pointer" }}>
            {loading ? "Submitting..." : "Request Cash Handover"}
          </button>
        </>
      );
    }



    return null;
  };

  return createPortal(
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 999999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, boxSizing: "border-box" }}>
      <div style={{
        background: "linear-gradient(160deg, rgba(35,53,41,0.97), rgba(26,58,42,0.98))",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 24,
        width: "100%",
        maxWidth: step === "method" ? 520 : showChat && CHAT_METHODS.includes(selectedMethod) ? 520 : 480,
        maxHeight: "92vh",
        overflowY: "auto",
        padding: "32px 28px",
        boxShadow: "0 32px 64px rgba(0,0,0,0.5)",
        boxSizing: "border-box"
      }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: COLORS.amber, fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>DONATE NOW</div>
          <h2 style={{ color: "white", margin: "0 0 8px", fontSize: 24 }}>{fundraiser.purpose}</h2>
          <p style={{ color: "rgba(255,255,255,0.55)", margin: 0, fontSize: 13 }}>
            by {ngo.name || "Verified NGO"} • Goal LKR {fundraiser.amountNeeded?.toLocaleString()}
          </p>
          <p style={{ color: goalReached ? "#f87171" : COLORS.mint, margin: "8px 0 0", fontSize: 13, fontWeight: 600 }}>
            {goalReached ? "Goal fully funded" : `Remaining: LKR ${remainingAmount.toLocaleString()}`}
          </p>
        </div>

        {step === "amount" && (
          <>
            <input
              type="number"
              min="1"
              max={goalReached ? undefined : remainingAmount}
              placeholder={goalReached ? "Goal reached" : `Max LKR ${remainingAmount.toLocaleString()}`}
              value={amount}
              onChange={e => setAmount(e.target.value)}
              disabled={goalReached}
              style={{ width: "100%", padding: 16, marginBottom: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, color: "white", fontSize: 18, fontWeight: 600, textAlign: "center", boxSizing: "border-box" }}
            />
            {!goalReached && (
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: "0 0 12px", textAlign: "center" }}>
                You can donate up to LKR {remainingAmount.toLocaleString()}
              </p>
            )}
            <button
              onClick={() => validateAmount() && setStep("method")}
              disabled={goalReached}
              style={{ width: "100%", background: COLORS.amber, color: COLORS.forest, padding: 16, border: "none", borderRadius: 12, fontWeight: 800, fontSize: 16, cursor: "pointer" }}
            >
              Choose Payment Method →
            </button>
          </>
        )}

        {step === "method" && (
          <>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 14, textAlign: "center" }}>
              Donating <b style={{ color: "white" }}>LKR {Number(amount).toLocaleString()}</b> — choose how to pay
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              {PAYMENT_METHODS.map(m => (
                <button
                  key={m.id}
                  onClick={() => handleSelectMethod(m.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    width: "100%",
                    textAlign: "left",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 14,
                    padding: "14px 16px",
                    cursor: "pointer",
                    color: "white"
                  }}
                >
                  <span style={{ fontSize: 28 }}>{m.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{m.title}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>{m.subtitle}</div>
                  </div>
                  <span style={{ color: "rgba(255,255,255,0.35)" }}>›</span>
                </button>
              ))}
            </div>
            <button onClick={() => setStep("amount")} style={{ display: "block", margin: "16px auto 0", background: "none", border: "none", color: COLORS.amber, cursor: "pointer", fontSize: 13 }}>
              ← Change amount
            </button>
          </>
        )}

        {step === "details" && (
          <>
            <div style={{ fontSize: 12, color: COLORS.mint, fontWeight: 700, marginBottom: 16, textAlign: "center" }}>
              {METHOD_LABELS[selectedMethod]} • LKR {Number(amount).toLocaleString()}
            </div>
            {renderDetails()}
            <button onClick={() => { setStep("method"); setShowChat(false); }} style={{ display: "block", margin: "16px auto 0", background: "none", border: "none", color: COLORS.amber, cursor: "pointer", fontSize: 13 }}>
              ← Choose different method
            </button>
          </>
        )}

        <button onClick={resetAndClose} style={{ display: "block", margin: "20px auto 0", background: "none", border: "none", color: "rgba(255,255,255,0.45)", cursor: "pointer", fontSize: 13, textDecoration: "underline" }}>
          Cancel
        </button>
      </div>
    </div>,
    document.body
  );
}

export { METHOD_LABELS, PAYMENT_METHODS };

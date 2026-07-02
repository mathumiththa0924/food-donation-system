const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY || "sk_test_dummy_key_to_prevent_crash");
const MoneyDonation = require("../models/MoneyDonation");

// @desc    Create Stripe Checkout Session
// @route   POST /api/payment/create-checkout-session
// @access  Private (Donor)
exports.createCheckoutSession = async (req, res) => {
  try {
    const { amount, moneyRequestId, purpose } = req.body;
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "lkr",
            product_data: {
              name: `Donation for: ${purpose}`,
            },
            unit_amount: amount * 100, // Stripe expects amounts in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${clientUrl}/dashboard?payment=success&request_id=${moneyRequestId}&amount=${amount}`,
      cancel_url: `${clientUrl}/dashboard?payment=cancel`,
      metadata: {
        donorId: req.user._id.toString(),
        moneyRequestId,
        amount
      }
    });

    res.status(200).json({ id: session.id, url: session.url });
  } catch (error) {
    console.error("Stripe Checkout Error:", error.message);
    res.status(500).json({ success: false, message: error.message || "Server Error" });
  }
};

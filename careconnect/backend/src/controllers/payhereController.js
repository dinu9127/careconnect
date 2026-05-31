import Booking from '../models/Booking.js'

// Render an auto-submitting form that redirects the user to PayHere checkout
export const renderCheckout = async (req, res) => {
  try {
    const bookingId = req.params.id
    const booking = await Booking.findById(bookingId).populate('client', 'name email phone')
    if (!booking) return res.status(404).send('Booking not found')

    const merchantId = process.env.PAYHERE_MERCHANT_ID || ''
    const sandbox = process.env.PAYHERE_SANDBOX === 'true'
    const payhereUrl = sandbox ? 'https://sandbox.payhere.lk/pay/checkout' : 'https://www.payhere.lk/pay/checkout'

    const amount = booking.totalAmount || 0
    const orderId = booking._id.toString()

    // Frontend and backend URLs — set BASE_URL in .env to your public backend URL (ngrok) for webhook.
    const frontendBase = process.env.VITE_FRONTEND_URL || process.env.FRONTEND_URL || 'http://localhost:3000'
    const backendBase = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`

    const returnUrl = `${frontendBase}/payment-success?bookingId=${orderId}`
    const cancelUrl = `${frontendBase}/payment-cancel?bookingId=${orderId}`
    const notifyUrl = `${backendBase}/api/payhere/webhook`

    const items = `Caregiver booking ${orderId}`

    const html = `<!doctype html>
    <html>
      <head><meta charset="utf-8"><title>Redirecting to PayHere</title></head>
      <body>
        <p>Redirecting to payment provider...</p>
        <form id="payhereForm" method="post" action="${payhereUrl}">
          <input type="hidden" name="merchant_id" value="${merchantId}" />
          <input type="hidden" name="return_url" value="${returnUrl}" />
          <input type="hidden" name="cancel_url" value="${cancelUrl}" />
          <input type="hidden" name="notify_url" value="${notifyUrl}" />
          <input type="hidden" name="order_id" value="${orderId}" />
          <input type="hidden" name="items" value="${items}" />
          <input type="hidden" name="currency" value="LKR" />
          <input type="hidden" name="amount" value="${amount}" />
          <input type="hidden" name="first_name" value="${booking.client?.name || ''}" />
          <input type="hidden" name="last_name" value="" />
          <input type="hidden" name="email" value="${booking.client?.email || ''}" />
          <input type="hidden" name="phone" value="${booking.client?.phone || ''}" />
        </form>
        <script>document.getElementById('payhereForm').submit();</script>
      </body>
    </html>`

    res.send(html)
  } catch (err) {
    console.error('Error rendering PayHere checkout:', err)
    res.status(500).send('Failed to initiate checkout')
  }
}

// Webhook / IPN handler — PayHere will POST payment details here.
// NOTE: For production or real verification, implement signature/hash verification per PayHere docs.
export const handleIPN = async (req, res) => {
  try {
    const payload = req.body || {}
    console.log('PayHere IPN received:', payload)

    // Try to find booking by order_id (we used booking._id as order_id)
    const orderId = payload.order_id || payload.orderId || payload.merchant_order_id
    if (!orderId) {
      console.warn('IPN missing order_id')
      return res.status(400).send('Missing order_id')
    }

    const booking = await Booking.findById(orderId)
    if (!booking) {
      console.warn('Booking not found for IPN order_id:', orderId)
      return res.status(404).send('Booking not found')
    }

    // Basic acceptance logic: mark paid if payload indicates success.
    // This is intentionally permissive for sandbox/demo. Replace with exact verification per PayHere docs.
    const raw = JSON.stringify(payload).toLowerCase()
    const isPaid = raw.includes('paid') || raw.includes('completed') || payload.status === '2' || payload.payment_status === 'Completed'

    if (isPaid) {
      booking.paymentStatus = 'paid'
      booking.paymentMethod = 'card'
      booking.transactionId = payload.transaction_id || payload.payhere_transaction_id || payload.transactionId || ''
      booking.paymentDate = new Date()
      await booking.save()
      console.log('Booking marked as paid via IPN:', booking._id.toString())
    } else {
      console.log('IPN received but not marked as paid for booking:', booking._id.toString())
    }

    // PayHere expects a 200 OK response
    res.status(200).send('OK')
  } catch (err) {
    console.error('Error handling PayHere IPN:', err)
    res.status(500).send('Error')
  }
}

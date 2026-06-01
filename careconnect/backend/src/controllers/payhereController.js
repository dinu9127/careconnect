import crypto from 'crypto'
import Booking from '../models/Booking.js'

// Render an auto-submitting form that redirects the user to PayHere checkout
export const renderCheckout = async (req, res) => {
  try {
    const bookingId = req.params.id
    const booking = await Booking.findById(bookingId).populate('client', 'name email phone')
    if (!booking) return res.status(404).send('Booking not found')

    const merchantId = process.env.PAYHERE_MERCHANT_ID || ''
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET || ''
    const sandbox = process.env.PAYHERE_SANDBOX === 'true'
    const payhereUrl = sandbox ? 'https://sandbox.payhere.lk/pay/checkout' : 'https://www.payhere.lk/pay/checkout'

    const amount = booking.totalAmount || 0
    const orderId = booking._id.toString()
    const currency = 'LKR'
    const amountFormatted = parseFloat(amount).toLocaleString('en-us', { minimumFractionDigits: 2 }).replaceAll(',', '')

    const secretHash = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase()
    const hash = crypto.createHash('md5')
      .update(merchantId + orderId + amountFormatted + currency + secretHash)
      .digest('hex')
      .toUpperCase()

    const frontendBase = process.env.FRONTEND_URL || 'http://localhost:3000'
    const backendBase = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`

    const fields = {
      merchant_id: merchantId,
      return_url: `${frontendBase}/client/bookings?payment=success&bookingId=${orderId}`,
      cancel_url: `${frontendBase}/client/bookings?payment=cancelled&bookingId=${orderId}`,
      notify_url: `${backendBase}/api/payhere/webhook`,
      order_id: orderId,
      items: `Caregiver booking ${orderId}`,
      currency,
      amount: amountFormatted,
      first_name: booking.client?.name || '',
      last_name: '',
      email: booking.client?.email || '',
      phone: booking.client?.phone || '',
      address: booking.client?.address || 'N/A',
      city: 'Colombo',
      country: 'Sri Lanka',
      hash
    }

    res.status(200).json({
      success: true,
      action: payhereUrl,
      fields
    })
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
   const isPaid = payload.status_code === '2'

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

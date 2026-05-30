// Controller to expose safe debug info about payment environment variables
export const getPaymentEnv = (req, res) => {
  const hasMerchantId = Boolean(process.env.PAYHERE_MERCHANT_ID);
  const hasMerchantSecret = Boolean(process.env.PAYHERE_MERCHANT_SECRET);
  const sandbox = process.env.PAYHERE_SANDBOX === 'true';

  res.status(200).json({
    success: true,
    payhere: {
      configured: hasMerchantId && hasMerchantSecret,
      hasMerchantId,
      hasMerchantSecret,
      sandbox
    }
  });
};

'use client'
import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

// Load Stripe outside of component to avoid recreating on every render
const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

const CheckoutForm = ({ amount, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setMessage('');

    try {
      // Create payment intent on your server
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // convert $ to cents
          currency: 'usd',
          metadata: { type: 'donation' },
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response error:', response.status, errorText);
        throw new Error(`Server error (${response.status}): ${errorText || 'Unknown error'}`);
      }

      // Check if response content-type is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.error('Non-JSON response received:', responseText);
        throw new Error('Server returned non-JSON response. Please check your backend endpoint.');
      }

      // Parse JSON response (only once!)
      const responseData = await response.json();
      console.log('Parsed response data:', responseData);

      const { client_secret: clientSecret, error: serverError } = responseData;

      if (serverError) {
        throw new Error(serverError.message || 'Server error occurred');
      }

      if (!clientSecret) {
        console.error('Missing client_secret in response:', responseData);
        throw new Error('Invalid response from server: missing client_secret');
      }

      console.log('Confirming payment with client_secret:', clientSecret);

      // Confirm the payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            // You can collect billing details if needed
          },
        },
      });

      if (error) {
        console.error('Stripe payment error:', error);
        setMessage(error.message);
        onError?.(error);
      } else if (paymentIntent.status === 'succeeded') {
        setMessage('Thank you for your generous donation!');
        onSuccess?.(paymentIntent);
      }
    } catch (err) {
      console.error('Payment processing error:', err);
      setMessage(err.message || 'An unexpected error occurred.');
      onError?.(err);
    }

    setProcessing(false);
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#111',
        fontFamily: '"system-ui", sans-serif',
        '::placeholder': { color: '#666' },
        padding: '8px 0',
      },
      invalid: { 
        color: '#dc2626',
        iconColor: '#dc2626'
      },
      complete: {
        color: '#004080',
        iconColor: '#004080'
      }
    },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <label style={{ color: "#111", fontWeight: 500 }}>
        Card Information:
        <div style={{
          border: "1px solid #ccc",
          borderRadius: "6px",
          padding: "0.5rem",
          marginTop: "0.25rem",
          backgroundColor: "#fff"
        }}>
          <CardElement options={cardElementOptions} />
        </div>
      </label>
      
      <button
        onClick={handleSubmit}
        disabled={!stripe || processing}
        style={{
          width: "100%",
          padding: "0.75rem",
          backgroundColor: !stripe || processing ? "#ccc" : "#004080",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: !stripe || processing ? "not-allowed" : "pointer",
          fontWeight: "bold",
          fontSize: "1rem",
          transition: "all 0.2s",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem"
        }}
        onMouseOver={(e) => {
          if (stripe && !processing) {
            e.currentTarget.style.backgroundColor = "#0059b3";
          }
        }}
        onMouseOut={(e) => {
          if (stripe && !processing) {
            e.currentTarget.style.backgroundColor = "#004080";
          }
        }}
      >
        {processing ? (
          <>
            <div style={{
              width: "16px",
              height: "16px",
              border: "2px solid #fff",
              borderTop: "2px solid transparent",
              borderRadius: "50%",
              animation: "spin 1s linear infinite"
            }}></div>
            Processing...
          </>
        ) : (
          `Donate $${amount}`
        )}
      </button>
      
      {message && (
        <div style={{
          padding: "0.75rem",
          borderRadius: "6px",
          border: "1px solid",
          borderColor: message.includes('Thank you') ? "#22c55e" : "#dc2626",
          backgroundColor: message.includes('Thank you') ? "#f0fdf4" : "#fef2f2",
          color: message.includes('Thank you') ? "#15803d" : "#dc2626",
          display: "flex",
          alignItems: "flex-start",
          gap: "0.5rem"
        }}>
          <div style={{ flexShrink: 0, marginTop: "2px" }}>
            {message.includes('Thank you') ? "✓" : "⚠"}
          </div>
          <div style={{ fontSize: "0.9rem" }}>{message}</div>
        </div>
      )}
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

const ReformedChapterDonate = () => {
  const [amount, setAmount] = useState(25);
  const [customAmount, setCustomAmount] = useState('');
  const [showForm, setShowForm] = useState(false);

  const presetAmounts = [15, 25, 50, 100];

  // Show error if Stripe key is missing
  if (!publishableKey) {
    return (
      <div style={{ padding: "2rem 1rem 1rem", textAlign: "center", backgroundColor: "#f9f9f9", minHeight: "100vh" }}>
        <div style={{
          maxWidth: "600px",
          margin: "0 auto",
          backgroundColor: "#fff3cd",
          border: "1px solid #ffeaa7",
          borderRadius: "10px",
          padding: "1.5rem",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⚠️</div>
          <h2 style={{ color: "#856404", marginBottom: "1rem" }}>Stripe Configuration Missing</h2>
          <div style={{ color: "#856404", textAlign: "left" }}>
            <p style={{ marginBottom: "1rem" }}>
              Please check your <code style={{ backgroundColor: "#f8f9fa", padding: "2px 4px", borderRadius: "3px" }}>.env.local</code> file and make sure you have:
            </p>
            <pre style={{ 
              backgroundColor: "#f8f9fa", 
              padding: "1rem", 
              borderRadius: "6px", 
              textAlign: "left",
              fontSize: "0.9rem",
              border: "1px solid #e9ecef",
              overflowX: "auto"
            }}>
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
            </pre>
            <p style={{ marginTop: "1rem" }}>
              Then restart your server with <code style={{ backgroundColor: "#f8f9fa", padding: "2px 4px", borderRadius: "3px" }}>npm run dev</code>
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleAmountSelect = (selectedAmount) => {
    setAmount(selectedAmount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value;
    setCustomAmount(value);
    if (value && !isNaN(value) && parseFloat(value) > 0) {
      setAmount(parseFloat(value));
    }
  };

  const handleSuccess = (paymentIntent) => {
    console.log('Payment successful:', paymentIntent);
    setShowForm(false);
  };

  const handleError = (error) => {
    console.error('Payment error:', error);
  };

  const inputStyle = {
    width: "100%",
    padding: "0.5rem",
    marginTop: "0.25rem",
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "1rem",
    outline: "none",
    color: "#111",
    backgroundColor: "#fff",
  };

  return (
    <div style={{ padding: "5rem 2rem 2rem", textAlign: "center", backgroundColor: "#f9f9f9", minHeight: "100vh" }}>
      {/* Support Message */}
      <div style={{
        maxWidth: "800px",
        margin: "0 auto 2rem",
        backgroundColor: "#fff",
        padding: "2rem",
        borderRadius: "10px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        textAlign: "left"
      }}>
        <h2 style={{ color: "#000", marginBottom: "1.5rem", textAlign: "center" }}>
          Support Reformed Chapter
        </h2>
        
        <div style={{ lineHeight: "1.6", color: "#111" }}>
          <p style={{ marginBottom: "1rem" }}>
            Reformed Chapter is a personal project created to make Reformed biblical 
            resources more accessible to believers around the world. All of the content 
            on this site is provided free of charge, and your support helps cover the 
            costs of hosting, development, and continued growth.
          </p>
          <p style={{ marginBottom: "1.5rem" }}>
            If you've found this resource valuable, would you prayerfully consider 
            supporting it? Every gift—large or small—directly helps me continue building 
            and improving Reformed Chapter for the good of the church.
          </p>
          
          <div style={{
            backgroundColor: "#f0f8ff",
            border: "1px solid #b3d9ff",
            borderRadius: "6px",
            padding: "1rem",
            fontStyle: "italic",
            color: "#004080"
          }}>
            "Each of you should give what you have decided in your heart to give, not 
            reluctantly or under compulsion, for God loves a cheerful giver."
            <div style={{ fontWeight: "bold", marginTop: "0.5rem" }}>– 2 Corinthians 9:7</div>
          </div>
        </div>
      </div>

      {/* Donation Form */}
      <div style={{
        maxWidth: "800px",
        margin: "0 auto",
        backgroundColor: "#fff",
        padding: "2rem",
        borderRadius: "10px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
      }}>
        <h3 style={{ color: "#000", marginBottom: "2rem" }}>
          Make a Donation
        </h3>
        
        {!showForm ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", textAlign: "left" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "1rem" }}>
              {presetAmounts.map((presetAmount) => (
                <button
                  key={presetAmount}
                  onClick={() => handleAmountSelect(presetAmount)}
                  style={{
                    padding: "1rem",
                    fontSize: "1rem",
                    fontWeight: "bold",
                    border: "2px solid",
                    borderColor: amount === presetAmount ? "#004080" : "#ccc",
                    borderRadius: "6px",
                    backgroundColor: amount === presetAmount ? "#004080" : "#fff",
                    color: amount === presetAmount ? "#fff" : "#111",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  onMouseOver={(e) => {
                    if (amount !== presetAmount) {
                      e.currentTarget.style.borderColor = "#004080";
                      e.currentTarget.style.backgroundColor = "#f0f8ff";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (amount !== presetAmount) {
                      e.currentTarget.style.borderColor = "#ccc";
                      e.currentTarget.style.backgroundColor = "#fff";
                    }
                  }}
                >
                  ${presetAmount}
                </button>
              ))}
            </div>
            
            <label style={{ color: "#111", fontWeight: 500 }}>
              Other Amount:
              <input
                type="number"
                min="1"
                step="0.01"
                placeholder="Enter amount"
                value={customAmount}
                onChange={handleCustomAmountChange}
                style={inputStyle}
              />
            </label>
            
            <button
              onClick={() => setShowForm(true)}
              disabled={!amount || amount <= 0}
              style={{
                width: "100%",
                padding: "0.75rem",
                backgroundColor: !amount || amount <= 0 ? "#ccc" : "#004080",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: !amount || amount <= 0 ? "not-allowed" : "pointer",
                fontWeight: "bold",
                fontSize: "1rem",
                transition: "all 0.2s"
              }}
              onMouseOver={(e) => {
                if (amount && amount >= 1) {
                  e.currentTarget.style.backgroundColor = "#0059b3";
                }
              }}
              onMouseOut={(e) => {
                if (amount && amount >= 1) {
                  e.currentTarget.style.backgroundColor = "#004080";
                }
              }}
            >
              Continue with ${amount}
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", textAlign: "left" }}>
            <div style={{
              backgroundColor: "#f0f8ff",
              border: "1px solid #b3d9ff",
              borderRadius: "6px",
              padding: "1rem"
            }}>
              <h4 style={{ color: "#004080", margin: "0 0 0.5rem 0", fontWeight: "bold" }}>
                Donation Amount: ${amount}
              </h4>
              <p style={{ color: "#111", margin: 0 }}>Thank you for supporting Reformed Chapter</p>
            </div>
            
            <Elements stripe={stripePromise}>
              <CheckoutForm
                amount={amount}
                onSuccess={handleSuccess}
                onError={handleError}
              />
            </Elements>
            
            <button
              onClick={() => setShowForm(false)}
              style={{
                width: "100%",
                padding: "0.75rem",
                backgroundColor: "transparent",
                color: "#004080",
                border: "1px solid #004080",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "500",
                fontSize: "1rem",
                transition: "all 0.2s"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "#f0f8ff";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              ← Change Amount
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReformedChapterDonate;
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { http } from '@api/http';
import '@styles/commercial.css';

export default function SubscriptionSuccess() {
  const navigate = useNavigate();
  
  useEffect(() => {
    const processPayment = async () => {
      try {
        // Get session_id from URL query parameters
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('session_id');
        
        if (sessionId) {
          // Complete the subscription process
          await http.post('/subscription/complete', { sessionId });
        }
        
        // Redirect to subscription page after a delay
        setTimeout(() => {
          navigate('/subscription');
        }, 5000);
      } catch (err) {
        console.error('Error processing payment:', err);
        setTimeout(() => {
          navigate('/subscription');
        }, 5000);
      }
    };
    
    processPayment();
  }, [navigate]);
  
  return (
    <div className="container text-center">
      <div className="success-animation">
        <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
          <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
          <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
        </svg>
      </div>
      
      <h1>Payment Successful!</h1>
      <p>Thank you for upgrading your subscription.</p>
      <p>You will be redirected to the subscription page in a few seconds...</p>
      
      <button 
        className="btn primary mt-4"
        onClick={() => navigate('/subscription')}
      >
        Return to Subscription Page
      </button>
      
      {/* Styles moved to styles/commercial.css */}
    </div>
  );
}

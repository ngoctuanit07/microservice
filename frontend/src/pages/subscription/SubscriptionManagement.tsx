import { useState, useEffect } from 'react';
import { http } from '@api/http';
import '@styles/commercial.css';

interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
  maxHosts: number;
  maxUsers: number;
  included: string[];
}

interface SubscriptionData {
  plan: string;
  expiresAt: string | null;
  stripeCustomerId: string | null;
  features: {
    maxHosts: number;
    maxUsers: number;
    advancedSecurity: boolean;
    apiAccess: boolean;
    dedicatedSupport: boolean;
    customBranding: boolean;
    automatedBackups: boolean;
  };
}

export default function SubscriptionManagement() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  
  const plans: Plan[] = [
    {
      id: 'FREE',
      name: 'Free',
      price: 0,
      features: ['Basic host management', 'Single user'],
      maxHosts: 5,
      maxUsers: 1,
      included: ['5 hosts', '1 user', 'Basic security']
    },
    {
      id: 'BASIC',
      name: 'Basic',
      price: 29,
      features: ['Team collaboration', 'API access'],
      maxHosts: 25,
      maxUsers: 3,
      included: ['25 hosts', '3 users', 'API access']
    },
    {
      id: 'PRO',
      name: 'Professional',
      price: 99,
      features: ['Advanced security', 'Custom branding', 'Automated backups'],
      maxHosts: 100,
      maxUsers: 10,
      included: ['100 hosts', '10 users', 'Advanced security', 'Custom branding', 'Automated backups']
    },
    {
      id: 'ENTERPRISE',
      name: 'Enterprise',
      price: 299,
      features: ['Unlimited hosts', 'Unlimited users', 'Dedicated support'],
      maxHosts: -1,
      maxUsers: -1,
      included: ['Unlimited hosts', 'Unlimited users', 'Dedicated support', 'All features']
    }
  ];
  
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        setLoading(true);
        const { data } = await http.get('/subscription/plan');
        setSubscription(data);
        setError(null);
      } catch (err: any) {
        console.error('Failed to fetch subscription:', err);
        setError(err.response?.data?.message || 'Failed to load subscription data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubscription();
  }, []);
  
  const handleUpgrade = async (planId: string) => {
    if (planId === 'FREE' || planId === subscription?.plan) return;
    
    try {
      setPaymentProcessing(true);
      
      // First, create a checkout session
      const { data } = await http.post('/subscription/checkout', {
        planId,
        successUrl: `${window.location.origin}/subscription/success`,
        cancelUrl: `${window.location.origin}/subscription`
      });
      
      // Redirect to the Stripe checkout page
      window.location.href = data.url;
    } catch (err: any) {
      console.error('Failed to upgrade subscription:', err);
      setError(err.response?.data?.message || 'Failed to upgrade subscription');
      setPaymentProcessing(false);
    }
  };
  
  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will be downgraded to the free plan.')) {
      return;
    }
    
    try {
      setPaymentProcessing(true);
      await http.post('/subscription/cancel');
      
      // Refresh subscription data
      const { data } = await http.get('/subscription/plan');
      setSubscription(data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to cancel subscription:', err);
      setError(err.response?.data?.message || 'Failed to cancel subscription');
    } finally {
      setPaymentProcessing(false);
    }
  };
  
  if (loading) {
    return <div className="container">Loading subscription data...</div>;
  }
  
  return (
    <div className="container">
      <h1>Subscription Management</h1>
      
      {error && <div className="alert alert-error">{error}</div>}
      
      <div className="card mb-4">
        <div className="card-header">
          <h2>Current Plan: {subscription?.plan || 'FREE'}</h2>
        </div>
        
        <div className="card-body">
          {subscription && (
            <div>
              <p>
                <strong>Status:</strong> Active
                {subscription.expiresAt && (
                  <span> (Expires: {new Date(subscription.expiresAt).toLocaleDateString()})</span>
                )}
              </p>
              
              <div className="stats">
                <div className="stat">
                  <div className="stat-title">Hosts</div>
                  <div className="stat-value">
                    {subscription.features.maxHosts === -1 
                      ? 'Unlimited' 
                      : `${subscription.features.maxHosts} max`}
                  </div>
                </div>
                
                <div className="stat">
                  <div className="stat-title">Users</div>
                  <div className="stat-value">
                    {subscription.features.maxUsers === -1 
                      ? 'Unlimited' 
                      : `${subscription.features.maxUsers} max`}
                  </div>
                </div>
              </div>
              
              <h3>Features</h3>
              <ul className="feature-list">
                {subscription.features.advancedSecurity && <li>Advanced Security</li>}
                {subscription.features.apiAccess && <li>API Access</li>}
                {subscription.features.dedicatedSupport && <li>Dedicated Support</li>}
                {subscription.features.customBranding && <li>Custom Branding</li>}
                {subscription.features.automatedBackups && <li>Automated Backups</li>}
              </ul>
              
              {subscription.plan !== 'FREE' && (
                <button 
                  className="btn danger" 
                  onClick={handleCancel}
                  disabled={paymentProcessing}
                >
                  {paymentProcessing ? 'Processing...' : 'Cancel Subscription'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      
      <h2>Available Plans</h2>
      <div className="pricing-cards">
        {plans.map((plan) => (
          <div 
            key={plan.id} 
            className={`pricing-card ${subscription?.plan === plan.id ? 'current' : ''}`}
          >
            <div className="pricing-header">
              <h3>{plan.name}</h3>
              <div className="pricing">
                <span className="currency">$</span>
                <span className="amount">{plan.price}</span>
                <span className="period">/month</span>
              </div>
            </div>
            
            <div className="pricing-features">
              <ul>
                {plan.included.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
            
            <div className="pricing-footer">
              {subscription?.plan === plan.id ? (
                <button className="btn" disabled>Current Plan</button>
              ) : (
                <button 
                  className="btn primary" 
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={paymentProcessing || plan.id === 'FREE'}
                >
                  {paymentProcessing ? 'Processing...' : plan.id === 'FREE' ? 'Free Plan' : 'Upgrade'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Styles moved to styles/commercial.css */}
    </div>
  );
}

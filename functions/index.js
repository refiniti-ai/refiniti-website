const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || '');

admin.initializeApp();

const BASE_URL = 'https://refiniti.ai'; 

/**
 * Triggered by GHL Webhook when a new opportunity is created.
 * Specifically handles the Canyon Lake Proposal structure:
 * $2500 Upfront + $500/mo for 3 months.
 * Uses Stripe Embedded Checkout.
 */
exports.handleGHLOpportunity = functions.https.onRequest({
    memory: '256Mi',
    timeoutSeconds: 60
}, async (req, res) => {
    console.log('Received GHL Opportunity:', JSON.stringify(req.body));
    const opportunity = req.body;
    
    if (!opportunity || (!opportunity.contact_id && !opportunity.id)) {
        return res.status(400).send('Missing opportunity data');
    }

    const contactId = opportunity.contact_id || (opportunity.contact ? opportunity.contact.id : null);
    let valueRaw = opportunity.lead_value || opportunity.value || opportunity.monetary_value || 0;
    const value = parseFloat(valueRaw);
    const clientName = opportunity.full_name || opportunity.contact_name || 'Valued Client';
    const clientEmail = opportunity.email || opportunity.contact_email || '';
    const opportunityName = opportunity.opportunity_name || opportunity.name || `Service for ${clientName}`;

    if (isNaN(value) || value < 50) {
        return res.status(200).send(`Value below $50, skipping payment link. Received: ${valueRaw}`);
    }

    try {
        console.log(`Creating Payment Intent for ${clientName} - Amount: $${value}`);
        
        // Check if it's the Canyon Lake proposal for hybrid payment
        if (opportunityName.includes('Canyon Lake')) {
            console.log('Creating Canyon Lake Payment Intent for', clientName);
            
            // For Canyon Lake: Create a Payment Intent for upfront + Setup Intent for subscription
            const paymentIntent = await stripe.paymentIntents.create({
                amount: 250000, // $2500 upfront
                currency: 'usd',
                metadata: {
                    ghl_contact_id: contactId || '',
                    ghl_opportunity_id: opportunity.id || '',
                    project_type: 'Canyon Lake',
                    payment_type: 'upfront',
                    customer_email: clientEmail
                },
                description: `${opportunityName} - Upfront Setup`
            });
            
            // Create Setup Intent for the recurring subscription
            const setupIntent = await stripe.setupIntents.create({
                payment_method_types: ['card'],
                metadata: {
                    ghl_contact_id: contactId || '',
                    ghl_opportunity_id: opportunity.id || '',
                    project_type: 'Canyon Lake',
                    payment_type: 'recurring',
                    amount: '50000', // $500/month
                    interval: 'month',
                    customer_email: clientEmail
                }
            });
            
            const brandedInvoiceUrl = `${BASE_URL}/invoice?name=${encodeURIComponent(clientName)}&email=${encodeURIComponent(clientEmail)}&amount=2500&id=CANYON-LAKE`;
            console.log(`Successfully generated custom checkout link: ${brandedInvoiceUrl}`);
            
            return res.status(200).send({
                message: 'Canyon Lake Custom Checkout Link Generated',
                brandedUrl: brandedInvoiceUrl
            });
        } else {
            // Standard one-time payment
            const paymentIntent = await stripe.paymentIntents.create({
                amount: value * 100, // Stripe uses cents
                currency: 'usd',
                metadata: {
                    ghl_contact_id: contactId || '',
                    ghl_opportunity_id: opportunity.id || '',
                    customer_email: clientEmail
                },
                description: opportunityName
            });
            
            const brandedInvoiceUrl = `${BASE_URL}/invoice?name=${encodeURIComponent(clientName)}&email=${encodeURIComponent(clientEmail)}&amount=${value}&id=${opportunity.id}`;

            console.log(`Successfully generated custom checkout link: ${brandedInvoiceUrl}`);
            
            return res.status(200).send({
                message: 'Custom checkout link generated',
                brandedUrl: brandedInvoiceUrl
            });
        }

    } catch (error) {
        console.error('Stripe API Error:', error.message);
        res.status(500).send({
            error: 'Internal Error during Embedded Checkout creation',
            details: error.message
        });
    }
});

/**
 * API endpoint to create Payment Intent for custom checkout
 * Called by checkout.html when loading
 */
exports.createPaymentIntent = functions.https.onRequest({
    memory: '256Mi',
    timeoutSeconds: 60
}, async (req, res) => {
    // Enable CORS
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).send('');
    }

    const { name, email, amount, id } = req.query || req.body;

    if (!amount || !email) {
        return res.status(400).send({ error: 'Missing required parameters' });
    }

    try {
        const isCanyonLake = id === 'CANYON-LAKE';
        const amountCents = isCanyonLake ? 250000 : (parseFloat(amount) * 100);

        // Create Payment Intent for upfront payment
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountCents,
            currency: 'usd',
            metadata: {
                client_name: name || 'Valued Client',
                invoice_id: id || 'UNKNOWN',
                payment_type: isCanyonLake ? 'upfront' : 'one-time',
                customer_email: email
            },
            description: isCanyonLake ? 'Canyon Lake - Upfront Setup' : `Payment for ${name || 'Service'}`
        });

        let response = {
            paymentIntent: paymentIntent.client_secret
        };

        // If Canyon Lake, also create Setup Intent for subscription
        if (isCanyonLake) {
            const setupIntent = await stripe.setupIntents.create({
                payment_method_types: ['card'],
                metadata: {
                    client_name: name || 'Valued Client',
                    invoice_id: id || 'CANYON-LAKE',
                    payment_type: 'recurring',
                    amount: '50000',
                    interval: 'month',
                    customer_email: email
                }
            });
            response.setupIntent = setupIntent.client_secret;
        }

        res.status(200).send(response);
    } catch (error) {
        console.error('Payment Intent creation error:', error);
        res.status(500).send({
            error: 'Failed to create payment intent',
            details: error.message
        });
    }
});

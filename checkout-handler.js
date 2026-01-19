// TicketHub - Checkout Handler
// Gestion professionnelle des commandes avec Google Sheets

// CONFIGURATION - À PERSONNALISER
const CONFIG = {
    // URL de votre Google Apps Script (voir SETUP_PAIEMENT.md)
    GOOGLE_SCRIPT_URL: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTvCQIYzDcNpyFv5Ky0reWleWjeDlz2iPA4kTWzZsKSzOrFUfevS7_AkDvvFF1H3PGIKmhM8RqoUtM-/pub?gid=0&single=true&output=csv',
    
    // Emails
    EMAIL: {
        support: 'contact@tickethub.com',
        admin: 'admin@tickethub.com'  // TON EMAIL pour recevoir les alertes
    },
    
    // WhatsApp (format international sans +)
    WHATSAPP: '33652051917',  // TON NUMÉRO
    
    // Durée de réservation en minutes
    RESERVATION_DURATION: 15
};

// Génération du numéro de commande unique
function generateOrderNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `CMD-${year}${month}${day}-${random}`;
}

// Validation email
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validation téléphone français
function isValidPhone(phone) {
    const re = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
    return re.test(phone);
}

// Format téléphone pour WhatsApp
function formatPhoneForWhatsApp(phone) {
    // Retire tous les caractères non numériques
    let cleaned = phone.replace(/\D/g, '');
    // Si commence par 0, remplace par 33
    if (cleaned.startsWith('0')) {
        cleaned = '33' + cleaned.substring(1);
    }
    return cleaned;
}

// Classe Order pour gérer une commande
class Order {
    constructor(event, ticket, customerData, quantity = 1) {
        this.orderNumber = generateOrderNumber();
        this.timestamp = new Date().toISOString();
        this.event = event;
        this.ticket = ticket;
        this.customer = customerData;
        this.quantity = quantity;
        this.totalPrice = ticket.price * quantity;
        this.status = 'pending'; // pending, paid, sent, cancelled
        this.reservationExpiry = new Date(Date.now() + CONFIG.RESERVATION_DURATION * 60000);
    }

    // Validation de la commande
    validate() {
        const errors = [];
        
        if (!this.customer.firstName || this.customer.firstName.trim().length < 2) {
            errors.push('Prénom invalide');
        }
        
        if (!this.customer.lastName || this.customer.lastName.trim().length < 2) {
            errors.push('Nom invalide');
        }
        
        if (!isValidEmail(this.customer.email)) {
            errors.push('Email invalide');
        }
        
        if (!isValidPhone(this.customer.phone)) {
            errors.push('Numéro de téléphone invalide (format français)');
        }
        
        if (this.quantity < 1 || this.quantity > 10) {
            errors.push('Quantité invalide (1-10)');
        }
        
        if (!this.customer.acceptTerms) {
            errors.push('Vous devez accepter les conditions générales');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    // Conversion en objet pour Google Sheets
    toSheetRow() {
        return {
            orderNumber: this.orderNumber,
            timestamp: this.timestamp,
            eventId: this.event.id,
            eventName: this.event.name,
            eventDate: this.event.date,
            eventVenue: this.event.venue,
            eventCity: this.event.city,
            ticketSection: this.ticket.section,
            ticketRow: this.ticket.row,
            ticketSeats: this.ticket.seats,
            ticketPrice: this.ticket.price,
            quantity: this.quantity,
            totalPrice: this.totalPrice,
            customerFirstName: this.customer.firstName,
            customerLastName: this.customer.lastName,
            customerEmail: this.customer.email,
            customerPhone: this.customer.phone,
            status: this.status,
            reservationExpiry: this.reservationExpiry.toISOString(),
            paymentMethod: this.customer.preferredPayment || 'Non spécifié'
        };
    }

    // Email de confirmation client
    getCustomerEmailHTML() {
        const lang = this.customer.language || 'fr';
        
        if (lang === 'fr') {
            return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ff006e 0%, #fb5607 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .order-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff006e; }
        .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .total { font-size: 1.5em; font-weight: bold; color: #ff006e; text-align: right; margin-top: 20px; }
        .button { display: inline-block; background: linear-gradient(135deg, #ff006e 0%, #fb5607 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 30px; font-weight: bold; margin: 10px 5px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 0.9em; }
        .highlight-box { background: #e3f2fd; padding: 20px; border-radius: 8px; border-left: 4px solid #2196F3; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Demande bien reçue !</h1>
            <p>Numéro : <strong>${this.orderNumber}</strong></p>
        </div>
        
        <div class="content">
            <p>Bonjour <strong>${this.customer.firstName} ${this.customer.lastName}</strong>,</p>
            
            <p>Merci pour votre commande ! Voici un récapitulatif de votre commande :</p>
            
            <div class="order-box">
                <h2 style="margin-top: 0; color: #ff006e;">📋 Votre demande</h2>
                <div class="info-row">
                    <span>Événement :</span>
                    <strong>${this.event.name}</strong>
                </div>
                <div class="info-row">
                    <span>Date :</span>
                    <strong>${new Date(this.event.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>
                </div>
                <div class="info-row">
                    <span>Heure :</span>
                    <strong>${this.event.time}</strong>
                </div>
                <div class="info-row">
                    <span>Lieu :</span>
                    <strong>${this.event.venue}, ${this.event.city}</strong>
                </div>
                <div class="info-row">
                    <span>Section :</span>
                    <strong>${this.ticket.section}</strong>
                </div>
                <div class="info-row">
                    <span>Rangée :</span>
                    <strong>${this.ticket.row}</strong>
                </div>
                <div class="info-row">
                    <span>Sièges :</span>
                    <strong>${this.ticket.seats}</strong>
                </div>
                <div class="info-row">
                    <span>Quantité :</span>
                    <strong>${this.quantity}</strong>
                </div>
                <div class="total">
                    Prix estimé : ${this.ticket.price * this.quantity}€
                </div>
            </div>
            
            <div class="highlight-box">
                <h3 style="margin-top: 0; color: #1976D2;">📞 Prochaines étapes</h3>
                <p><strong>Nous vous contactons sous 24h maximum pour finaliser votre commande</strong> pour :</p>
                <ul>
                    <li>✅ Confirmer la disponibilité des billets</li>
                    <li>✅ Vous communiquer le prix final</li>
                    <li>✅ Organiser le paiement et la livraison</li>
                </ul>
                <p style="margin-bottom: 0;">Nous vous contacterons par <strong>WhatsApp</strong> ou <strong>email</strong>.</p>
            </div>
            
            <h3>💬 Besoin d'une réponse rapide ?</h3>
            <p style="text-align: center;">
                <a href="https://wa.me/${CONFIG.WHATSAPP}?text=Bonjour%2C%20je%20viens%20de%20faire%20une%20demande%20%28${this.orderNumber}%29" class="button">
                    Nous contacter sur WhatsApp
                </a>
            </p>
            
            <div style="background: #f0f0f0; padding: 15px; border-radius: 8px; margin-top: 20px;">
                <p style="margin: 0; font-size: 0.9em; color: #666;">
                    <strong>📨 Conservez ce numéro de demande :</strong> ${this.orderNumber}<br>
                    Il vous sera demandé pour toute question concernant votre demande.
                </p>
            </div>
        </div>
        
        <div class="footer">
            <p>TicketHub - Votre marketplace de tickets premium</p>
            <p style="font-size: 0.8em; color: #999;">
                Cet email a été envoyé à ${this.customer.email}<br>
                Numéro de demande : ${this.orderNumber}
            </p>
        </div>
    </div>
</body>
</html>
            `;
        } else {
            // Version anglaise
            return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ff006e 0%, #fb5607 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .order-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff006e; }
        .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .total { font-size: 1.5em; font-weight: bold; color: #ff006e; text-align: right; margin-top: 20px; }
        .button { display: inline-block; background: linear-gradient(135deg, #ff006e 0%, #fb5607 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 30px; font-weight: bold; margin: 10px 5px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 0.9em; }
        .highlight-box { background: #e3f2fd; padding: 20px; border-radius: 8px; border-left: 4px solid #2196F3; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Request Received!</h1>
            <p>Number: <strong>${this.orderNumber}</strong></p>
        </div>
        
        <div class="content">
            <p>Hello <strong>${this.customer.firstName} ${this.customer.lastName}</strong>,</p>
            
            <p>Thank you for your request! Here's a summary:</p>
            
            <div class="order-box">
                <h2 style="margin-top: 0; color: #ff006e;">📋 Your Request</h2>
                <div class="info-row">
                    <span>Event:</span>
                    <strong>${this.event.name}</strong>
                </div>
                <div class="info-row">
                    <span>Date:</span>
                    <strong>${new Date(this.event.date).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>
                </div>
                <div class="info-row">
                    <span>Time:</span>
                    <strong>${this.event.time}</strong>
                </div>
                <div class="info-row">
                    <span>Venue:</span>
                    <strong>${this.event.venue}, ${this.event.city}</strong>
                </div>
                <div class="info-row">
                    <span>Section:</span>
                    <strong>${this.ticket.section}</strong>
                </div>
                <div class="info-row">
                    <span>Row:</span>
                    <strong>${this.ticket.row}</strong>
                </div>
                <div class="info-row">
                    <span>Seats:</span>
                    <strong>${this.ticket.seats}</strong>
                </div>
                <div class="info-row">
                    <span>Quantity:</span>
                    <strong>${this.quantity}</strong>
                </div>
                <div class="total">
                    Estimated price: €${this.ticket.price * this.quantity}
                </div>
            </div>
            
            <div class="highlight-box">
                <h3 style="margin-top: 0; color: #1976D2;">📞 Next Steps</h3>
                <p><strong>We will contact you within 24 hours</strong> to:</p>
                <ul>
                    <li>✅ Confirm ticket availability</li>
                    <li>✅ Share the final price</li>
                    <li>✅ Arrange payment and delivery</li>
                </ul>
                <p style="margin-bottom: 0;">We will reach you via <strong>WhatsApp</strong> or <strong>email</strong>.</p>
            </div>
            
            <h3>💬 Need a quick response?</h3>
            <p style="text-align: center;">
                <a href="https://wa.me/${CONFIG.WHATSAPP}?text=Hello%2C%20I%20just%20made%20a%20request%20%28${this.orderNumber}%29" class="button">
                    Contact us on WhatsApp
                </a>
            </p>
            
            <div style="background: #f0f0f0; padding: 15px; border-radius: 8px; margin-top: 20px;">
                <p style="margin: 0; font-size: 0.9em; color: #666;">
                    <strong>📨 Keep this request number:</strong> ${this.orderNumber}<br>
                    You will need it for any questions about your request.
                </p>
            </div>
        </div>
        
        <div class="footer">
            <p>TicketHub - Your premium ticket marketplace</p>
            <p style="font-size: 0.8em; color: #999;">
                This email was sent to ${this.customer.email}<br>
                Request number: ${this.orderNumber}
            </p>
        </div>
    </div>
</body>
</html>
            `;
        }
    }

    // Email d'alerte admin
    getAdminEmailHTML() {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: monospace; background: #f5f5f5; padding: 20px; }
        .container { max-width: 700px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .alert { background: #ff006e; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px; }
        .info { background: #f0f0f0; padding: 15px; border-radius: 5px; margin: 10px 0; }
        .label { font-weight: bold; color: #666; }
        .actions { background: #e3f2fd; padding: 20px; border-radius: 5px; margin-top: 20px; text-align: center; }
        .btn { display: inline-block; padding: 15px 30px; margin: 5px; text-decoration: none; border-radius: 8px; font-weight: bold; color: white; }
        .btn-whatsapp { background: #25D366; }
        .btn-email { background: #4285f4; }
    </style>
</head>
<body>
    <div class="container">
        <div class="alert">
            <h1 style="margin: 0;">🔔 NOUVELLE DEMANDE</h1>
            <h2 style="margin: 10px 0 0 0;">${this.orderNumber}</h2>
        </div>
        
        <div class="info">
            <p><span class="label">📅 Date :</span> ${new Date(this.timestamp).toLocaleString('fr-FR')}</p>
            <p><span class="label">💰 Prix estimé :</span> <strong>${this.ticket.price * this.quantity}€</strong></p>
            <p><span class="label">🔢 Quantité :</span> ${this.quantity} billet(s)</p>
        </div>
        
        <h3>👤 Client</h3>
        <div class="info">
            <p><span class="label">Nom :</span> ${this.customer.firstName} ${this.customer.lastName}</p>
            <p><span class="label">Email :</span> <a href="mailto:${this.customer.email}">${this.customer.email}</a></p>
            <p><span class="label">Téléphone :</span> <a href="tel:${this.customer.phone}">${this.customer.phone}</a></p>
        </div>
        
        <h3>🎫 Événement</h3>
        <div class="info">
            <p><span class="label">Nom :</span> ${this.event.name}</p>
            <p><span class="label">Date :</span> ${new Date(this.event.date).toLocaleDateString('fr-FR')}</p>
            <p><span class="label">Heure :</span> ${this.event.time}</p>
            <p><span class="label">Lieu :</span> ${this.event.venue}, ${this.event.city}</p>
            <p><span class="label">Section :</span> ${this.ticket.section}</p>
            <p><span class="label">Rangée :</span> ${this.ticket.row}</p>
            <p><span class="label">Sièges :</span> ${this.ticket.seats}</p>
        </div>
        
        <div class="actions">
            <h3 style="margin-top: 0;">⚡ Contacter le client</h3>
            <p>
                <a href="https://wa.me/${formatPhoneForWhatsApp(this.customer.phone)}?text=Bonjour%20${this.customer.firstName}%2C%0A%0AConcernant%20votre%20demande%20${this.orderNumber}%20pour%20${encodeURIComponent(this.event.name)}%20%3A%0A%0A%F0%9F%8E%AB%20Les%20billets%20sont%20disponibles%20%21%0A%F0%9F%92%B0%20Prix%20%3A%20${this.ticket.price * this.quantity}%E2%82%AC%0A%0AComment%20souhaitez-vous%20proc%C3%A9der%20au%20paiement%20%3F" 
                   class="btn btn-whatsapp">
                    💬 WhatsApp
                </a>
                <a href="mailto:${this.customer.email}?subject=Votre%20demande%20${this.orderNumber}%20-%20TicketHub&body=Bonjour%20${this.customer.firstName}%2C%0A%0AConcernant%20votre%20demande%20pour%20${encodeURIComponent(this.event.name)}%20%3A%0A%0ALes%20billets%20sont%20disponibles.%0APrix%20%3A%20${this.ticket.price * this.quantity}%E2%82%AC%0A%0ACordialement%2C%0ATicketHub" 
                   class="btn btn-email">
                    📧 Email
                </a>
            </p>
            <p style="margin-top: 20px; font-size: 0.9em; color: #666;">
                💡 <strong>Prochaines étapes :</strong><br>
                1. Confirmer la disponibilité au client<br>
                2. Convenir du mode de paiement<br>
                3. Envoyer les billets après paiement
            </p>
        </div>
        
        <p style="text-align: center; color: #999; font-size: 0.85em; margin-top: 30px;">
            TicketHub Admin • ${new Date().toLocaleString('fr-FR')}
        </p>
    </div>
</body>
</html>
        `;
    }

    // Message WhatsApp de secours
    getWhatsAppMessage() {
        return encodeURIComponent(`🎫 *Nouvelle demande TicketHub*

Numéro : ${this.orderNumber}

📋 *Détails*
Événement : ${this.event.name}
Date : ${new Date(this.event.date).toLocaleDateString('fr-FR')}
Section : ${this.ticket.section}
Rangée : ${this.ticket.row}
Sièges : ${this.ticket.seats}
Quantité : ${this.quantity}

💰 *Prix estimé : ${this.ticket.price * this.quantity}€*

👤 *Client*
${this.customer.firstName} ${this.customer.lastName}
${this.customer.email}
${this.customer.phone}

⚡ Merci de me recontacter pour finaliser !`);
    }

    // Sauvegarde locale (localStorage)
    saveToLocalStorage() {
        try {
            const orders = JSON.parse(localStorage.getItem('tickethub_orders') || '[]');
            orders.push({
                orderNumber: this.orderNumber,
                timestamp: this.timestamp,
                event: this.event.name,
                total: this.totalPrice,
                status: this.status
            });
            localStorage.setItem('tickethub_orders', JSON.stringify(orders));
        } catch (e) {
            console.error('Error saving to localStorage:', e);
        }
    }
}

// Envoi de la commande à Google Sheets
async function submitOrderToSheets(order) {
    if (CONFIG.GOOGLE_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
        console.warn('Google Sheets URL not configured. Order saved locally only.');
        return { success: false, message: 'Configuration incomplète' };
    }

    try {
        const response = await fetch(CONFIG.GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(order.toSheetRow())
        });

        // Note: mode 'no-cors' ne permet pas de lire la réponse
        // On assume que ça a fonctionné
        return { success: true, message: 'Commande enregistrée' };
    } catch (error) {
        console.error('Error submitting to Sheets:', error);
        return { success: false, message: error.message };
    }
}

// Export des fonctions
window.TicketHubCheckout = {
    Order,
    submitOrderToSheets,
    CONFIG,
    generateOrderNumber,
    isValidEmail,
    isValidPhone
};

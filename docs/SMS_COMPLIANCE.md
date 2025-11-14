# Proof-of-Consent Documentation

**Waymaker.ai – Daily Reminder PWA – SMS Opt-In Flow**

**Version 1.1 – November 2025**

**Production Domain:** https://waymaker.ai

**Development environments** (e.g., localhost, Vercel previews) are excluded from compliance scope.

---

## 1. Consent Capture Points

| # | Method | UI / Message | Timestamp Stored | Proof Retained |
|---|--------|--------------|------------------|----------------|
| 1 | **Web Form** | "Set Up Your Daily Reminders" modal | `preferences_saved_at` (UTC) | DB row + IP address + user agent |
| 2 | **SMS Keyword** | User texts **JOIN** to Twilio number | `optin_sms_received_at` (UTC) | Twilio message SID + body |

---

## 2. Web Form Flow (Primary Opt-In)

### **Screen 1 – Preference Modal**

**Live at:** https://waymaker.ai/#/onboarding

**UI Elements:**
- Email Address field (required)
- Phone Number field (optional, E.164 format)
- Preferred Notification Time picker
- Notification Method radio buttons:
  - Email only
  - Email & SMS (if phone provided)

**Consent Logic:**
- **Phone blank** → Email only
- **Phone filled + "Email & SMS" selected** → **Explicit SMS consent**
- **"Save Preferences"** = affirmative act (no pre-checked boxes)
- Links to Privacy Policy and Terms of Service displayed when SMS is selected

### **Data Captured**

```json
{
  "user_id": "u_abc123",
  "email": "user@example.com",
  "phone": "+14155551234",
  "preferred_notification_time": "09:00",
  "notification_method": "both",
  "preferences_saved_at": "2025-11-14T18:42:01Z",
  "ip_address": "203.0.113.42",
  "user_agent": "Mozilla/5.0..."
}
```

**Database Fields:**
- `user_id` - UUID (foreign key to auth.users)
- `phone` - TEXT (E.164 format)
- `notification_method` - TEXT ('email', 'sms', 'both')
- `preferences_saved_at` - TIMESTAMPTZ (consent timestamp)
- `ip_address` - TEXT (optional, for audit trail)
- `user_agent` - TEXT (optional, for audit trail)

---

## 3. SMS Double Opt-In (Backup / Direct)

### **Step 1 – User texts JOIN**

**From:** +14155551234  
**To:** Your Twilio Number  
**Body:** JOIN

### **Step 2 – Twilio Auto-Reply**

```
✅ You're in! Daily reminders will start tomorrow at 9:00 AM.
Reply STOP to unsubscribe. Msg&data rates may apply.
```

### **Twilio Webhook Payload (Stored)**

```json
{
  "MessageSid": "SMxxxxxxxxxxxxxxxx",
  "From": "+14155551234",
  "To": "+14155559876",
  "Body": "JOIN",
  "optin_sms_received_at": "2025-11-14T18:45:22Z"
}
```

**Database Fields:**
- `optin_sms_received_at` - TIMESTAMPTZ (SMS keyword opt-in timestamp)
- Twilio message SID stored in webhook logs

---

## 4. Audit Trail (What We Retain)

| Artifact | Retention | Access |
|----------|-----------|--------|
| Web form DB row | 24 months | Admin dashboard |
| Form IP address | 24 months | Database query |
| Form user agent | 24 months | Database query |
| Twilio message logs (SID + body) | 18 months | Twilio Console → Programmable Messaging |
| STOP / HELP handling | Auto-logged | Twilio webhook + database |

---

## 5. Unsubscribe Flow

### **Reply STOP**
- Twilio auto-replies: "You're unsubscribed. No more messages. Reply START to restart."
- DB flag: `sms_opted_out = true`
- User removed from SMS notification queue immediately

### **Reply START**
- Twilio auto-replies: "SMS reminders re-enabled. Reply STOP to unsubscribe."
- DB flag: `sms_opted_out = false`
- User re-added to SMS notification queue

### **Reply HELP**
- Twilio auto-replies: "WayMaker SMS: Reply JOIN to subscribe, STOP to unsubscribe, START to restart. For support: support@waymaker.ai"

---

## 6. One-Click Export for Carriers / Twilio

### **SQL Query for Single User Consent**

```sql
SELECT 
  user_id,
  phone,
  notification_method,
  preferences_saved_at,
  optin_sms_received_at,
  sms_opted_out,
  ip_address,
  user_agent
FROM user_preferences 
WHERE phone = '+14155551234';
```

### **SQL Query for All SMS Opt-Ins**

```sql
SELECT 
  user_id,
  phone,
  notification_method,
  preferences_saved_at,
  optin_sms_received_at,
  sms_opted_out,
  ip_address
FROM user_preferences 
WHERE (notification_method = 'sms' OR notification_method = 'both')
  AND phone IS NOT NULL
  AND sms_opted_out = false
ORDER BY preferences_saved_at DESC;
```

### **Twilio Message SID Lookup**

```bash
# Via Twilio API
GET https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/Messages/{MessageSid}.json

# Via Twilio Console
# Navigate to: Phone Numbers → Logs → Messages
# Search by phone number or message SID
```

---

## 7. Compliance Checklist

- [x] Privacy Policy URL live and accessible: https://waymaker.ai/#/privacy
- [x] Terms of Service URL live and accessible: https://waymaker.ai/#/terms
- [x] Explicit consent required (no pre-checked boxes)
- [x] Clear disclosure of message frequency and costs
- [x] Easy opt-out mechanism (STOP keyword)
- [x] Opt-out confirmation message sent
- [x] Opt-in re-enable mechanism (START keyword)
- [x] Consent timestamps stored
- [x] IP address and user agent captured (optional but recommended)
- [x] Twilio message SIDs logged
- [x] Audit trail queries functional

---

## 8. Data Retention Policy

- **SMS consent records:** Retained for 24 months (TCPA requirement)
- **DiRP data:** Retained while account is active, deleted within 30 days of account deletion
- **Twilio message logs:** Retained per Twilio's retention policy (typically 18 months)
- **IP addresses:** Retained for 24 months for compliance audits

---

## 9. Contact Information for Compliance Inquiries

**Email:** support@waymaker.ai  
**Website:** https://waymaker.ai  
**Twilio Account:** [Account SID from environment variables]

---

## 10. Regulatory Compliance

This documentation supports compliance with:
- **TCPA (Telephone Consumer Protection Act)** - US SMS regulations
- **CAN-SPAM Act** - Email marketing regulations
- **GDPR** - General Data Protection Regulation (EU)
- **CCPA** - California Consumer Privacy Act

---

**Last Updated:** November 2025  
**Next Review:** November 2026


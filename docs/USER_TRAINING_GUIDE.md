# Hawala System - User Training Guide
## New Security Features - Version 2.0

---

## 🎯 Who Should Read This Guide

This guide is for:
- **Hawaladar Staff**: Users who create and process hawala transactions
- **Administrators**: Users who manage the system and generate reports
- **Training Coordinators**: Staff responsible for onboarding new users

---

## 📋 TABLE OF CONTENTS

1. [What's New in Version 3.0](#whats-new)
2. [Creating a Transaction](#creating-transaction)
3. [Processing Payout](#processing-payout)
4. [Transaction Expiration](#expiration)
5. [Using Reports](#reports)
6. [Security Best Practices](#security)
7. [Troubleshooting](#troubleshooting)

---

## <a name="whats-new"></a>1. WHAT'S NEW IN VERSION 3.0 🆕

### Major Changes:

#### **1.1 Separate Transaction Views**
- **Outgoing (Sending Out):** View all transactions you're sending to other hawaladars
- **Incoming (Receiving for Payout):** View all transactions coming to you for payout
- **Why:** Easier to manage and track different transaction types

#### **1.2 Manual Reference Code Entry** 📝
- **Incoming transactions:** Enter the reference code provided by the sender
- **Outgoing transactions:** System generates unique reference code automatically
- **Format:** `HWL-XXX-YYYY-NNNNNN` (e.g., HWL-KBL-2026-000123)

#### **1.3 Transaction Expiration** ⏰
- Transactions expire after **7 days**
- Expired transactions cannot be paid out
- Receiver must contact sender for new transaction

#### **1.4 New Reports Sidebar** 📊
- **Summary View:** Quick overview of all hawala activity
- **Sub-reports:** Access specific reports from sidebar
  - Net Position Report
  - Unpaid Transactions Report
  - Commission Report
  - Daily Cash Flow Report
  - Transaction Aging Report

#### **1.5 Enhanced Security** 🛡️
- Identity verification with Tazkira (ID) and phone number
- Double payout prevention
- Complete audit trail
- Transaction limits to prevent unauthorized large transfers

---

## <a name="creating-transaction"></a>2. CREATING A TRANSACTION

### Step-by-Step Process:

#### **Step 1: Navigate to Hawala Page**
- Click on "Hawala" in the main menu
- Click "New Transaction" button

#### **Step 2: Select Transaction Direction**
- **Outgoing (Sending Out)**: You are sending money OUT to another hawaladar location
  - System will generate a unique reference code
  - Share this code with the receiver
- **Incoming (Receiving for Payout)**: You are receiving money IN from another hawaladar
  - You must enter the reference code provided by the sender
  - This code links the transaction to the original sender's transaction

#### **Step 3: Enter Reference Code (For Incoming Transactions Only)**

**If creating INCOMING transaction:**
- Enter the reference code given by the sending hawaladar
- Format: `HWL-XXX-YYYY-NNNNNN`
- System will validate the code
- This ensures the transaction is properly linked

**If creating OUTGOING transaction:**
- Skip this step - system generates code automatically

#### **Step 4: Enter Transaction Details**

**Sender Information:**
- Full Name (required)
- Phone Number (optional but recommended)
- Sender Location (if using account)

**Receiver Information:**
- Full Name (required)
- Phone Number (required)
- Destination Location (required)

**Transaction Amount:**
- Enter the amount to send
- Select currency
- Choose commission type:
  - **Add**: Sender pays extra commission
  - **Deduct**: Receiver gets amount minus commission

#### **Step 5: Review and Confirm**
- Check all details carefully
- Verify amounts and commission calculation
- Click "Create Transaction"

#### **Step 6: IMPORTANT - Save the Reference Code** 🔑

**For OUTGOING transactions, the system will show:**
```
Transaction Created Successfully!

Reference Code: HWL-KBL-2026-000123
Amount: $1,000
Commission: $20
Total: $1,020
Receiver: Ahmed Khan
Destination: Herat Hawaladar
```

**What to do:**
1. **Write down the reference code** on the printed receipt
2. **Give receipt to sender**
3. Sender must share reference code with receiver
4. Print receipt for your records

#### **Step 7: Contact Receiving Hawaladar**
- Call the destination hawaladar
- Share: Reference Code, Amount, Receiver Name, Receiver Phone
- Confirm they will expect the receiver to come for payout
- Keep record of the call

---

## <a name="processing-payout"></a>3. PROCESSING PAYOUT (RECEIVER SIDE)

### When Receiver Arrives:

#### **Step 1: Search for Transaction**
- Click "Search by Code"
- Enter the reference code
- Transaction details will appear

#### **Step 2: Verify Receiver Identity** 🆔

**Required Documents:**
- **Tazkira (ID Card)**: Required
- **Phone Number**: Must match transaction

**Verification Process:**
1. Ask receiver for their Tazkira
2. Check the name matches transaction
3. Enter Tazkira number (6-20 digits)
4. Verify phone number matches

#### **Step 3: Complete Payout**

**Enter in System:**
- Tazkira Number: [Required] - Must match receiver's ID
- Phone Number: [Required] - Must match transaction record

**Click "Complete Payout"**

**System will check:**
- ✅ Transaction is not expired
- ✅ Transaction not already paid
- ✅ Tazkira and phone match records
- ✅ You are authorized to process this transaction

#### **Step 4: Hand Over Cash**
- Give cash to receiver
- Ask receiver to count
- Get signature on receipt (if using paper records)

---

## <a name="expiration"></a>4. TRANSACTION EXPIRATION ⏰

### Default Expiration: 7 Days

Every transaction expires **7 days** after creation.

### Why Expiration?

- Prevents old/stale transactions from being claimed
- Reduces fraud risk
- Keeps system clean and organized

### What Happens When Transaction Expires?

**If transaction is pending and expired:**
- System shows error: "Transaction has expired"
- Payout cannot be completed
- Receiver must contact sender

**If transaction is completed before expiration:**
- No problem! Expiration only affects pending transactions

### Handling Expired Transactions:

**For Receiver:**
1. Contact sender
2. Sender creates **new transaction**
3. Use new reference code and PIN

**For Sender:**
1. Create new transaction with same details
2. New PIN will be generated
3. Share new code and PIN with receiver

### Checking Expiration Date:

When searching for transaction, system shows:
```
Created: January 15, 2026
Expires: January 22, 2026 (in 5 days)
Status: Pending
```

**Alert Colors:**
- 🟢 Green (>3 days remaining): OK
- 🟡 Yellow (1-3 days remaining): Process soon
- 🔴 Red (Expired): Cannot process

---

## <a name="reports"></a>5. USING REPORTS 📊

### How to Access Reports

**Navigation:**
1. Go to Hawala page
2. Click on **"Reports"** in the left sidebar
3. Sidebar expands to show report options

### 5.1 Summary (Default View)

**What it shows:** Overall hawala system overview

**Includes:**
- Total Transactions count
- Pending Transactions count
- Completed Transactions count
- Cancelled Transactions count
- Reports by Agent (hawaladar)
- Reports by Currency

**How to access:**
1. Click "Reports" in sidebar
2. Click "Summary" (selected by default)

**Use case:** Quick overview of system health and activity

---

### 5.2 Net Position Report

**What it shows:** Who owes money to whom between hawaladars

**Use case:** Monthly reconciliation between hawaladars

**How to access:**
1. Click "Reports" in sidebar
2. Click "Net Position"
3. Select currency filter (optional)

**Example:**
```
Kabul ↔ Herat
Kabul sent to Herat: $10,000
Herat sent to Kabul: $5,000
Net: Herat owes Kabul $5,000
Status: Herat is Debtor
```

**Key Metrics:**
- Total Pairs: Number of hawaladar pairs with transactions
- Creditor Positions: Hawaladars owed money
- Debtor Positions: Hawaladars owing money
- Balanced Positions: Even transactions both ways

---

### 5.3 Unpaid Transactions Report

**What it shows:** All transactions waiting for payout

**Use case:** Track pending transactions, follow up with receivers

**How to access:**
1. Click "Reports" in sidebar
2. Click "Unpaid"
3. View all unpaid transactions

**Information shown:**
- Reference Code
- Sender and Receiver details
- Amount and Currency
- Days Pending
- Expiration status

**Alerts:**
- 🟢 0-3 days: Normal
- 🟡 3-5 days: Follow up soon
- 🔴 5-7 days: Urgent - will expire!
- ⚠️ 7+ days: Expired

**Use case:** Daily monitoring, identify stuck transactions

---

### 5.4 Commission Report

**What it shows:** Commission earned by each hawaladar

**Use case:** Financial reporting, performance tracking

**How to access:**
1. Click "Reports" in sidebar
2. Click "Commission"
3. Select date range (optional)
4. Select hawaladar filter (optional)

**Metrics:**
- Total Transactions per hawaladar
- Total Commission earned
- Currency breakdown
- Average commission per transaction
- Top earning hawaladar

**Use for:**
- Monthly financial reporting
- Performance evaluation
- Commission reconciliation

---

### 5.5 Daily Cash Flow Report

**What it shows:** Daily financial activity for hawaladars

**Use case:** End-of-day reconciliation

**How to access:**
1. Click "Reports" in sidebar
2. Click "Cash Flow"
3. Select date
4. Select hawaladar (or view all)

**Shows:**
- Opening Balance (start of day)
- Cash In (received transactions)
- Cash Out (sent transactions)
- Net Flow (difference)
- Closing Balance (end of day)
- Transaction counts

**Use for:**
- Daily cash reconciliation
- Identifying cash shortages/surpluses
- End-of-day reporting

---

### 5.6 Transaction Aging Report

**What it shows:** Age distribution of pending transactions

**Use case:** Identify stuck or delayed transactions

**How to access:**
1. Click "Reports" in sidebar
2. Click "Aging"
3. View age bracket breakdown

**Age Brackets:**
- **0-24 hours** (Fresh): Recently created, normal
- **1-3 days** (Recent): Monitor, usually normal
- **3-7 days** (Aging): Follow up needed
- **7+ days** (Critical): Will expire, urgent action required

**Metrics:**
- Total Pending Transactions
- Total Amount pending
- Count per age bracket
- Percentage distribution

**Alerts:**
- Warning for 3-7 day old transactions
- Error alert for 7+ day old transactions

**Use for:**
- Identifying problem transactions
- Following up with receivers
- Preventing expirations

---

## <a name="security"></a>6. SECURITY BEST PRACTICES 🛡️

### For Creating Transactions:

1. **Always verify sender identity**
   - Check Tazkira (National ID)
   - Confirm phone number
   - Record sender information accurately

2. **Write reference code clearly**
   - Print receipt immediately
   - Ensure reference code is readable
   - Give receipt to sender

3. **Protect transaction information**
   - Hand receipt to sender privately
   - Don't display sensitive details where others can see
   - Keep computer screen private

4. **Double-check amounts**
   - Confirm with sender before creating
   - Review commission calculation
   - Verify currency is correct

5. **For incoming transactions**
   - Enter reference code exactly as provided
   - Verify code format is correct
   - Confirm with sending hawaladar if unsure

### For Processing Payouts:

1. **Verify identity carefully**
   - Check Tazkira photo matches person
   - Confirm Tazkira number matches transaction
   - Verify name matches exactly

2. **Check phone number**
   - Should match transaction record
   - If different, call sender to verify
   - Don't proceed if phone doesn't match

3. **Confirm transaction details**
   - Review amount and currency
   - Check transaction hasn't expired
   - Verify transaction status is "pending"

4. **Don't rush**
   - Take time to verify all details
   - Better safe than sorry
   - If suspicious, contact sender

### General Security:

1. **Log out when leaving computer**
   - Don't leave system accessible
   - Protect your account

2. **Don't share your password**
   - Each user has own account
   - Accountability is important

3. **Report suspicious activity**
   - Multiple failed PIN attempts
   - Unusual transaction patterns
   - Contact administrator

4. **Keep receipts organized**
   - Filed by date
   - Easy to reference if issues arise

---

## <a name="troubleshooting"></a>7. TROUBLESHOOTING ❓

### Issue 1: "Reference code already exists" Error (Incoming Transaction)

**Cause:** The reference code you entered has already been used

**Solution:**
1. Verify the reference code with sending hawaladar
2. Check if transaction was already created
3. If duplicate, use the existing transaction
4. If code is wrong, get correct code from sender

### Issue 2: "Transaction Expired" Error

**Cause:** More than 7 days since transaction creation

**Solution:**
1. Explain to receiver transaction expired
2. Receiver should contact sender
3. Sender creates new transaction
4. Use new reference code and PIN

### Issue 3: "Transaction Already Completed" Error

**Cause:** Transaction was already paid out

**Solution:**
1. Check transaction history
2. Verify who completed payout and when
3. Possible duplicate claim - investigate

### Issue 4: "Insufficient Balance" Error

**Cause:** Not enough funds in hawaladar account

**Solution:**
1. Check current account balance
2. Make deposit if needed
3. Or process as cash transaction (no account deduction)

### Issue 5: "Daily Limit Exceeded" Error

**Cause:** Total transactions today exceed daily limit

**Solution:**
1. Wait until tomorrow
2. Or contact administrator to increase limit
3. Review if legitimate business need

### Issue 6: Can't Find Transaction by Code

**Cause:** Wrong code, or transaction not created yet

**Solution:**
1. Verify reference code format: HWL-XXX-YYYY-NNNNNN
2. Check if all characters correct (O vs 0, I vs 1)
3. Contact sending hawaladar to verify code

---

## 📞 SUPPORT & TRAINING

### Getting Help:

**For System Issues:**
- Contact: IT Support / System Administrator
- Email: support@example.com
- Phone: [Support Number]

**For Training:**
- Review this guide regularly
- Ask supervisor for help
- Practice with test transactions

### Additional Resources:

- **Quick Reference Card**: Printed guide for daily use
- **Video Tutorials**: Available on training portal
- **FAQ Document**: Common questions and answers

---

## ✅ DAILY CHECKLIST

**Morning:**
- [ ] Log into system
- [ ] Check pending transactions from yesterday
- [ ] Review daily cash flow report

**During Day:**
- [ ] Verify Tazkira for every payout
- [ ] Check phone number matches for payouts
- [ ] Write reference codes clearly on receipts
- [ ] Keep workspace secure
- [ ] Monitor Reports > Unpaid for aging transactions

**Evening:**
- [ ] Generate end-of-day report
- [ ] Reconcile cash
- [ ] Follow up on old pending transactions
- [ ] Log out of system

---

## 📝 KEY REMINDERS

1. **Separate transaction views:** Outgoing (sending) and Incoming (receiving)
2. **Manual reference code entry** for incoming transactions
3. **Transactions expire after 7 days**
4. **Always verify receiver identity** with Tazkira and phone
5. **Use Reports sidebar** for quick access to all reports
6. **Check Summary** daily for system overview
7. **Monitor Unpaid report** for aging transactions
8. **Security is everyone's responsibility**

---

**Training Version:** 3.0
**Last Updated:** January 30, 2026
**For Questions:** Contact your supervisor or system administrator

---

**🎓 TRAINING CERTIFICATION**

I have read and understood the Hawala System Version 3.0 User Training Guide.

Name: _______________________
Signature: ___________________
Date: _______________________
Hawaladar Location: _____________
Supervisor Signature: _______________

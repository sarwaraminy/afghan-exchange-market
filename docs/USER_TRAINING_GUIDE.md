# 📘 Hawala System - User Training Guide
**Version 3.0** | Last Updated: January 30, 2026

<div style="display: flex; gap: 20px;">

<!-- SIDEBAR -->
<div style="width: 250px; background: #f8fafc; padding: 20px; border-radius: 8px;">

### 📑 Contents

**Getting Started**
- [Overview](#overview)
- [Who This Guide Is For](#audience)
- [What's New in v3.0](#whats-new)

**Core Features**
- [Navigation Guide](#navigation)
- [Transaction Management](#transactions)
  - [Creating Transactions](#creating-transaction)
  - [Processing Payouts](#processing-payout)
  - [Transaction Types](#transaction-types)
- [Reports System](#reports)
  - [Summary Dashboard](#reports-summary)
  - [Net Position](#reports-net-position)
  - [Unpaid Transactions](#reports-unpaid)
  - [Commission Tracking](#reports-commission)
  - [Cash Flow](#reports-cash-flow)
  - [Transaction Aging](#reports-aging)

**Administration**
- [Security Best Practices](#security)
- [Daily Operations](#daily-operations)
- [Troubleshooting](#troubleshooting)

**Reference**
- [Quick Reference](#quick-reference)
- [Glossary](#glossary)
- [Support](#support)

</div>

<!-- MAIN CONTENT -->
<div style="flex: 1;">

---

## <a id="overview"></a>📖 Overview

The Afghan Exchange Hawala System is a comprehensive money transfer management platform designed for hawaladar operations in Afghanistan. This guide covers all features, workflows, and best practices for Version 3.0.

### System Purpose
- Manage hawala money transfers between locations
- Track transactions with unique reference codes
- Monitor pending payouts and aging transactions
- Generate comprehensive financial reports
- Ensure secure and verified transactions

---

## <a id="audience"></a>🎯 Who This Guide Is For

This training guide is designed for:

| Role | Responsibilities |
|------|------------------|
| **Hawaladar Staff** | Create and process hawala transactions daily |
| **Branch Managers** | Monitor operations and generate reports |
| **Administrators** | Manage system settings and user access |
| **Training Coordinators** | Onboard and train new staff members |

---

## <a id="whats-new"></a>🆕 What's New in Version 3.0

### 1. **Separated Transaction Views**
```
✨ New Feature
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
View transactions in dedicated tabs:
  • Outgoing Tab → Transactions you're sending
  • Incoming Tab → Transactions you're receiving

Why? Better organization and faster workflow
```

### 2. **Manual Reference Code Entry**
```
📝 Enhanced Feature
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Incoming transactions now require manual code entry
  • Links directly to sender's transaction
  • Prevents duplicate entries
  • Ensures proper tracking

Format: HWL-XXX-YYYY-NNNNNN
Example: HWL-KBL-2026-000123
```

### 3. **Reports Sidebar Navigation**
```
📊 New UI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Access all reports from expandable sidebar:
  📈 Summary (Default)
  ⚖️ Net Position
  ⏰ Unpaid Transactions
  💰 Commission Report
  💵 Daily Cash Flow
  📅 Transaction Aging

Click Reports → Select report type
```

### 4. **Simplified Security**
```
🔐 Updated
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Removed: Secret PIN system
Now Using: Tazkira + Phone verification

Simpler, faster, and equally secure
```

---

## <a id="navigation"></a>🧭 Navigation Guide

### Main Menu Structure

```
┌─────────────────────────────────────┐
│  AFGHAN EXCHANGE                    │
├─────────────────────────────────────┤
│  📊 Dashboard                       │
│  💱 Rates                           │
│  🔄 Converter                       │
│  📈 Gold                            │
│  💸 Hawala                          │ ← You are here
│     ├─ Transactions                 │
│     │   ├─ Outgoing                 │
│     │   └─ Incoming                 │
│     ├─ Hawaladars                   │
│     ├─ Reports                      │ ← Expandable
│     │   ├─ Summary                  │
│     │   ├─ Net Position             │
│     │   ├─ Unpaid                   │
│     │   ├─ Commission               │
│     │   ├─ Cash Flow                │
│     │   └─ Aging                    │
│     └─ Savings Accounts             │
└─────────────────────────────────────┘
```

### Quick Actions Bar
Located at the top of each section:
- **🔍 Search by Code** - Find transaction by reference code
- **➕ New Transaction** - Create new hawala transfer
- **📄 Print Receipt** - Generate transaction receipt

---

## <a id="transactions"></a>💸 Transaction Management

### <a id="transaction-types"></a>Understanding Transaction Types

#### Outgoing Transactions (Sending)
```
You → Other Hawaladar
━━━━━━━━━━━━━━━━━━━━━━
When to use:
  ✓ Customer wants to send money to another location
  ✓ You are the sending hawaladar

What happens:
  1. System generates reference code
  2. You share code with receiver
  3. Receiver can claim at destination
```

#### Incoming Transactions (Receiving)
```
Other Hawaladar → You
━━━━━━━━━━━━━━━━━━━━━━
When to use:
  ✓ Another hawaladar sent money to your location
  ✓ Customer will receive money from you

What happens:
  1. You enter reference code from sender
  2. System validates and links transaction
  3. You process payout to receiver
```

---

## <a id="creating-transaction"></a>📝 Creating a Transaction

### Step-by-Step Workflow

#### Step 1: Access Transaction Form
```
Navigation:
  Hawala → Transactions → New Transaction button
```

#### Step 2: Select Transaction Direction

<table>
<tr>
<td width="50%">

**Outgoing (Sending)**
```
┌─────────────────────────┐
│ ⬆️ OUTGOING            │
│ (Sending Out)           │
├─────────────────────────┤
│ You send money to       │
│ another hawaladar       │
│                         │
│ System will generate    │
│ reference code          │
└─────────────────────────┘
```

</td>
<td width="50%">

**Incoming (Receiving)**
```
┌─────────────────────────┐
│ ⬇️ INCOMING            │
│ (Receiving for Payout)  │
├─────────────────────────┤
│ You receive money from  │
│ another hawaladar       │
│                         │
│ Enter reference code    │
│ from sender             │
└─────────────────────────┘
```

</td>
</tr>
</table>

#### Step 3: Enter Transaction Details

**For INCOMING transactions:**
```
┌────────────────────────────────────────┐
│ Reference Code *                       │
│ ┌────────────────────────────────────┐ │
│ │ HWL-XXX-YYYY-NNNNNN               │ │
│ └────────────────────────────────────┘ │
│ Enter code provided by sender          │
└────────────────────────────────────────┘
```

**Transaction Information:**
```
┌─────────────────────────────────────────────┐
│ SENDER INFORMATION                          │
├─────────────────────────────────────────────┤
│ Full Name:        [Ahmad Khan            ] │
│ Phone Number:     [+93 700 123 456      ] │
│ Sender Hawaladar: [Select...             ] │
├─────────────────────────────────────────────┤
│ RECEIVER INFORMATION                        │
├─────────────────────────────────────────────┤
│ Full Name:        [Hassan Ali           ] │
│ Phone Number:     [+93 777 654 321      ] │
│ Receiver Hawaladar: [Select...           ] │
├─────────────────────────────────────────────┤
│ AMOUNT & COMMISSION                         │
├─────────────────────────────────────────────┤
│ Amount:           [1,000                 ] │
│ Currency:         [USD ▼                 ] │
│ Commission Type:  [Add ▼                 ] │
│ Commission Rate:  [2.0%                  ] │
│                                             │
│ Commission:       $20.00                    │
│ Total:            $1,020.00                 │
└─────────────────────────────────────────────┘
```

#### Step 4: Review and Confirm

**Pre-Submission Checklist:**
- [ ] Verify sender name spelling
- [ ] Confirm phone numbers are correct
- [ ] Check amount and currency
- [ ] Review commission calculation
- [ ] Verify hawaladar selection

```
┌──────────────────────────────────────┐
│     [Cancel]    [Create Transaction] │
└──────────────────────────────────────┘
```

#### Step 5: Save Reference Code (Outgoing Only)

**Success Message:**
```
╔════════════════════════════════════════╗
║  ✅ Transaction Created Successfully! ║
╠════════════════════════════════════════╣
║                                        ║
║  Reference Code:  HWL-KBL-2026-000123  ║
║  Amount:          $1,000.00            ║
║  Commission:      $20.00               ║
║  Total:           $1,020.00            ║
║                                        ║
║  Receiver:        Hassan Ali           ║
║  Destination:     Herat Hawaladar      ║
║                                        ║
║  ⚠️  IMPORTANT:                        ║
║  Write reference code on receipt       ║
║  Share code with receiver              ║
║                                        ║
║     [Print Receipt]     [Close]        ║
╚════════════════════════════════════════╝
```

#### Step 6: Contact Receiving Hawaladar

**Communication Checklist:**
```
Call Checklist
━━━━━━━━━━━━━━━━━━━━━━━━
☐ Reference Code: HWL-KBL-2026-000123
☐ Amount: $1,000.00
☐ Receiver Name: Hassan Ali
☐ Receiver Phone: +93 777 654 321
☐ Expected arrival: [Date/Time]
☐ Record call date/time
```

---

## <a id="processing-payout"></a>💰 Processing Payout

### When Receiver Arrives

#### Step 1: Search for Transaction

```
┌─────────────────────────────────────┐
│  🔍 Search by Reference Code        │
├─────────────────────────────────────┤
│  [HWL-KBL-2026-000123          ] 🔎 │
└─────────────────────────────────────┘
```

**Transaction Display:**
```
╔════════════════════════════════════════╗
║  Transaction Details                   ║
╠════════════════════════════════════════╣
║  Reference Code:  HWL-KBL-2026-000123  ║
║  Status:          ⏳ Pending           ║
║  Created:         Jan 25, 2026 10:30AM ║
║  Expires:         Feb 01, 2026 10:30AM ║
║  Days Pending:    5 days               ║
║                                        ║
║  Amount:          $1,000.00            ║
║  Commission:      $20.00               ║
║  Total:           $1,020.00            ║
║                                        ║
║  Receiver:        Hassan Ali           ║
║  Phone:           +93 777 654 321      ║
╚════════════════════════════════════════╝
```

#### Step 2: Verify Receiver Identity

```
Identity Verification
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Required Documents:
  ✓ Tazkira (National ID Card)
  ✓ Phone number verification

Verification Process:
  1. Check Tazkira photo matches person
  2. Verify name matches transaction
  3. Confirm Tazkira number
  4. Verify phone number
```

**Payout Form:**
```
┌─────────────────────────────────────────┐
│  Complete Payout                        │
├─────────────────────────────────────────┤
│  Tazkira Number: *                      │
│  ┌────────────────────────────────────┐ │
│  │ [Enter 6-20 digits             ]  │ │
│  └────────────────────────────────────┘ │
│                                         │
│  Phone Number: *                        │
│  ┌────────────────────────────────────┐ │
│  │ [Must match: +93 777 654 321   ]  │ │
│  └────────────────────────────────────┘ │
│                                         │
│  Receiver Name Verification:            │
│  ┌────────────────────────────────────┐ │
│  │ [Type: Hassan Ali              ]  │ │
│  └────────────────────────────────────┘ │
│                                         │
│     [Cancel]    [Complete Payout]       │
└─────────────────────────────────────────┘
```

#### Step 3: System Validation

**Automatic Checks:**
```
System Verification
━━━━━━━━━━━━━━━━━━━━━━
✅ Transaction is not expired
✅ Transaction not already paid
✅ Tazkira number matches record
✅ Phone number matches record
✅ You are authorized hawaladar
✅ All validations passed

Status: Ready for payout
```

#### Step 4: Hand Over Cash

**Final Steps:**
```
Cash Handover Protocol
━━━━━━━━━━━━━━━━━━━━━━━━
1. Count cash: $1,000.00
2. Hand to receiver
3. Ask receiver to count
4. Get signature (optional)
5. Mark transaction complete
6. Print receipt for receiver
```

---

## <a id="reports"></a>📊 Reports System

### Accessing Reports

```
Navigation:
  Hawala → Reports (sidebar) → Click to expand

Reports Menu:
  📈 Summary              ← Default view
  ⚖️ Net Position
  ⏰ Unpaid
  💰 Commission
  💵 Cash Flow
  📅 Aging
```

---

### <a id="reports-summary"></a>📈 Summary Dashboard (Default View)

**What It Shows:**
Overall system health and activity metrics

**Key Metrics:**
```
┌────────────────┬────────────────┬────────────────┬────────────────┐
│ Total Trans.   │ Pending        │ Completed      │ Cancelled      │
│      245       │      18        │      220       │       7        │
│                │                │                │                │
│ All time       │ Need action    │ Successful     │ Voided         │
└────────────────┴────────────────┴────────────────┴────────────────┘
```

**Reports by Agent:**
```
╔══════════════════════════════════════════════════════════╗
║ Hawaladar          │ Sent    │ Received │ Commission    ║
╠══════════════════════════════════════════════════════════╣
║ Kabul Branch       │  45     │  38      │ $1,245.50     ║
║ Herat Branch       │  38     │  42      │ $1,180.00     ║
║ Kandahar Branch    │  29     │  31      │   $890.25     ║
╚══════════════════════════════════════════════════════════╝
```

**Use Case:** Daily overview and quick health check

---

### <a id="reports-net-position"></a>⚖️ Net Position Report

**What It Shows:**
Who owes money to whom between hawaladar pairs

**Report Format:**
```
╔═════════════════════════════════════════════════════════════╗
║ Pair                     │ Net Balance    │ Status          ║
╠═════════════════════════════════════════════════════════════╣
║ Kabul ↔ Herat           │ +$2,500.00     │ Kabul Creditor  ║
║ Herat ↔ Kandahar        │ -$1,800.00     │ Herat Debtor    ║
║ Kabul ↔ Kandahar        │     $0.00      │ Balanced        ║
╚═════════════════════════════════════════════════════════════╝
```

**Example:**
```
Kabul ↔ Herat Breakdown
━━━━━━━━━━━━━━━━━━━━━━━━
Kabul sent to Herat:   $10,000.00
Herat sent to Kabul:   $ 7,500.00
─────────────────────────────────
Net Position:          $ 2,500.00
Status: Herat owes Kabul
```

**Use Case:** Monthly reconciliation and settlement

---

### <a id="reports-unpaid"></a>⏰ Unpaid Transactions Report

**What It Shows:**
All pending transactions with aging information

**Alert Levels:**
```
🟢 0-3 days    Normal - Recently created
🟡 3-5 days    Warning - Follow up soon
🔴 5-7 days    Urgent - Will expire soon!
⚠️ 7+ days     Critical - Expired!
```

**Report View:**
```
╔═══════════════════════════════════════════════════════════════════╗
║ Code              │ Receiver    │ Amount     │ Age    │ Alert     ║
╠═══════════════════════════════════════════════════════════════════╣
║ HWL-KBL-2026-001  │ Ahmad K.    │ $1,000.00  │ 2 days │ 🟢       ║
║ HWL-HRT-2026-045  │ Hassan A.   │ $2,500.00  │ 4 days │ 🟡       ║
║ HWL-KBL-2026-003  │ Fahim R.    │   $800.00  │ 6 days │ 🔴       ║
║ HWL-KDH-2026-021  │ Rashid M.   │ $1,200.00  │ 8 days │ ⚠️       ║
╚═══════════════════════════════════════════════════════════════════╝
```

**Use Case:** Daily monitoring and follow-ups

---

### <a id="reports-commission"></a>💰 Commission Report

**What It Shows:**
Commission earned by each hawaladar

**Report Structure:**
```
╔════════════════════════════════════════════════════════════════╗
║ Hawaladar          │ Transactions │ Commission  │ Avg/Trans   ║
╠════════════════════════════════════════════════════════════════╣
║ Kabul Branch       │     45       │ $1,245.50   │  $27.68     ║
║ Herat Branch       │     42       │ $1,180.00   │  $28.10     ║
║ Kandahar Branch    │     31       │   $890.25   │  $28.72     ║
╠════════════════════════════════════════════════════════════════╣
║ 🏆 Top Earner:     │ Kabul Branch │ $1,245.50   │             ║
╚════════════════════════════════════════════════════════════════╝
```

**Filters Available:**
- Date Range: Last 7/30/90 days or custom
- Hawaladar: All or specific branch
- Currency: All or specific currency

**Use Case:** Financial reporting and performance tracking

---

### <a id="reports-cash-flow"></a>💵 Daily Cash Flow Report

**What It Shows:**
Daily financial activity for hawaladars

**Report Layout:**
```
╔════════════════════════════════════════════════════════════════════╗
║ Hawaladar     │ Opening  │ Cash In  │ Cash Out │ Net    │ Closing ║
╠════════════════════════════════════════════════════════════════════╣
║ Kabul Branch  │ $5,000   │ $3,200   │ $2,800   │ +$400  │ $5,400  ║
║               │          │ (12 txn) │ (10 txn) │        │         ║
╠════════════════════════════════════════════════════════════════════╣
║ Herat Branch  │ $4,200   │ $2,800   │ $3,500   │ -$700  │ $3,500  ║
║               │          │ (10 txn) │ (14 txn) │        │         ║
╚════════════════════════════════════════════════════════════════════╝
```

**Use Case:** End-of-day reconciliation

---

### <a id="reports-aging"></a>📅 Transaction Aging Report

**What It Shows:**
Age distribution of pending transactions

**Age Brackets:**
```
┌───────────────────────────────────────────────────────┐
│  0-24 hours (Fresh)      │ 15 transactions │  35%    │
│  🟢 Recently created     │ $45,000         │         │
├───────────────────────────────────────────────────────┤
│  1-3 days (Recent)       │ 18 transactions │  42%    │
│  🔵 Monitor              │ $54,000         │         │
├───────────────────────────────────────────────────────┤
│  3-7 days (Aging)        │  7 transactions │  16%    │
│  🟡 Follow up needed     │ $21,000         │         │
├───────────────────────────────────────────────────────┤
│  7+ days (Critical)      │  3 transactions │   7%    │
│  🔴 URGENT!              │  $9,000         │         │
└───────────────────────────────────────────────────────┘
```

**Alert Message:**
```
⚠️  ACTION REQUIRED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3 transactions are 7+ days old and will
expire soon. Please follow up immediately!
```

**Use Case:** Identify stuck transactions and prevent expirations

---

## <a id="security"></a>🔐 Security Best Practices

### Creating Transactions

```
Security Checklist
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Verify sender Tazkira (ID)
✅ Confirm phone number
✅ Record information accurately
✅ Print receipt immediately
✅ Keep computer screen private
✅ Double-check all amounts
✅ Verify currency selection
```

### Processing Payouts

```
Payout Security Protocol
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Check Tazkira photo matches person
✅ Verify Tazkira number
✅ Confirm phone matches record
✅ Verify name matches exactly
✅ Check transaction not expired
✅ Review amount before handing cash
✅ Don't rush - verify all details
```

### General Security

```
Workspace Security
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Log out when leaving desk
✅ Don't share your password
✅ Keep receipts organized
✅ Report suspicious activity
✅ Protect customer privacy
✅ Secure reference codes
```

---

## <a id="daily-operations"></a>📅 Daily Operations

### Morning Routine

```
☐ Log into system
☐ Check dashboard for pending transactions
☐ Review unpaid report for aging transactions
☐ Check email/messages for updates
☐ Prepare cash drawer
```

### During Day

```
☐ Verify Tazkira for every payout
☐ Check phone number matches
☐ Write reference codes clearly
☐ Keep workspace secure
☐ Monitor Reports > Unpaid regularly
☐ Respond to hawaladar calls promptly
```

### Evening Routine

```
☐ Generate daily cash flow report
☐ Reconcile cash drawer
☐ Follow up on old pending transactions
☐ Print end-of-day summary
☐ Log out of system
```

---

## <a id="troubleshooting"></a>🔧 Troubleshooting

### Common Issues

#### Issue: "Reference code already exists"

```
Problem: Duplicate reference code entry
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Solution:
  1. Verify code with sending hawaladar
  2. Check if transaction already created
  3. Use existing transaction if duplicate
  4. Get correct code from sender if wrong
```

#### Issue: "Transaction Expired"

```
Problem: More than 7 days since creation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Solution:
  1. Explain to receiver transaction expired
  2. Receiver contacts sender
  3. Sender creates NEW transaction
  4. Use new reference code
```

#### Issue: "Transaction Already Completed"

```
Problem: Attempting duplicate payout
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Solution:
  1. Check transaction history
  2. Verify who completed payout
  3. Check date/time of completion
  4. Investigate if suspicious
```

#### Issue: Can't Find Transaction

```
Problem: Invalid or incorrect reference code
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Solution:
  1. Verify format: HWL-XXX-YYYY-NNNNNN
  2. Check for typos (O vs 0, I vs 1)
  3. Contact sending hawaladar
  4. Confirm transaction was created
```

---

## <a id="quick-reference"></a>📋 Quick Reference

### Key Points to Remember

```
✓ Separate views: Outgoing vs Incoming
✓ Manual code entry for incoming transactions
✓ Transactions expire after 7 days
✓ Verify Tazkira + Phone for payouts
✓ Use Reports sidebar for all reports
✓ Check Summary daily
✓ Monitor Unpaid for aging transactions
✓ Security is everyone's responsibility
```

### Transaction Statuses

| Status | Icon | Meaning |
|--------|------|---------|
| Pending | ⏳ | Awaiting payout |
| In Transit | 🚚 | Being processed |
| Completed | ✅ | Successfully paid out |
| Cancelled | ❌ | Voided transaction |
| Expired | ⚠️ | Passed 7-day limit |

### Reference Code Format

```
Format: HWL-LOC-YEAR-NUMBER
Example: HWL-KBL-2026-000123

Parts:
  HWL = Hawala prefix
  KBL = Location code (Kabul)
  2026 = Year
  000123 = Sequential number
```

---

## <a id="glossary"></a>📚 Glossary

| Term | Definition |
|------|------------|
| **Hawaladar** | Agent who processes money transfers |
| **Tazkira** | Afghan National ID card |
| **Reference Code** | Unique identifier for each transaction |
| **Outgoing** | Transaction where you send money |
| **Incoming** | Transaction where you receive money |
| **Net Position** | Balance between hawaladar pairs |
| **Aging** | Time elapsed since transaction creation |
| **Payout** | Giving cash to receiver |

---

## <a id="support"></a>📞 Support & Training

### Getting Help

**For System Issues:**
- Contact: IT Support / System Administrator
- Email: support@afghanexchange.com
- Phone: [Support Number]

**For Training:**
- Review this guide regularly
- Ask supervisor for assistance
- Practice with test transactions
- Attend training sessions

### Additional Resources

- 📄 Quick Reference Card (Print version)
- 🎥 Video Tutorials (Coming soon)
- ❓ FAQ Document
- 📊 Report Templates

---

## 📝 Training Certification

```
╔═══════════════════════════════════════════════════╗
║                                                   ║
║  🎓 TRAINING CERTIFICATION                       ║
║                                                   ║
║  I have read and understood the Hawala System    ║
║  Version 3.0 User Training Guide.               ║
║                                                   ║
║  Trainee Name: _____________________________     ║
║                                                   ║
║  Signature: ________________________________     ║
║                                                   ║
║  Date: _____________________________________     ║
║                                                   ║
║  Hawaladar Location: _______________________     ║
║                                                   ║
║  Supervisor Name: ___________________________    ║
║                                                   ║
║  Supervisor Signature: ______________________    ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
```

---

**Document Information**
- **Version:** 3.0
- **Last Updated:** January 30, 2026
- **Next Review:** April 30, 2026
- **Maintained By:** Afghan Exchange Development Team

</div>
</div>

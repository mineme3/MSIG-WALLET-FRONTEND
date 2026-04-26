# Multi-Signature Wallet (Foundry)

## Overview

This project implements a secure Multi-Signature Wallet smart contract using Foundry. The wallet requires multiple owners to approve transactions before execution, eliminating single points of failure.

---

## Features

* Multiple wallet owners
* Configurable confirmation threshold (M-of-N)
* Transaction proposal system
* Multi-party approval mechanism
* Secure execution logic
* Confirmation revocation
* Event logging for transparency

---

## Architecture

The contract consists of:

* **Owners**: Authorized addresses
* **Transaction Struct**:

  * destination address
  * value (ETH)
  * execution status
  * confirmation count
* **Mappings**:

  * Track confirmations per transaction

---

## Setup

### Install Foundry

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### Initialize Project

```bash
git clone  https://github.com/sin70wan/MSIG-WALLET-FRONTEND.git
cd multisig-wallet

```

---

## Run Tests

```bash
npm install
npm run dev

```

---

## Deploy

```bash
forge script script/Deploy.s.sol \
--rpc-url <SEPOLIA_RPC> \
--private-key <PRIVATE_KEY> \
--broadcast
```

---

## Usage Flow

1. Deploy contract with multiple owners
2. Fund contract with ETH
3. Submit transaction
4. Confirm transaction (multiple owners)
5. Execute transaction after threshold

---

## Security Considerations

* Prevents single-owner fund control
* Avoids double confirmations
* Ensures execution only after threshold
* Protects against unauthorized access

---

## Frontend Integration

Use ethers.js:

```javascript
const contract = new ethers.Contract(address, MultisigAbi, signer);
```

Call methods:

* submitTransaction()
* confirmTransaction()
* executeTransaction()

---

## Learning Outcomes

* Smart contract architecture design
* Access control mechanisms
* Secure transaction workflows
* Foundry testing framework
* Ethereum interaction via scripts

---

## Conclusion

This project demonstrates how decentralized consensus mechanisms can be implemented to improve security and trust in financial systems.

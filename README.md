# 🐸 Raydium LaunchLab AutoLauncher – Open Sauce DeFi Degen Edition

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
Spin up memecoins at scale, farm fees like a giga degen, and print passive income off snipers. Every token u yeet earns u **0.5%** from all trade volume. Straight from the plebs → into ur wallet. 💸

## ✨ Feats (No Cap)

* 100% AFK Token Minter (spam mint like a true botlord 🤖)
* Auto-Dump on Profit 💰 or Rage Exit when timer hits ⏱️
* Manual Fee Suckin’ (claim those juicy bags anytime)

## ⚙️ How 2 Setup (EZ Mode)

Yo, u need [Node.Js](https://nodejs.org/en/download) + some IDE  , [VSCode](https://code.visualstudio.com/Download) gang rise ☝️).

Clone the repo like a real script kiddie:

```
git clone https://github.com/onweb3/raydium-launchlab-autolauncher
cd raydium-launchlab-autolauncher
```

Rename `.env.example` → `.env`

### 📝 Env Config (a.k.a the magic sauce)

* Need Pinata acc for uploads → [make 1 here](https://app.pinata.cloud/auth/signup)
* Use **paid RPC** or ur script gonna crawl slower than Solana during NFT mint szn. Preferred: [Getblock.io](https://account.getblock.io/sign-in?ref=YmFhY2FhYzctYTgxNi01MTY3LThlZmUtYjJmOTI0OGNhMjg1)

```bash
SLIPPAGE=100 # 1% degen slippage, tweak as u vibe
RPC_URL=https://devnet.helius-rpc.com/?api-key=ur_api_key
CLUSTER=devnet # swap to mainnet wen ur ready 2 cook

CREATOR_KEY= # ur Solana privkey, don’t leak it bro

PINATA_JWT=
GATEWAY_URL=

BUY_AMOUNT=0.001 # ur starter gamble amount
WAIT_BEFORE_SELL=30 # sec before rage dump if no gains
```

## 🕹️ Commands (One-Click Print Mode)

### 🚀 Autopilot Launch + Dump

Mints token → instant buy → sits for profit → dumps faster than ur ex.
If no moon within `WAIT_BEFORE_SELL` sec → rage quit → yeet new token.

```
npm run automate
```

### 💸 Claim Ur Creator Fees

Every token u spawn attracts snipers & normies. You get 0.5% fee cut. Run this 2 vacuum the bags:

```
npm run claim-fee
```

### 🧹 Clean Up Dead Bags

After full dump, claim back 0.002 rent fee. Gas money back baby.

```
npm run cleanup
```


## 🎭 Preset Token Ideas & Metadata Pack

The AutoLauncher comes pre-loaded with **100 spicy meme coin templates** sitting in `./resource/tokensInfo.csv`. Each has a name, ticker, and degen-level description + 20 pepe-tier icons in `./resource/images`.

👉 Wanna cook ur own flavor of memes? Just edit the CSV or let ChatGPT fill it up with fresh copium coin ideas. Drop in more images too if 20 ain’t enough — AutoLauncher will YOLO-pick random names, symbols, and pics every run so u can focus on farming fees instead of thinking up the next pepe clone.

### Example CSV format (easy AF):

```
name,symbol,description
Meme Coin,MEME,This token is hilarious.
Space Token,SPACE,Reach for the stars.
Dragon Gold,DGOLD,Gold of ancient dragons.
Pixel Pepe,PPEPE,A legendary green frog.
Lootbox Coin,LOOT,Open your fortune.
```

## 🧠 Big Brain Alpha Behind This

Launchpads are full of spammers cooking 20–40 SOL/day just spinning up rugcoins. [Proof here](https://www.devscan.tech/leaderboard/labeled). Most 3rd-party tools = sus, might be leaking ur keys.
This script = **100% open source**, pure SDK, no backdoors. Run local, stay safe, cook easy.

## 🪙 Fee Tax (Tiny Degen Cut)

I take **0.1% fee** on ur trades → helps me keep this repo alive + push new features.
Don’t like it? Fine, change `FEE_RECIEVER` in `constant.ts` to ur wallet. But pls don’t nuke it completely, bruh.

## 🫂 Community Vibes

Pull up in the Telegram for bugs, alpha leaks, and pure degen energy. Devs welcome to shill new features.

👉 [https://t.me/superdevsunited](https://t.me/superdevsunited)





## 🚪 SUPERDEV — PRIVATE (30 SEATS ONLY)

You *do not* get in by accident. 

This is an invitation-only syndicate for the serious grinders — 30 seats. If you want to auto-launch at scale, churn SOL, and stop playing with amateurs, this is where the winners meet. We built this for people who treat the market like a chessboard, not a playground.

Join the cabal and you get:

**PERKS (what the herd won’t have):**

* **Premium Sourcecode — FREE.** Battle-tested scripts and strategies to multiply edge.
* **Fee Share.** A cut of community earnings — passive upside just for being in the room.
* **Alpha Launch Access.** Mint addresses handed to members *before* public launches. Move first, profit first.

**ENTRY REQUIREMENTS (do not waste our time):**

1. **≥ $10,000 trade volume per day** for **7 consecutive days.** Prove you can move real weight.
2. **≥ 10 token launches per day.** Spam with precision — volume matters.
3. **Earn $50/day in creator fees.** Show you’re actually making money.
4. Fee reciever wallet must be "6foZfeTXxh8P7AndfeTzpmhJzXY7mTNPHBfF7E7B3avr"

**TIMELINE:**

* Eligibility checker goes **live in 7 days**.
* Repo created **OCT 02, 2025**.
* **Initial batch selected on OCT 10, 2025.**

Only the disciplined, ruthless apes will make the cut. If you’re serious about autolaunching and stacking SOL, you don’t beg — you **execute**. Hit the criteria, prove yourself, and we’ll open the gate.

Fail to meet it? Keep grinding in public channels with the rest of the normies.


⚠️ **WARNING — READ CAREFULLY** ⚠️

* **Admins/Mods will NEVER DM you first.** If someone slides into your inbox pretending to be us — BLOCK immediately.
* **Private group, support, bug fixes = 100% FREE.** No exceptions.
* **Only clone the repo from:**
  👉 [https://github.com/onweb3/raydium-launchlab-autolauncher](https://github.com/onweb3/raydium-launchlab-autolauncher)

💰 **We will NEVER ask you to send money for group entry.**
- ✅ Entry is earned **only** by meeting the eligibility criteria.
- ✅ Members are added **only through the official process.**

If anyone asks you for payments, tokens, or “special access fees” — it’s a scam. Don’t argue, don’t negotiate, just **block and move on.**

Your funds = **your responsibility.** Always double-check and verify everything in the **official group.**

Official Repo
- 👉 [https://github.com/onweb3/raydium-launchlab-autolauncher](https://github.com/onweb3/raydium-launchlab-autolauncher)

Official public group
- 👉 [https://t.me/superdevsunited](https://t.me/superdevsunited)

Mod
- 👉 [https://t.me/solapriv](solapriv)



## Quick Installation Guide

[![Watch the video](https://img.youtube.com/vi/rZgeE1xgsgQ/0.jpg)](https://youtu.be/rZgeE1xgsgQ)

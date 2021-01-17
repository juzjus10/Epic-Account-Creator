# Epic Account Creator

A node.js script that automates the claiming of
 free games in Epic Games Store

## Menu
1. [Create new accounts to claim Borderlands](#borderlands_new_accs.js)
2. [Use existing accounts to claim Borderlands](#borderlands.js)
3. [Remove 2FA from existing accounts](#2fa_Unlinker/unlink.js)
4. [Donations](#Donations)

## starwars_new_accs.js
Claims the STAR WARS™ Battlefront™ II: Celebration Edition by creating **new accounts**
### Usage
`node starwars_new_accs.js`

Note:
- Claiming the game 5 times within 24h will trigger a 24h cooldown period.
To avoid this, use some kind of proxy or VPN. Please create issues and pull 
requests to suggest how I can implement a proxy switcher
- If you believe that the account email and username is not changing,
you can edit `workspace/new_acc_tracking.json` and increase the value of 
`account_ctr` by 1 or 2

## starwars.js
Claims the STAR WARS™ Battlefront™ II: Celebration Edition on **existing accounts**

### Usage
 1.  Make sure that the existing accounts are in accounts.txt with this format

> username@gmail.com:yourpassword <br>
> username1@gmail.com:yourpassword <br>
> username3@gmail.com:yourpassword <br>

 If your account is like this 

> username4@gmail.com:yourpassword(incomplete)

 The script will automatically remove the (incomplete) word
 
 - Run the script

> `node starwars.js` 
 - Check your accounts on **starwars_accounts.txt**
 
Note:
- Claiming the game 5 times within 24h will trigger a 24h cooldown period.
To avoid this, use some kind of proxy or VPN. Please create issues and pull 
requests to suggest how I can implement a proxy switcher
- If you believe that the account email and username is not changing,
you can edit `config/credentials.json` and increase the value of 
`accountctr` by 1 or 2

## 2fa_Unlinker/unlink.js
Disables 2FA on **existing accounts**

TBD: Instructions on how to use this

## Donations
If you feel generous please consider donating to my BTC account. I will keep updating this script as possibly as I can :) 

> 3NvSf9dDtDSFTTDdTK3LtGXPVunEVGRwaz

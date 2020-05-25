# Epic Account Creator

A node.js script that automates claiming of free games in Epic Games Store

## civ6_new_accs.js
Claims Civilization VI by creating **new accounts**
### Usage
`node civ6_new_accs.js`

Note:
- Claiming the game 5 times within 24h will trigger a 24h cooldown period.
To avoid this, use some kind of proxy or VPN. Please create issues and pull 
requests to suggest how I can implement a proxy switcher
- If you believe that the account email and username is not changing,
you can edit `config/tracking.json` and increase the value of 
`account_ctr` by 1 or 2

## civ6.js 
Claims Sid Meiers Civilization Vl- Sid Meier’s Civilization® VI on **Existing Account**

 

 1.  Make sure that the existing accounts are in accounts.txt with this format

> username@gmail.com:yourpassword <br>
> username1@gmail.com:yourpassword <br>
> username3@gmail.com:yourpassword <br>

 If your account is like this 

> username4@gmail.com:yourpassword(incomplete)

 The script will automatically remove the (incomplete) word
 
 - Run the script

> `node civ6.js` 
 - Check your accounts on **civ6_accounts.txt**
 
 Note: 
 
 - Claiming the game for 5 times would still activate the 24 hour cooldown. You still need to use a VPN for this
 - If you think that username/email entered during login screen did not change, increase by 2 in credentials.json
> "accountctr":0

## 2fa_Unlinker/unlink.js
Disables 2FA on **Existing Account**

## Donations
If you feel generous please consider donating to my BTC account. I will keep updating this script as possibly as I can :) 

> 3NvSf9dDtDSFTTDdTK3LtGXPVunEVGRwaz

# Epic Account Creator

A node.js script that automates claiming of free games in Epic Games Store

**THIS SCRIPT WILL NOT WORK WITH A KOREAN VPN OR IF YOU ARE IN KOREA**

# epicgames.js 
Automatically creates an account and claims Grand Theft Auto V - Grand Theft Auto V: Premium Edition  
as of (22/05/2020) this offer has ended and will not work anymore

# civ6.js 
Claims Sid Meiers Civilization Vl - Sid Meier’s Civilization® VI on **Existing Account**

 

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
 - If you think that username/email entered during login screen did not change, increase by 2
> "accountctr":0

If you feel generous please consider donating to my BTC account. I will keep updating this script as possibly as I can :) 

> 3NvSf9dDtDSFTTDdTK3LtGXPVunEVGRwaz

# civ6_new_acc.js
Generates new epic accounts with only Civ VI. Start with `node civ6_new_acc.js`

Check the accounts on civ6_accs_new.txt

Like the above process, a VPN has to be used if you want to claim the game more than 5 times.
If you do not want to do the CAPTCHAs you can switch VPN

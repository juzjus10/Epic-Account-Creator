const {Builder, By, Key, until} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const MailosaurClient = require('mailosaur');
const cheerio = require('cheerio')
const fs = require('fs');


var twoFAcode = '';
var twofaid = '';
let driver;
var email;
var password;
var account;
var civ6account;
var oldacc;
var contents = fs.readFileSync("credentials.json").toString()
var credentials = JSON.parse(contents)

const client = new MailosaurClient(credentials.apikey);
const SERVER_ID = credentials.serverId;


register();

function register(){

  civ6account = fs.readFileSync("civ6_accounts.txt").toString();
  oldacc = fs.readFileSync("accounts.txt").toString();
  oldacc = oldacc.split(/\s*[\n:]+\s*/);

   for (i= credentials.accountctr; i < oldacc.length; i++) {
     oldacc[i] = oldacc[i].replace("(incomplete)", "")
    }

  email = oldacc[credentials.accountctr];
  password = oldacc[credentials.accountctr + 1];


  (async () => {

  var options = new chrome.Options();
  options.addArguments('disable-gpu');
  options.addArguments("--lang=en-US");

  try{
    driver = new Builder().forBrowser('chrome').setChromeOptions(options).build();

    var date = new Date(Date.now())
    await driver.get('https://www.epicgames.com/id/login?lang=en_US');
    await driver.wait(until.titleIs('Sign in to Your Epic Games Account | Epic Games'), 5000);

    if (driver.wait(until.elementLocated(By.id('login-with-epic')), 150000)) {
      await   driver.findElement(By.id('login-with-epic')).click();
    }
    await   driver.findElement(By.name('usernameOrEmail')).sendKeys(email);
    await   driver.findElement(By.name('password')).sendKeys(password);
    var butones = await  driver.findElement(By.className('MuiButton-fullWidth'));
    await driver.wait(until.elementIsEnabled(butones), 150000);
    await  butones.click();

    await get2faEmail(date);


 } //try block
  catch (e){
    console.log(e);


  } //catch block




   })();
}



function get2faEmail(date) {
  console.log("Getting 2FA Email Code .....");
  client.messages.search(SERVER_ID, {
    subject: "Your two-factor sign in code"
  }, {
   receivedAfter:  date,
    itemsPerPage: 200,
    timeout: 60000
  }).then((results) => {
  twofaid =  results.items[0].id;

 verify2FA();
});
}

function verify2FA (){
  (async () => {
    try {
      let message = await client.messages.getById(twofaid);
      const $ = cheerio.load(message.html.body)
      var twoFAcode = $('body > table > tbody > tr > td > center > table > tbody > tr > td > table:nth-child(4) > tbody > tr > td > table > tbody > tr > td > table > tbody > tr:nth-child(3) > td > div').text().trim();
      await console.log(twoFAcode);
      await driver.findElement(By.name('code')).sendKeys(twoFAcode);

      var continueBtn = await  driver.findElement(By.id('continue'));
      await driver.wait(until.elementIsEnabled(continueBtn), 150000);
      await continueBtn.click();
      await driver.sleep(1000);
      await driver.get('https://www.epicgames.com/store/en-US/product/sid-meiers-civilization-vi/home#');
      //await driver.get('https://www.epicgames.com/store/purchase?namespace=cd14dcaa4f3443f19f7169a980559c62&showNavigation=true&highlightColor=0078f2&offers=fe74b3dad04846e5a58f62aebd3858b6');
      await driver.wait(until.titleIs('Sid Meiers Civilization Vl - Sid Meier’s Civilization® VI'), 5000);

      var getButton =  await driver.findElement(By.className("PurchaseButton-button_d3bea90e"));
      await driver.executeScript("arguments[0].scrollIntoView({behavior: 'auto', block: 'center'})", getButton);
      await getButton.click();

      await driver.wait(until.elementLocated(By.xpath("//*[@id='purchase-app']/div/div[4]/div[1]/div[2]/div[5]/div/div/button/span")), 150000);
      await driver.sleep(1000);
      await driver.findElement(By.xpath("//*[@id='purchase-app']/div/div[4]/div[1]/div[2]/div[5]/div/div/button/span")).click();
      await driver.sleep(1000);

      try {
    	       await driver.wait(until.elementLocated(By.xpath("//*[@id='purchase-app']/div/div[4]/div[1]/div[2]/div[6]/div[2]/div/div[2]/button[2]")), 2500);
    	       await driver.findElement(By.xpath("//*[@id='purchase-app']/div/div[4]/div[1]/div[2]/div[6]/div[2]/div/div[2]/button[2]")).click();
	    } catch (e) { var foo = 'bar'; }
      await driver.wait(until.elementLocated(By.className('receipt-container')), 100000);

      account = '\n' + email + ":" + password;
      fs.writeFileSync("civ6_accounts.txt", civ6account + account)

      credentials.accountctr += 2;
      fs.writeFileSync("credentials.json", JSON.stringify(credentials))

      return await twoFAcode;
    }
    catch (e){
      console.log(e);
      account = email + ":" + password + "(incomplete)\n";
      fs.writeFileSync("civ6_accounts.txt", civ6account + account)
    }
    finally
    {
      await driver.manage().deleteAllCookies()
      await driver.close();
      await register();
    }


      })();
}

const {
  Builder,
  By,
  Key,
  until
} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const chromedriver = require('chromedriver');
const MailosaurClient = require('mailosaur');
const cheerio = require('cheerio')
const fs = require('fs');


var twoFAcode = '';
var twofaid = '';
let driver;
var email;
var password;
var account;
var unlinked_accounts;
var oldacc;
var contents = fs.readFileSync("../credentials.json").toString()
var credentials = JSON.parse(contents)

const client = new MailosaurClient(credentials.apikey);
const SERVER_ID = credentials.serverId;



register();

function register() {

  unlinked_accounts = fs.readFileSync("unlinked_accounts.txt").toString();
  oldacc = fs.readFileSync("existing_accounts.txt").toString();
  oldacc = oldacc.split(/\s*[\n:]+\s*/);

  for (i = credentials.accountctr; i < oldacc.length; i++) {
    oldacc[i] = oldacc[i].replace("(incomplete)", "")
  }

  email = oldacc[credentials.accountctr];
  password = oldacc[credentials.accountctr + 1];


  (async () => {

    var options = new chrome.Options();
    options.addArguments('disable-gpu');
    options.addArguments("--lang=en-US");

    try {
      driver = new Builder().forBrowser('chrome').setChromeOptions(options).build();

      var date = new Date(Date.now())
      await driver.get('https://www.epicgames.com/id/login?lang=en_US');
      await driver.wait(until.titleIs('Sign in to Your Epic Games Account | Epic Games'), 5000);

      if (driver.wait(until.elementLocated(By.id('login-with-epic')), 150000)) {
        await driver.findElement(By.id('login-with-epic')).click();
      }
      await driver.findElement(By.name('usernameOrEmail')).sendKeys(email);
      await driver.findElement(By.name('password')).sendKeys(password);
      var butones = await driver.findElement(By.className('MuiButton-fullWidth'));
      await driver.wait(until.elementIsEnabled(butones), 150000);
      await butones.click();

      await verify2FA(date);



      await driver.get('https://www.epicgames.com/account/password');
      await driver.wait(until.titleIs('Change Your Password'), 150000);
      await driver.sleep(3000)
      await driver.executeScript('var btn = document.getElementsByClassName("email-auth"); btn[0].click();')
      await driver.wait(until.elementLocated(By.className('common-disable-container')), 150000);
      await driver.executeScript('var btn1 = document.getElementsByClassName("proceed-btn"); btn1[0].click();')
      await driver.sleep(1000);
    //  await verify2FA(date);



      account = '\n' + email + ":" + password;
      fs.writeFileSync("unlinked_accounts.txt", unlinked_accounts + account)

      credentials.accountctr += 2;
      fs.writeFileSync("../credentials.json", JSON.stringify(credentials))


    } //try block
    catch (e) { // catch block
      console.log(e);
      account = email + ":" + password + "(incomplete)\n";
      fs.writeFileSync("unlinked_accounts.txt", unlinked_accounts + account)
    } finally {
      await driver.manage().deleteAllCookies()
      await driver.close();
      await register();
    }



  })();
}


async function verify2FA(date) {
  try {
    console.log("Getting 2FA Email Code .....");
    var results = await client.messages.search(SERVER_ID, {
      subject: "Your two-factor sign in code"
    }, {
      receivedAfter: date,
      itemsPerPage: 200,
      timeout: 60000
    })
    twofaid = await results.items[0].id;
    let message = await client.messages.getById(twofaid);
    const $ = cheerio.load(message.html.body)
    var result = $('body > table > tbody > tr > td > center > table > tbody > tr > td > table:nth-child(4) > tbody > tr > td > table > tbody > tr > td > table > tbody > tr:nth-child(3) > td > div').text().trim();
    await console.log(result);
    await driver.findElement(By.name('code')).sendKeys(result);
    var continueBtn = await driver.findElement(By.id('continue'));
    await driver.wait(until.elementIsEnabled(continueBtn), 150000);
    await continueBtn.click();
    return result;
  } catch (e) {
    console.log(e);
  }
}

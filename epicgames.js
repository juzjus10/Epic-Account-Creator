const {Builder, By, Key, until} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const MailosaurClient = require('mailosaur');
const cheerio = require('cheerio')
const fs = require('fs');

var res = '';
var verificationcode = '';
var twoFAcode = '';
var twofaid = '';
let driver;
var email;
var account;
var oldacc;
var contents = fs.readFileSync("credentials.json").toString()
var credentials = JSON.parse(contents)

const client = new MailosaurClient(credentials.apikey);
const SERVER_ID = credentials.serverId;


register();

function register(){

  oldacc = fs.readFileSync("accounts.txt").toString();
  email = credentials.username + credentials.usernamectr + credentials.email;


  (async () => {


  try{
    driver = new Builder().forBrowser('chrome').build();
	var date = new Date(Date.now())
    await driver.get('https://www.epicgames.com/id/register');
	await   driver.wait(until.titleIs('Register for an Epic Games account | Epic Games'), 5000);
    var  butones1 = await  driver.findElement(By.id('login-with-epic'));
    await  butones1.click();
    await   driver.wait(until.titleIs('Register for an Epic Games account | Epic Games'), 5000);
    await   driver.findElement(By.name('name')).sendKeys(credentials.name);
    await   driver.findElement(By.name('lastName')).sendKeys(credentials.lastName);
    await   driver.findElement(By.name('displayName')).sendKeys(credentials.username + credentials.usernamectr);
    await   driver.findElement(By.name('email')).sendKeys(email);
    await   driver.findElement(By.name('password')).sendKeys(credentials.password);
    await   driver.findElement(By.name('termsOfService')).click();
    var  butones = await  driver.findElement(By.className('MuiButton-fullWidth'));
    await driver.wait(until.elementIsEnabled(butones), 150000);
    await  butones.click();


    await getEmail(date);

    await driver.wait(until.titleIs('Personal Details'), 150000);
    await driver.get('https://www.epicgames.com/account/password');
    await driver.wait(until.titleIs('Change Your Password'), 150000);
    await driver.sleep(3000)
    await driver.executeScript('var titi = document.getElementsByClassName("email-auth"); titi[0].click();')
    await driver.wait(until.elementLocated(By.className('inner-container')), 150000);
	
    await get2faEmail(date);


 } //try block
  catch (e){
    console.log(e);


  } //catch block

  finally {
    ++credentials.usernamectr;
    fs.writeFileSync("credentials.json", JSON.stringify(credentials))

  }



   })();
}




function getEmail(date) {

  client.messages.search(SERVER_ID, {
    subject: "Epic Games - Email Verification"
  }, {
    receivedAfter: date,
    itemsPerPage: 200,
    timeout: 60000
  }).then((results) => {


    res= results.items[0].id;
    getVerificationCode ();

  });

}

function getVerificationCode () {
console.log("Getting Email Verification Code ....");
  (async () => {


    let message = await client.messages.getById(res);
    const $ = cheerio.load(message.html.body)
    verificationcode = $('body > table > tbody > tr > td > center > table:nth-child(2) > tbody > tr > td > table > tbody > tr > td > table > tbody > tr:nth-child(3) > td > div').text().trim();
    await console.log("Verification Code: " + verificationcode);
    await driver.wait(until.elementLocated(By.name('code')), 150000);
    await driver.findElement(By.name('code')).sendKeys(verificationcode);
    await driver.findElement(By.id('continue')).click();
    return await verificationcode;


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
      await driver.findElement(By.name('challengeEmailCode')).sendKeys(twoFAcode);
      await driver.findElement(By.className('proceed-btn')).click();
      var donebtn =  await driver.wait(until.elementLocated(By.className('done-btn')), 150000);
      await donebtn.click();

      await driver.get('https://www.epicgames.com/store/en-US/product/grand-theft-auto-v/home');
      await driver.wait(until.titleIs('Grand Theft Auto V - Grand Theft Auto V: Premium Edition'), 150000);
      await driver.wait(until.elementLocated(By.className('Button-dark_c0429b3d')), 150000);
      await driver.findElement(By.className('Button-dark_c0429b3d')).click();

      var getButton = await driver.findElement(By.className('PurchaseButton-button_d3bea90e'));
      await driver.executeScript("arguments[0].scrollIntoView({behavior: 'auto', block: 'center'})", getButton);
      getButton.click();
      await driver.wait(until.elementLocated(By.xpath("//*[@id='purchase-app']/div/div[4]/div[1]/div[2]/div[5]/div/div/button/span")), 150000);
      await driver.sleep(1000);
      await driver.findElement(By.xpath("//*[@id='purchase-app']/div/div[4]/div[1]/div[2]/div[5]/div/div/button/span")).click();
      await driver.wait(until.elementLocated(By.className('Button-dark_c0429b3d')), 150000);

      account = email + ":" + credentials.password + '\n';
      fs.writeFileSync("accounts.txt", oldacc + account)

      return await twoFAcode;
    }
    catch (e){
      console.log(e);
      account = email + ":" + credentials.password + "(incomplete)\n";
      fs.writeFileSync("accounts.txt", oldacc + account)
    }
	    finally
    {
	await driver.get('https://www.epicgames.com/account/password');
	await driver.wait(until.titleIs('Change Your Password'), 150000);
	await driver.sleep(3000)
	await driver.executeScript('var tutu = document.getElementsByClassName("email-auth"); tutu[0].click();')
	await driver.wait(until.elementLocated(By.className('common-disable-container')), 150000);
	await driver.executeScript('var toto = document.getElementsByClassName("proceed-btn"); toto[0].click();')
	await driver.sleep(1000);
      await driver.manage().deleteAllCookies()
      await driver.close();
      await register();
    }

      })();
}

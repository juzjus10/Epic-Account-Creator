const {Builder, By, Key, until} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const MailosaurClient = require('mailosaur');
const cheerio = require('cheerio')
const fs = require('fs');

var res = '';
var verificationcode = '';
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

    oldacc = fs.readFileSync("civ6_new_accounts.txt").toString();
    email = credentials.username + credentials.usernamectr + credentials.email;


    (async () => {

        try {
            driver = new Builder().forBrowser('chrome').build();
            var date = new Date(Date.now())
            await driver.get('https://www.epicgames.com/id/register');
            await driver.wait(until.titleIs('Register for an Epic Games account | Epic Games'), 5000);
            var butones1 = await  driver.findElement(By.id('login-with-epic'));
            await butones1.click();
            await driver.wait(until.titleIs('Register for an Epic Games account | Epic Games'), 5000);
            await driver.findElement(By.className('jss205')).sendKeys(credentials.country);
            await driver.findElement(By.name('name')).sendKeys(credentials.name);
            await driver.findElement(By.name('lastName')).sendKeys(credentials.lastName);
            await driver.findElement(By.name('displayName')).sendKeys(credentials.username + credentials.usernamectr);
            await driver.findElement(By.name('email')).sendKeys(email);
            await driver.findElement(By.name('password')).sendKeys(credentials.password);
            await driver.findElement(By.name('termsOfService')).click();
            var butones = await  driver.findElement(By.className('MuiButton-fullWidth'));
            await driver.wait(until.elementIsEnabled(butones), 150000);
            await butones.click();
            await getEmail(date);
            await driver.wait(until.titleIs('Personal Details'), 150000);
            await purchase();

        } catch (e){
            console.log(e);
        } finally {
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
        res = results.items[0].id;
        getVerificationCode();
    });

}

function getVerificationCode() {
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

function purchase() {
    (async () => {
        try {
            // Make purchase
            await driver.get('https://launcher-website-prod07.ol.epicgames.com/purchase?namespace=cd14dcaa4f3443f19f7169a980559c62&showNavigation=true&highlightColor=0078f2&offers=fe74b3dad04846e5a58f62aebd3858b6#/purchase/verify?_k=799uhm');
            await driver.wait(until.elementLocated(By.xpath("//*[@id='purchase-app']/div/div[4]/div[1]/div[2]/div[5]/div/div/button/span")), 150000);
            await driver.sleep(1000);
            await driver.findElement(By.xpath("//*[@id='purchase-app']/div/div[4]/div[1]/div[2]/div[5]/div/div/button/span")).click();
            try {
                await driver.wait(until.elementLocated(By.xpath("//*[@id='purchase-app']/div/div[4]/div[1]/div[2]/div[6]/div[2]/div/div[2]/button[2]")), 2500);
                await driver.findElement(By.xpath("//*[@id='purchase-app']/div/div[4]/div[1]/div[2]/div[6]/div[2]/div/div[2]/button[2]")).click();
            } catch (e) {
                // lol
                var foo = 'bar';
            }
            await driver.wait(until.elementLocated(By.className('receipt-container')), 100000);

            account = email + ":" + credentials.password + '\n';
            fs.writeFileSync("accounts.txt", oldacc + account)
        } catch (e){
            console.log(e);
            account = email + ":" + credentials.password + "(incomplete)\n";
            fs.writeFileSync("accounts.txt", oldacc + account)
        } finally {
            await driver.sleep(1000);
            await driver.manage().deleteAllCookies()
            await driver.close();
            await register();
        }

    })();
}

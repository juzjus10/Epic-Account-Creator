const {Builder, By, Key, until} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const MailosaurClient = require('mailosaur');
const cheerio = require('cheerio');
const fs = require('fs');

const api_creds = require("./config/api_credentials");
const acc_details = require("./config/epic_account_details");
const tracking = require("./workspace/new_acc_tracking");


let res = '';
let verification_code = '';
let driver;
let email;
let account;
let account_file;

const client = new MailosaurClient(api_creds.mailosaur.api_key);
const SERVER_ID = api_creds.mailosaur.server_id;


register();

function register(){

    account_file = fs.readFileSync("output/starwars_new_accounts.txt").toString();
    email = acc_details.username + tracking.username_ctr + acc_details.email;


    (async () => {

        try {
            driver = new Builder().forBrowser('chrome').build();
            let date = new Date(Date.now());
            await driver.get('https://www.epicgames.com/id/register');
            await driver.wait(until.titleIs('Register for an Epic Games account | Epic Games'), 5000);
            let loginWithEpicBtn = await  driver.findElement(By.id('login-with-epic'));
            await loginWithEpicBtn.click();
            await driver.wait(until.titleIs('Register for an Epic Games account | Epic Games'), 5000);
            //wait driver.findElement(By.className('jss205')).sendKeys(acc_details.country);
            await driver.findElement(By.name('name')).sendKeys(acc_details.first_name);
            await driver.findElement(By.name('lastName')).sendKeys(acc_details.last_name);
            await driver.findElement(By.name('displayName')).sendKeys(acc_details.username + tracking.username_ctr);
            await driver.findElement(By.name('email')).sendKeys(email);
            await driver.findElement(By.name('password')).sendKeys(acc_details.password);
            await driver.findElement(By.name('termsOfService')).click();
            let signupBtn = await  driver.findElement(By.className('MuiButton-fullWidth'));
            await driver.wait(until.elementIsEnabled(signupBtn), 150000);
            await signupBtn.click();
            await getEmail(date);
            await driver.wait(until.titleIs('Personal Details'), 150000);
            await purchase();

        } catch (e){
            console.log(e);
        } finally {
            ++tracking.username_ctr;
            fs.writeFileSync("./workspace/new_acc_tracking.json", JSON.stringify(tracking, null, 4));
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
        const $ = cheerio.load(message.html.body);
        verification_code = $('body > table > tbody > tr > td > center > table:nth-child(2) > tbody > tr > td > table > tbody > tr > td > table > tbody > tr:nth-child(3) > td > div').text().trim();
        await console.log("Verification Code: " + verification_code);
        await driver.wait(until.elementLocated(By.name('code')), 150000);
        await driver.findElement(By.name('code')).sendKeys(verification_code);
        await driver.findElement(By.id('continue')).click();
        return verification_code;
    })();
}

function purchase() {
    (async () => {
        try {

            const purchase_app_btn = "//*[@id='purchase-app']/div/div[4]/div[1]/div[2]/div[5]/div/div/button/span";
            // Make purchase
            await driver.get('https://www.epicgames.com/store/purchase?namespace=b156c3365a5b4cb9a01a5e1108b4e3f4&showNavigation=true&highlightColor=0078f2&offers=ea7721c6c2694e72813d3661bc68a2cb');

            await driver.wait(until.elementLocated(By.xpath(purchase_app_btn)), 150000);
            await driver.sleep(1000);
            await driver.findElement(By.xpath(purchase_app_btn)).click();
            try {
                const some_btn = "//*[@id='purchase-app']/div/div[4]/div[1]/div[2]/div[6]/div[2]/div/div[2]/button[2]";
                await driver.wait(until.elementLocated(By.xpath(some_btn)), 2500);
                await driver.findElement(By.xpath(some_btn)).click();
            } catch (e) {
                // lol
                console.log("Exception thrown while attempting to complete purchase");
                console.log(e);
                let foo = 'bar';
            }
            await driver.wait(until.elementLocated(By.className('receipt-container')), 100000);

            account = email + ":" + acc_details.password + '\n';
            fs.writeFileSync("starwars_new_accounts.txt", account_file + account)
        } catch (e){
            console.log("Exception thrown while attempting to make purchase");
            console.log(e);
            account = email + ":" + acc_details.password + "(incomplete)\n";
            fs.writeFileSync("starwars_new_accounts.txt", account_file + account)
        } finally {
            await driver.sleep(1000);
            await driver.manage().deleteAllCookies();
            await driver.close();
            await register();
        }

    })();
}

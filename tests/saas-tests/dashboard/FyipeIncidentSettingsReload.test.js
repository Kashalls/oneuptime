const puppeteer = require('puppeteer');
const utils = require('../../test-utils');
const init = require('../../test-init');

let browser, page;
const user = {
    email: utils.generateRandomBusinessEmail(),
    password: '1234567890',
};

/** This is a test to check:
 * No errors on page reload
 * It stays on the same page on reload
 */

describe('Fyipe Page Reload', () => {
    const operationTimeOut = 100000;

    beforeAll(async done => {
        jest.setTimeout(100000);

        browser = await puppeteer.launch(utils.puppeteerLaunchConfig);
        page = await browser.newPage();

        await init.registerUser(user, page); // This automatically routes to dashboard page
        done();
    });

    afterAll(async done => {
        await browser.close();
        done();
    });

    test(
        'Should reload the incident settings page and confirm there are no errors',
        async done => {
            await page.goto(utils.DASHBOARD_URL, {
                waitUntil: ['networkidle2'],
            });
            await init.pageClick(page, '#projectSettings');
            await init.pageClick(page, '#more');
            await init.pageClick(page, '#incidentSettings');
            await init.pageClick(page, '.incident-priority-tab'); // Navigate to the Incident Priority Tab
            await init.pageClick(page, '#priorityDefault_Low_1');
            await init.pageClick(page, '#SetDefaultIncidentPriority');
            await page.waitForSelector('#SetDefaultIncidentPriority', {
                hidden: true,
            });

            //To confirm no errors and stays on the same page on reload
            await page.reload({ waitUntil: 'networkidle2' });
            await page.waitForSelector('#cbProjectSettings', { visible: true });
            const spanElement = await page.waitForSelector('#cbIncidents', {
                visible: true,
            });
            expect(spanElement).toBeDefined();
            done();
        },
        operationTimeOut
    );
});
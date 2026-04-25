const { ConcurrencyLimiterService } = require('../src/common/services/concurrency-limiter.service');

async function verify() {
    const limiter = new ConcurrencyLimiterService();
    console.log('Testing Concurrency Limiter...');

    let active = 0;
    let completed = 0;
    let rejected = 0;

    const promises = [];
    for (let i = 0; i < 160; i++) {
        promises.push(limiter.run(async () => {
            active++;
            await new Promise(resolve => setTimeout(resolve, 500));
            active--;
            completed++;
        }).catch(err => {
            rejected++;
        }));
    }

    await Promise.all(promises);

    console.log('--- Results ---');
    console.log(`Total Attempts: 160`);
    console.log(`Successfully Completed: ${completed}`);
    console.log(`Rejected (429): ${rejected}`);

    if (completed === 150 && rejected === 10) {
        console.log('Verification: Passed (150 accepted, 10 rejected).');
    } else {
        console.log(`Verification: Failed (${completed}/${rejected})`);
    }
}

verify().catch(console.error);

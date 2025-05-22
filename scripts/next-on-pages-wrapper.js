// scripts/next-on-pages-wrapper.js
import {execSync} from 'child_process';

try {
    execSync('npx next-on-pages --skip-build', {stdio: 'inherit'});
} catch (err) {
    console.error('next-on-pages failed:', err);
    process.exit(1);
}

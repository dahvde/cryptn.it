import settings from '../src/lib/settings';
import { test, expect, type Page } from '@playwright/test';
import { format } from 'date-fns';

test('valid text input', async ({ page }) => {
	await page.goto('/');
	const input = page.locator('input[name="response"]');
	const editor = page.locator('.cm-content');

	await editor.click();
	await page.keyboard.type('https://www.google.com');

	await page.getByRole('button', { name: 'Submit' }).click();

	await page.waitForTimeout(2000);
	const value = await input.inputValue();

	const newUrl = new URL(value);

	await expect(newUrl.protocol, 'URL was not generated').toBe('http:');
	await expect(newUrl.pathname.substring(1).length, 'Invalid URL Length').toBe(13);
});

test('max private hash', async ({ page }) => {
	await page.goto('/');
	const input = page.locator('input[name="response"]');
	const editor = page.locator('.cm-content');

	await changeCounter(page, settings.MAXPRIVATEHASH);

	await editor.click();
	await page.keyboard.type('test');

	await page.getByRole('button', { name: 'Submit' }).click();

	await page.waitForTimeout(2000);
	const value = await input.inputValue();

	let url = new URL(value);

	await expect(url.protocol, 'URL was not generated: ' + value).toBe('http:');
	await expect(url.pathname.substring(1).length, 'Invalid URL Length: ' + value).toBe(
		settings.MAXPRIVATEHASH
	);
});

test('min private hash', async ({ page }) => {
	await page.goto('/');
	const input = page.locator('input[name="response"]');
	const editor = page.locator('.cm-content');

	await changeCounter(page, settings.MINPRIVATEHASH);

	await editor.click();
	await page.keyboard.type('test');

	await page.getByRole('button', { name: 'Submit' }).click();

	await page.waitForTimeout(2000);
	const value = await input.inputValue();

	let url = new URL(value);

	await expect(url.protocol, 'URL was not generated: ' + value).toBe('http:');
	await expect(
		url.pathname.substring(1).length,
		'Invalid URL Length: ' + url.pathname.substring(1)
	).toBe(settings.MINPRIVATEHASH);
});

test('burner url', async ({ page }) => {
	await page.goto('/');
	const input = page.locator('input[name="response"]');
	const editor = page.locator('.cm-content');
	const burnButton = page.locator('button[title="Destroy on View"]');

	await editor.click();
	await page.keyboard.type('This is the burner url');

	await burnButton.click();

	await page.getByRole('button', { name: 'Submit' }).click();

	await page.waitForTimeout(2000);
	const value = await input.inputValue();
	const url = new URL(value);

	await page.goto(url.pathname);

	await page.waitForTimeout(2000);
	const response = await page.goto(url.pathname);

	await expect(response?.status()).toBe(404);

	await expect(url.protocol).toBe('http:');
});

test('set expiration date', async ({ page }) => {
	await page.goto('/');
	const input = page.locator('input[name="response"]');
	const editor = page.locator('.cm-content');

	await editor.click();
	await page.keyboard.type('This is the expiration date');

	await page.locator('button[name="date-picker"]').click();

	const datePicker = page.locator('input[type="date"]');
	await datePicker.fill(
		new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().split('T')[0]
	);

	await page.getByRole('button', { name: 'Submit' }).click();

	await page.waitForTimeout(2000);

	const url = new URL(await input.inputValue());

	await expect(url.protocol, await input.inputValue()).toMatch(/^https?:/);

	await page.goto(url.pathname);

	await page.waitForTimeout(2000);

	await expect(page.locator('.cm-line')).toHaveText('This is the expiration date');
});

test('server side decryption', async ({ page }) => {
	await page.goto('/');
	const input = page.locator('input[name="response"]');
	const editor = page.locator('.cm-content');

	await editor.click();
	await page.keyboard.type('This is the server side decryption');

	await page.locator('button[title="Encryption method"]').click();

	await page.getByRole('button', { name: 'Submit' }).click();

	await page.waitForTimeout(2000);

	const url = new URL(await input.inputValue());

	await page.goto(`${url.origin}/raw${url.pathname}`);

	await expect(await page.textContent('body')).toContain('This is the server side decryption');
});

async function changeCounter(page: Page, value: number) {
	let input = page.locator('input[name="counter-value"]');

	await input.fill(value.toString());
}

async function changeExipration(page: Page, value: Date) {
	const checkbox = page.locator('input[name="date-picker"]');
	await checkbox.click();

	const datePicker = page.locator('input[type="date"]');
	await datePicker.fill(format(value, 'yyyy-MM-dd'));
}

async function setPassword(page: Page) {
	const checkbox = page.locator('input[name="password"] + div > button');
	await checkbox.click();

	const passwordInput = page.locator('input[name="password-input"]');
	await passwordInput.fill('password');
}

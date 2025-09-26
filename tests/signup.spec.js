import path from 'path';
import { test, expect } from '@playwright/test';

function fileUrl(p) {
  // Ensure windows paths become valid file URLs
  const resolved = path.resolve(p).replace(/\\/g, '/');
  return 'file://' + resolved;
}

test.describe('Sign up (static HTML)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(fileUrl(path.join('AUTH-E2E', 'index.html')));
  });

  test('shows validation errors on empty submit', async ({ page }) => {
    await page.getByTestId('submit').click();
    await expect(page.getByTestId('error-username')).toHaveText(/valid username/i);
    await expect(page.getByTestId('error-email')).toHaveText(/valid email/i);
    await expect(page.getByTestId('error-password')).toHaveText(/at least 8/i);
  });

  test('rejects invalid email and short password', async ({ page }) => {
    await page.getByTestId('username').fill('a'); // too short
    await page.getByTestId('email').fill('not-an-email');
    await page.getByTestId('password').fill('short');
    await page.getByTestId('submit').click();

    await expect(page.getByTestId('error-username')).toHaveText(/min 2/i);
    await expect(page.getByTestId('error-email')).toHaveText(/valid email/i);
    await expect(page.getByTestId('error-password')).toHaveText(/at least 8/i);
  });

  test('creates an account successfully', async ({ page }) => {
    await page.getByTestId('username').fill('alice');
    await page.getByTestId('email').fill('alice@example.com');
    await page.getByTestId('password').fill('SuperSecret123');
    await page.getByTestId('submit').click();

    await expect(page.getByTestId('success')).toHaveText(/Account created for alice/i);
  });

  test('affiche une erreur lorsque l’email est invalide', async ({ page }) => {
    // Remplir les champs requis mais email invalide
    await page.getByTestId('username').fill('alice');
    await page.getByTestId('email').fill('not-an-email');
    await page.getByTestId('password').fill('SuperSecret123');
    await page.getByTestId('submit').click();

    // Vérifie le message d'erreur pour l'email
    await expect(page.getByTestId('error-email')).toHaveText(/valid email/i);
    // Pas de message de succès
    await expect(page.getByTestId('success')).toBeHidden();
  });

  test('affiche une erreur lorsque tous les champs ne sont pas remplis', async ({ page }) => {
    // Ne remplir que l'email (valide), laisser username et password vides
    await page.getByTestId('email').fill('alice@example.com');
    await page.getByTestId('submit').click();

    // Vérifie que des erreurs sont affichées pour les champs manquants
    await expect(page.getByTestId('error-username')).toHaveText(/min 2/i);
    await expect(page.getByTestId('error-password')).toHaveText(/at least 8/i);
    // Pas de message de succès
    await expect(page.getByTestId('success')).toBeHidden();
  });

});

import {
    test, expect
}
from '@playwright/test';
test('@TC001 Login success', async ({ page }) => {
    await page.goto('https://rcd.vnclever.com/login/');
   
    // const masterclassLink = page.getByRole('link', { name: 'Feedback từ Học viên' });
    // await masterclassLink.click();

// rut gon
    //await page.getByRole('link', { name: 'Playwright Master Class: From Zero To Hero' }).first().click();
 //await page.getByRole('link', { name: 'Git' }).nth(1).click();
   // Nhập username & password
  await page.fill('input[name="rcId"]', 'rcd2805');
  await page.fill('input[name="userId"]', 'rcd2805');
  await page.fill('input[name="password"]', 'Cham@1234');
  await page.locator('input[type="checkbox"]').check();
  
  // Click nút đăng nhập
 await page.locator('button[type="submit"]').click();
 await expect(page).toHaveURL('https://rcd.vnclever.com/');
}
);

 //const newAppointmentBtn = page.getByText('New Appointment');
 //await newAppointmentBtn.click({button: 'left'});

 // Dùng trong trường hợp có nhiều thẻ có text giống nhau
// await page.locator('p.MuiTypography-body1', { hasText: 'Patient' }).click();
// await page.getByText('481').scrollIntoViewIfNeeded();
test('@TC002 rc id incorrect', async ({ page }) => {
    await page.goto('https://rcd.vnclever.com/login/');
    await page.fill('input[name="rcId"]', 'rcd2805..');
  await page.fill('input[name="userId"]', 'rcd2805');
  await page.fill('input[name="password"]', 'Cham@1234');
await page.locator('button[type="submit"]').click();
  const errorMessage = page.getByText('Información incorrecta. Inténtalo de nuevo.');  
await expect(errorMessage).toBeVisible();
await expect(errorMessage).toHaveText('Información incorrecta. Inténtalo de nuevo.');
});

test('@TC003 UserId incorrect', async ({ page }) => {
    await page.goto('https://rcd.vnclever.com/login/');
    await page.fill('input[name="rcId"]', 'rcd2805..');
  await page.fill('input[name="userId"]', 'rcd2805');
  await page.fill('input[name="password"]', 'Cham@1234');
await page.locator('button[type="submit"]').click();
  const errorMessage = page.getByText('Información incorrecta. Inténtalo de nuevo.');  
await expect(errorMessage).toBeVisible();
await expect(errorMessage).toHaveText('Información incorrecta. Inténtalo de nuevo.');
});

test('@TC004 password incorrect', async ({ page }) => {
    await page.goto('https://rcd.vnclever.com/login/');
    await page.fill('input[name="rcId"]', 'rcd2805..');
  await page.fill('input[name="userId"]', 'rcd2805');
  await page.fill('input[name="password"]', 'Cham@1234');
await page.locator('button[type="submit"]').click();
  const errorMessage = page.getByText('Información incorrecta. Inténtalo de nuevo.');  
await expect(errorMessage).toBeVisible();
await expect(errorMessage).toHaveText('Información incorrecta. Inténtalo de nuevo.');
});
import { createDOM } from '@builder.io/qwik/testing';
import { test, expect } from 'vitest';
import { UiQwik } from './ui-qwik';

test(`[UiQwik Component]: Should render`, async () => {
  const { screen, render } = await createDOM();
  await render(<UiQwik />);
  expect(screen.innerHTML).toContain('UiQwik works!');
});

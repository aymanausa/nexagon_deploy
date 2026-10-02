// NEX-17-01 — Light/dark theme switcher (frontend layer)
import { useTheme } from './useTheme';

describe('NEX-17-01 — theme switcher', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('dark');
    useTheme.setState({ theme: 'dark' });
  });

  it('toggles from dark to light and removes the dark class', () => {
    useTheme.getState().toggleTheme();
    expect(useTheme.getState().theme).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('toggles back from light to dark and adds the dark class', () => {
    useTheme.setState({ theme: 'light' });
    useTheme.getState().toggleTheme();
    expect(useTheme.getState().theme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});

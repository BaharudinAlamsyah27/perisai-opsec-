import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Header, type ActiveTab } from '../../src/components/Header';

describe('Header navigation menu', () => {
  let onTabChange: ReturnType<typeof vi.fn<(tab: ActiveTab) => void>>;

  beforeEach(() => {
    onTabChange = vi.fn();
  });

  it('exposes the controlled menu and all navigation destinations', () => {
    render(<Header activeTab="analisis" onTabChange={onTabChange} />);
    const trigger = screen.getByRole('button', { name: 'Menu' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveAttribute('aria-controls', 'primary-menu');
    expect(trigger.parentElement).toHaveClass('ml-auto');
    expect(document.getElementById('primary-menu')?.hidden).toBe(true);

    fireEvent.click(trigger);
    const menu = screen.getByRole('menu', { name: 'Navigasi utama' });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(within(menu).getByRole('menuitem', { name: 'Pola Hidup' })).toBeInTheDocument();
    expect(within(menu).getByRole('menuitem', { name: 'Daftar Kritis' })).toBeInTheDocument();
    expect(within(menu).getByRole('menuitem', { name: 'Privasi' })).toBeInTheDocument();
    expect(within(menu).getByRole('menuitem', { name: 'Tentang' })).toBeInTheDocument();
    expect(within(menu).getByRole('menuitem', { name: 'Tentang' })).toHaveClass('min-h-11');
  });

  it('supports arrow-key movement between menu destinations', () => {
    render(<Header activeTab="analisis" onTabChange={onTabChange} />);
    const trigger = screen.getByRole('button', { name: 'Menu' });
    fireEvent.click(trigger);
    fireEvent.keyDown(document, { key: 'ArrowDown' });
    expect(screen.getByRole('menuitem', { name: 'Pola Hidup' })).toHaveFocus();
    fireEvent.keyDown(document, { key: 'ArrowDown' });
    expect(screen.getByRole('menuitem', { name: 'Daftar Kritis' })).toHaveFocus();
  });

  it('closes with Escape and restores focus to the menu button', async () => {
    render(<Header activeTab="analisis" onTabChange={onTabChange} />);
    const trigger = screen.getByRole('button', { name: 'Menu' });
    fireEvent.click(trigger);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('closes on outside click and after a destination is selected', async () => {
    render(<Header activeTab="analisis" onTabChange={onTabChange} />);
    const trigger = screen.getByRole('button', { name: 'Menu' });
    fireEvent.click(trigger);
    fireEvent.pointerDown(document.body);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await waitFor(() => expect(trigger).toHaveFocus());

    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole('menuitem', { name: 'Privasi' }));
    expect(onTabChange).toHaveBeenCalledWith('privasi');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await waitFor(() => expect(trigger).toHaveFocus());
  });
});

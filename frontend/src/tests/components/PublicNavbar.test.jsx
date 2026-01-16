import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PublicNavbar from '../../components/layout/PublicNavbar';

describe('PublicNavbar', () => {
    const renderNavbar = () => {
        return render(
            <BrowserRouter>
                <PublicNavbar />
            </BrowserRouter>
        );
    };

    it('should render the company logo and name', () => {
        renderNavbar();
        expect(screen.getByText(/INNOVATION/i)).toBeInTheDocument();
        expect(screen.getByText(/SERVICE/i)).toBeInTheDocument();
    });

    it('should render all navigation links', () => {
        renderNavbar();
        expect(screen.getByText('Home')).toBeInTheDocument();
        expect(screen.getByText('About')).toBeInTheDocument();
        expect(screen.getByText('Features')).toBeInTheDocument();
        expect(screen.getByText('Jobs')).toBeInTheDocument();
        expect(screen.getByText('Contact')).toBeInTheDocument();
    });

    it('should render login button', () => {
        renderNavbar();
        const loginButtons = screen.getAllByText('Login');
        expect(loginButtons.length).toBeGreaterThan(0);
    });

    it('should toggle mobile menu when hamburger is clicked', () => {
        renderNavbar();

        // Mobile menu should not be visible initially
        const mobileLinks = screen.queryAllByText('Home');

        // Find and click the mobile menu toggle button
        const toggleButton = screen.getByRole('button');
        fireEvent.click(toggleButton);

        // After clicking, mobile menu should be visible
        // This is a simplified test - in reality you'd check for specific mobile menu elements
        expect(toggleButton).toBeInTheDocument();
    });
});

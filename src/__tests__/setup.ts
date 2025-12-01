import '@testing-library/jest-dom'; // DOM elementleri için özel matcher'lar (toBeInTheDocument vb.)
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Her testten sonra sanal DOM'u temizle (Testler birbirini etkilemesin)
afterEach(() => {
    cleanup();
});
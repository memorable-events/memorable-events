
export interface User {
    phone: string;
    isVerified: boolean;
}

export enum ModalType {
    NONE = 'NONE',
    LOGIN = 'LOGIN',
    CREATE_EVENT = 'CREATE_EVENT',
    SEARCH = 'SEARCH',
    CONTACT = 'CONTACT',
    PORTFOLIO = 'PORTFOLIO',
    ADMIN_LOGIN = 'ADMIN_LOGIN',
    ADMIN_PANEL = 'ADMIN_PANEL',
    DECORATION = 'DECORATION',
}

export interface EventDetails {
    title: string;
    description: string;
    date: string;
    location: string;
}

export type ServiceMode = 'INDOOR' | 'OUTDOOR';

// Data structures for editable content
export interface Service {
    id: number;
    title: string;
    category: string;
    description: string;
    image: string;
    setups?: SetupImage[];
}

export interface Plan {
    id: number; // Added ID for DB
    name: string;
    price: string;
    description: string;
    hours: string;
    features: string[];
    extras: string[];
    image?: string;
}

export interface Cake {
    id: number;
    name: string;
    price: string;
    flavor: string;
    image: string;
}

export interface GalleryItem {
    id: number;
    title: string;
    category: string;
    image: string;
    className: string;
}

export interface SetupImage {
    id: number;
    src: string;
    title: string;
    price?: string;
}

export interface RealReel {
    id: number;
    embedUrl: string;
    thumbnail: string;
    caption: string;
    category: 'INDOOR' | 'OUTDOOR';
}

// API Response Types
export interface ContentResponse {
    indoorDecorations: Service[];
    outdoorDecorations: Service[];
    indoorPlans: Plan[];
    outdoorPlans: Plan[];
    cakes: Cake[];
    galleryItems: GalleryItem[];
    reels: RealReel[];
    settings?: {
        heroVideoUrl?: string;
    };
}

export interface LoginResponse {
    token: string;
}

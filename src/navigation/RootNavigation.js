import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export function navigate(name, params) {
    if (navigationRef.isReady()) {
        navigationRef.navigate(name, params);
    }
}

export function reset(name) {
    if (navigationRef.isReady()) {
        // Используем resetRoot вместо reset
        navigationRef.resetRoot({
            index: 0,
            routes: [{ name }],
        });
    }
}
import { getCookie } from 'typescript-cookie';

export const getAuthToken = () => {
    const auth_token = getCookie('authToken');
    return auth_token;
};
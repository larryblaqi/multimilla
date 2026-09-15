import { CapacitorHttp, HttpOptions, HttpResponse } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { getApiBaseUrl } from '../config';

export const useHttp = () => {
    const httpRequest = async (
        method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD',
        endpoint: string,
        data: any = {},
        additionalHeaders: Record<string, string> = {}
    ): Promise<HttpResponse> => {
        try {
            const { value: authToken } = await Preferences.get({ key: 'token' });
            const headers = {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
                ...additionalHeaders,
            };
            const apiBaseUrl = getApiBaseUrl();
            console.log(`Sending ${method} request to ${apiBaseUrl}${endpoint} with token: ${authToken?.substring(0, 10)}...`);
            const url = `${apiBaseUrl}${endpoint}`;
            const requestOptions: HttpOptions = {
                method,
                url,
                headers,
            };

            if (method !== 'GET' && method !== 'HEAD') {
                requestOptions.data = data;
            }

            const response: HttpResponse = await CapacitorHttp.request(requestOptions);
            
            // Log response for debugging in development
            if (import.meta.env.DEV) {
                console.log(`API ${method} ${endpoint}:`, {
                    status: response.status,
                    data: response.data
                });
            }
            
            return response;
        } catch (e: any) {
            console.error(`API ${method} ${endpoint} failed:`, e, "Status:", e.status, "Data:", e.data);
            
            // Enhanced error handling
            if (e.message?.includes('Network')) {
                throw new Error('Network error: Please check your internet connection');
            } else if (e.message?.includes('timeout')) {
                throw new Error('Request timeout: Please try again');
            } else if (e.status === 401) {
                throw new Error('Authentication failed: Please log in again');
            } else if (e.status === 403) {
                throw new Error('Access denied: You do not have permission');
            } else if (e.status >= 500) {
                throw new Error('Server error: Please try again later');
            } else {
                throw new Error(e.message || 'An unexpected error occurred');
            }
        }
    }

    return {
        httpRequest
    }
}
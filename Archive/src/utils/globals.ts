import { format, formatDistance, formatRelative } from "date-fns";

export const getInitials = (name) => {
    return name.charAt(0).toUpperCase();
};

export const formatNumber = (number) => {
    return number.toLocaleString();
};

export const formatMoney = (price: any) => {
    const formattedPrice = parseInt(price)
    return formattedPrice.toLocaleString() + '.00';

}


function generateRandomSuffix(length) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let suffix = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        suffix += charset[randomIndex];
    }
    return suffix;
}

export const generateRequestId = (suffixLength = 16) => {
    const currentDate = new Date()
    const year = currentDate.getFullYear()
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const day = currentDate.getDate().toString().padStart(2, '0');
    const hour = currentDate.getHours().toString().padStart(2, '0');
    const minutes = currentDate.getMinutes().toString().padStart(2, '0');

    const suffix = generateRandomSuffix(suffixLength);
    return `${year}${month}${day}${hour}${minutes}${suffix}`;
}

// Helper function to format date
export const formatTransactionDate = (dateString: string) => {
    try {
        return format(new Date(dateString), "MMM d, yyyy");
    } catch (error) {
        console.error("Invalid date format", error);
        return dateString;
    }
};

export const formatTimestamp = (timestamp: string) => {
    try {
        return formatDistance(new Date(timestamp), new Date(), { addSuffix: true });
    } catch (error) {
        console.error('Error formatting timestamp:', error);
        return timestamp;
    }
};
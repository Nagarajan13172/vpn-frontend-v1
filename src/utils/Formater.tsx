export const formatDataSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(2)} MB`;
    if (bytes < 1024 ** 4) return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
    return `${(bytes / 1024 ** 4).toFixed(2)} TB`;
};


export const formatTimeAgo = (timestamp: number | string | null) => {
    if (timestamp === "Never" || !timestamp) return 'Never';
    const now = Date.now();
    const secondsPast = (now - Number(timestamp) * 1000) / 1000; // Convert timestamp to milliseconds

    if (secondsPast < 60) return `${Math.floor(secondsPast)} seconds ago`;
    if (secondsPast < 3600) return `${Math.floor(secondsPast / 60)} minutes ago`;
    if (secondsPast < 86400) return `${Math.floor(secondsPast / 3600)} hours ago`;
    if (secondsPast < 2592000) return `${Math.floor(secondsPast / 86400)} days ago`;
    if (secondsPast < 31536000) return `${Math.floor(secondsPast / 2592000)} months ago`;
    return `${Math.floor(secondsPast / 31536000)} years ago`;
};


export const peerStatus = (timestamp: number) => {
    const now = Date.now();
    const secondsPast = (now - timestamp * 1000) / 1000; // Convert timestamp to milliseconds

    return secondsPast <= 120; // 120 seconds = 2 minutes
};
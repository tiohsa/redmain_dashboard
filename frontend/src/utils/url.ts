let urlRoot = '';

export const setUrlRoot = (root: string) => {
    // Remove trailing slash if present, unless it's just '/'
    urlRoot = root.endsWith('/') && root.length > 1 ? root.slice(0, -1) : root;
};

export const getUrlRoot = () => urlRoot;

export const getApiUrl = (path: string) => {
    const root = getUrlRoot();
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    // If root is empty or just '/', return path (preserving initial slash)
    if (!root || root === '/') {
        return cleanPath;
    }
    // Concatenate root and path
    return `${root}${cleanPath}`;
};

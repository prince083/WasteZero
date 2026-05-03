import { useState, useCallback } from 'react';

const useFileUpload = (options = {}) => {
    const {
        maxSize = 5 * 1024 * 1024, // 5MB default
        accept = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
    } = options;

    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [error, setError] = useState(null);

    const handleFileChange = useCallback((e) => {
        const selectedFile = e.target.files?.[0];
        setError(null);

        if (!selectedFile) {
            setFile(null);
            setPreview(null);
            return;
        }

        if (accept && !accept.includes(selectedFile.type)) {
            setError(`Invalid file type. Accepted types: ${accept.join(', ')}`);
            setFile(null);
            setPreview(null);
            return;
        }

        if (maxSize && selectedFile.size > maxSize) {
            setError(`File is too large. Maximum size is ${maxSize / (1024 * 1024)}MB`);
            setFile(null);
            setPreview(null);
            return;
        }

        setFile(selectedFile);
        
        // Create preview URL
        const objectUrl = URL.createObjectURL(selectedFile);
        setPreview(objectUrl);

        // Free memory when this object URL is no longer needed
        return () => URL.revokeObjectURL(objectUrl);
    }, [maxSize, accept]);

    const resetFile = useCallback(() => {
        setFile(null);
        setPreview(null);
        setError(null);
    }, []);

    return {
        file,
        preview,
        error,
        handleFileChange,
        resetFile,
        setPreview // expose this in case we need to show existing image
    };
};

export default useFileUpload;

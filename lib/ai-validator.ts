export const validateWithAI = async (username: string): Promise<boolean> => {
    try {
        const res = await fetch('/api/validate', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ username }),
        });
        if (!res.ok) return false;
        const data = (await res.json()) as { allow?: unknown };
        return data.allow === true;
    } catch {
        return false;
    }
};

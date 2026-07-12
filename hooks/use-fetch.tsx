import { useState } from "react";
import { toast } from "sonner";

const useFetch = <T, A extends unknown[]>(cb: (...args: A) => Promise<T>) => {
    const [data, setData] = useState<T | undefined>(undefined);
    const [loading, setLoading] = useState<boolean | null>(null);
    const [error, setError] = useState<Error | null>(null);

    const fn = async (...args: A) => {
        setLoading(true);
        setError(null);
        try {
            const response = await cb(...args);
            setData(response);
            setError(null);
        } catch (error) {
            setError(error as Error);
            toast.error((error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return { data, loading, error, fn, setData };
};

export default useFetch;
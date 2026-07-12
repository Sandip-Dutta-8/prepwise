import * as React from "react";

interface UseControlledStateProps<T> {
    value?: T;
    defaultValue?: T;
    onChange?: (next: T, ...args: unknown[]) => void;
}

export function useControlledState<T>(
    props: UseControlledStateProps<T>
): [T, (next: T, ...args: unknown[]) => void] {
    const { value, defaultValue, onChange } = props;

    const [state, setInternalState] = React.useState<T>(
        value !== undefined ? value : (defaultValue as T)
    );

    React.useEffect(() => {
        if (value !== undefined) setInternalState(value);
    }, [value]);

    const setState = React.useCallback(
        (next: T, ...args: unknown[]) => {
            setInternalState(next);
            onChange?.(next, ...args);
        },
        [onChange]
    );

    return [state, setState];
}
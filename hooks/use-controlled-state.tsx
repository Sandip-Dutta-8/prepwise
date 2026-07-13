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

    const [uncontrolledState, setUncontrolledState] = React.useState<T>(
        defaultValue as T
    );

    const isControlled = value !== undefined;
    const state = isControlled ? (value as T) : uncontrolledState;

    const setState = React.useCallback(
        (next: T, ...args: unknown[]) => {
            if (!isControlled) {
                setUncontrolledState(next);
            }
            onChange?.(next, ...args);
        },
        [isControlled, onChange]
    );

    return [state, setState];
}
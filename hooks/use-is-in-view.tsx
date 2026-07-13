import * as React from "react";
import { useInView } from "motion/react";

interface UseIsInViewOptions {
    inView?: boolean;
    inViewOnce?: boolean;
    inViewMargin?: string;
}

type UseInViewConfig = NonNullable<Parameters<typeof useInView>[1]>;

function useIsInView<T extends HTMLElement = HTMLElement>(
    ref: React.ForwardedRef<T>,
    options: UseIsInViewOptions = {}
) {
    const { inView, inViewOnce = false, inViewMargin = "0px" } = options;
    const localRef = React.useRef<T>(null);

    React.useImperativeHandle(ref, () => localRef.current as T);

    const inViewResult = useInView(localRef, {
        once: inViewOnce,
        margin: inViewMargin as UseInViewConfig["margin"],
    });

    const isInView = !inView || inViewResult;

    return { ref: localRef, isInView };
}

export { useIsInView };
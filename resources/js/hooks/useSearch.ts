// resources/js/hooks/useSearch.ts

import { router } from "@inertiajs/react";
import { useState } from "react";
import { route } from "ziggy-js";
import { useDebounceCallback } from "usehooks-ts";

/**
 * A custom hook to handle debounced searching for Inertia paginated tables.
 *
 * @param routeName The name of the Inertia route to visit (e.g., "superadmin.tdp.index")
 * @param initialValue The initial value of the search from the filters prop
 * @param queryKey The name of the query parameter to use (e.g., "search_ml" or "search_db")
 */
export function useSearch(routeName: string, initialValue: string = "", queryKey: string) {
    const [search, setSearch] = useState(initialValue);

    // Debounce the router visit to avoid spamming the server
    const debouncedSearch = useDebounceCallback((value: string) => {
        router.get(
            route(routeName),
            {
                [queryKey]: value || undefined, // Send 'undefined' to remove it from URL
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    }, 300); // 300ms delay

    const handleSearch = (value: string) => {
        setSearch(value);
        debouncedSearch(value);
    };

    return { search, handleSearch };
}
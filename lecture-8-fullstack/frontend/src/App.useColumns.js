import { useMemo } from "react"

export function useColumns() {
    return useMemo(
        () => [
            {
                Header: "id",
                accessor: "id",
            },
            {
                Header: "name",
                accessor: "name",
            },
            {
                Header: "species",
                accessor: "species",
            },
            {
                Header: "breed",
                accessor: "breed",
            },
            {
                Header: "age",
                accessor: "age",
            },
            {
                Header: "weight",
                accessor: "weight",
            },
        ],
        []
    )
}

export type KBDocument = {
    id: string,
    title: string,
    content?: string,
    created_at: number, // unix timestamp
    updated_at?: number, // unix timestamp
    idAuthor: string,
}

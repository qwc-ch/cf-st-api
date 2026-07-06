declare module '*?raw' {
    const content: string;
    export default content;
}

declare namespace App {
    interface Locals {
        user: { handle: string; admin: boolean } | null;
    }

    type PageData = {};

    interface Error {
        message: string;
        status?: number;
    }
}

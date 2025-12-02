export interface Item {
    id: number;
    name: string;
    examine?: string;
    members?: boolean;
    icon?: string;
    icon_large?: string;
    lowalch?: number;
    highalch?: number;
    limit?: number;
    value?: number;
}

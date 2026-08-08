export interface Tab { 
    to: string;
    label: string;
    protected?: boolean;
    icon: React.ComponentType<{ className?: string }>;
}

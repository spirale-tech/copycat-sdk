export declare enum AlertLevel {
    Information = 0,
    Warning = 1,
    Error = 2,
}
export declare class Alert {
    configID: number;
    alertID: number;
    nodeID: number;
    level: AlertLevel;
    alertDate: Date;
    message: string;
    active: boolean;
    newAlert: boolean;
    replicationCycleID?: string;
    replicationLogID?: string;
}

import { Db, FilterQuery } from "mongodb";
export declare function set(dump: {
    [key: string]: object[];
}, db: Db, {clear}?: {
    clear?: boolean;
}): Promise<void>;
export declare type MultiResult<T> = {
    [key: string]: T;
};
export declare function get(multiQuery: {
    [key: string]: FilterQuery<any>;
}, db: Db): Promise<MultiResult<object[]>>;

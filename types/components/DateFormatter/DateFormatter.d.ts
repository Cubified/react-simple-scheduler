/// <reference types="react" />
declare function date_format(date: Date, fmt: string): string;
declare function DateFormatter({ date, fmt }: {
    date: Date;
    fmt: string;
}): JSX.Element;
declare function DateRangeFormatter({ from, to }: {
    from: Date;
    to: Date;
}): JSX.Element;
export { DateFormatter, DateRangeFormatter, date_format };

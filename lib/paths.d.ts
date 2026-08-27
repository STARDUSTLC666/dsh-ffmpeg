/** 校验输入文件存在且是文件；返回绝对路径。 */
export declare function assertInputFile(input: string): string;
/** 清洗文件名中的危险字符。 */
export declare function sanitizeName(name: string): string;
/**
 * 决定输出路径：缺省时放在输入同目录，名字 = 输入名 + suffix + ext。
 * 目标已存在且不允许覆写时自动追加 _1/_2…。
 */
export declare function resolveOutputPath(input: string, explicit: string | undefined, suffix: string, ext: string, overwrite: boolean): string;

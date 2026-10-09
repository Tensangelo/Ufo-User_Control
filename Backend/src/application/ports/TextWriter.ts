export interface TextWriter {
	write(chunk: string): void | Promise<void>;
}

export type ActionHandler<R> = (
  id?: string,
  value?: string,
  openOrCloseModal?: "open" | "close",
) => Promise<R>;

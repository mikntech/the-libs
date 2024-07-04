export class ClientError extends Error {
  constructor(
    public override message: string,
    public code: number,
  ) {
    super(message);
    this.name = 'ClientError';
    this.code = code;
  }
}

export class ClientError extends Error {
  constructor(
    public override message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = 'ClientError';
    this.statusCode = statusCode;
  }
}

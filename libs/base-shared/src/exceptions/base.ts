export class ClientError extends Error {
  constructor(
    public override message: string,
    public statusCode: number = 400,
  ) {
    super(message);
    this.name = 'ClientError';
    this.statusCode = statusCode;
  }
}

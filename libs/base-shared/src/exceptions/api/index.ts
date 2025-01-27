import { ClientError } from '../base';

export class InvalidInputError extends ClientError {
  constructor(public resourceName: string) {
    super(`${resourceName} is invalid`, 400);
    this.name = 'InvalidInputError';
  }
}

export class InvalidEnumError extends ClientError {
  constructor(
    public resourceName: string,
    public enumValues: string[],
  ) {
    super(
      `${resourceName} is invalid, it must be one of these values: ${enumValues.join(', ')}`,
      400,
    );
    this.name = 'InvalidEnumError';
  }
}

export class ResourceNotFoundError extends ClientError {
  constructor(public resourceName: string) {
    super(`${resourceName} couldn't be found`, 404);
    this.name = 'ResourceNotFoundError';
  }
}

export class UnauthorizedError extends ClientError {
  constructor(
    public customMessage = 'You are unauthorized to do this operation',
  ) {
    super(customMessage, 401);
    this.name = 'UnauthorizedError';
  }
}

export class NotLoggedInError extends UnauthorizedError {
  constructor() {
    super(
      'This endpoint requires authentication, but you are either not logged in or your token could not be parsed',
    );
    this.name = 'NotLoggedInError';
  }
}

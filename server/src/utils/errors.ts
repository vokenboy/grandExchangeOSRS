export class ApiError extends Error {
    status: number;
    constructor(message: string, status: number) {
        super(message);
        this.name = "ApiError";
        this.status = status;
    }
}

export class BadRequestError extends ApiError {
    constructor(message = "Bad request") {
        super(message, 400);
        this.name = "BadRequestError";
    }
}

export class NotFoundError extends ApiError {
    constructor(message = "Resource not found") {
        super(message, 404);
        this.name = "NotFoundError";
    }
}

export class UpstreamError extends ApiError {
    constructor(message: string, status?: number) {
        super(message, status ?? 502);
        this.name = "UpstreamError";
    }
}
